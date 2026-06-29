#!/usr/bin/env bun

import { createSign } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

type JsonRecord = Record<string, unknown>;

type QueryResult<T> = {
  ok: boolean;
  query: string;
  rows: T[];
  error?: string;
};

type GoogleAdsRow = {
  customer?: JsonRecord;
  campaign?: JsonRecord;
  adGroup?: JsonRecord;
  adGroupAd?: {
    status?: string;
    policySummary?: {
      approvalStatus?: string;
      reviewStatus?: string;
    };
    ad?: JsonRecord;
  };
  conversionAction?: JsonRecord;
  metrics?: {
    impressions?: string;
    clicks?: string;
    costMicros?: string;
    conversions?: number | string;
    allConversions?: number | string;
    ctr?: number | string;
    averageCpc?: number | string;
  };
};

const requiredBaseEnv = ["GOOGLE_ADS_DEVELOPER_TOKEN", "GOOGLE_ADS_CUSTOMER_ID"];
const oauthEnv = ["GOOGLE_ADS_CLIENT_ID", "GOOGLE_ADS_CLIENT_SECRET", "GOOGLE_ADS_REFRESH_TOKEN"];
const serviceAccountEnv = ["GOOGLE_ADS_SERVICE_ACCOUNT_JSON", "GOOGLE_ADS_SERVICE_ACCOUNT_KEY_FILE"];
const scope = "https://www.googleapis.com/auth/adwords";

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  return Bun.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

function env(name: string): string | undefined {
  const value = Bun.env[name]?.trim();
  return value ? value : undefined;
}

function normalizeCustomerId(value: string | undefined): string | undefined {
  return value?.replace(/-/g, "").trim();
}

function base64Url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function numberValue(value: unknown): number {
  if (value === undefined || value === null || value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function summarizeError(text: string): string {
  try {
    const parsed = JSON.parse(text) as JsonRecord;
    const error = parsed.error as JsonRecord | undefined;
    const message = error?.message;
    if (typeof message === "string") return message;
  } catch {
    // Fall through to text summary.
  }

  return text.slice(0, 700);
}

function serviceAccountJson(): JsonRecord | undefined {
  const inline = env("GOOGLE_ADS_SERVICE_ACCOUNT_JSON");
  if (inline) return JSON.parse(inline) as JsonRecord;

  const file = env("GOOGLE_ADS_SERVICE_ACCOUNT_KEY_FILE");
  if (!file || !existsSync(file)) return undefined;

  return JSON.parse(readFileSync(file, "utf8")) as JsonRecord;
}

async function accessTokenFromRefreshToken(): Promise<{ token: string; mode: string }> {
  const body = new URLSearchParams({
    client_id: env("GOOGLE_ADS_CLIENT_ID") ?? "",
    client_secret: env("GOOGLE_ADS_CLIENT_SECRET") ?? "",
    refresh_token: env("GOOGLE_ADS_REFRESH_TOKEN") ?? "",
    grant_type: "refresh_token",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`OAuth refresh-token exchange failed: ${summarizeError(text)}`);
  }

  const parsed = JSON.parse(text) as { access_token?: string };
  if (!parsed.access_token) throw new Error("OAuth response did not include an access token.");
  return { token: parsed.access_token, mode: "oauth_refresh_token" };
}

async function accessTokenFromServiceAccount(): Promise<{ token: string; mode: string }> {
  const key = serviceAccountJson();
  const clientEmail = key?.client_email;
  const privateKey = key?.private_key;

  if (typeof clientEmail !== "string" || typeof privateKey !== "string") {
    throw new Error("Service account JSON must include client_email and private_key.");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64Url(JSON.stringify({
    iss: clientEmail,
    scope,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const unsignedJwt = `${header}.${claims}`;
  const signature = createSign("RSA-SHA256").update(unsignedJwt).sign(privateKey);
  const assertion = `${unsignedJwt}.${base64Url(signature)}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Service-account token exchange failed: ${summarizeError(text)}`);
  }

  const parsed = JSON.parse(text) as { access_token?: string };
  if (!parsed.access_token) throw new Error("Service-account response did not include an access token.");
  return { token: parsed.access_token, mode: "service_account" };
}

function authReady(): boolean {
  if (oauthEnv.every((name) => env(name))) return true;
  if (env("GOOGLE_ADS_SERVICE_ACCOUNT_JSON")) return true;
  const file = env("GOOGLE_ADS_SERVICE_ACCOUNT_KEY_FILE");
  return Boolean(file && existsSync(file));
}

function missingEnvironment(): string[] {
  const missing = requiredBaseEnv.filter((name) => !env(name));
  if (!authReady()) {
    missing.push(
      "one auth path: GOOGLE_ADS_CLIENT_ID + GOOGLE_ADS_CLIENT_SECRET + GOOGLE_ADS_REFRESH_TOKEN, or GOOGLE_ADS_SERVICE_ACCOUNT_JSON / GOOGLE_ADS_SERVICE_ACCOUNT_KEY_FILE",
    );
  }
  return missing;
}

async function getAccessToken(): Promise<{ token: string; mode: string }> {
  if (env("GOOGLE_ADS_SERVICE_ACCOUNT_JSON") || env("GOOGLE_ADS_SERVICE_ACCOUNT_KEY_FILE")) {
    return accessTokenFromServiceAccount();
  }

  return accessTokenFromRefreshToken();
}

async function runQuery<T extends GoogleAdsRow>(
  queryName: string,
  query: string,
  token: string,
  apiVersion: string,
  customerId: string,
  loginCustomerId: string | undefined,
): Promise<QueryResult<T>> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "developer-token": env("GOOGLE_ADS_DEVELOPER_TOKEN") ?? "",
    "Content-Type": "application/json",
  };
  if (loginCustomerId) headers["login-customer-id"] = loginCustomerId;

  const response = await fetch(`https://googleads.googleapis.com/${apiVersion}/customers/${customerId}/googleAds:searchStream`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query }),
  });
  const text = await response.text();
  if (!response.ok) {
    return { ok: false, query: queryName, rows: [], error: `${response.status}: ${summarizeError(text)}` };
  }

  try {
    const chunks = JSON.parse(text) as Array<{ results?: T[] }>;
    return {
      ok: true,
      query: queryName,
      rows: chunks.flatMap((chunk) => chunk.results ?? []),
    };
  } catch (error) {
    return {
      ok: false,
      query: queryName,
      rows: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function campaignTotals(rows: GoogleAdsRow[]): JsonRecord {
  const totals = rows.reduce(
    (acc, row) => {
      acc.impressions += numberValue(row.metrics?.impressions);
      acc.clicks += numberValue(row.metrics?.clicks);
      acc.costMicros += numberValue(row.metrics?.costMicros);
      acc.conversions += numberValue(row.metrics?.conversions);
      acc.allConversions += numberValue(row.metrics?.allConversions);
      return acc;
    },
    { impressions: 0, clicks: 0, costMicros: 0, conversions: 0, allConversions: 0 },
  );

  return {
    impressions: totals.impressions,
    clicks: totals.clicks,
    cost: Number((totals.costMicros / 1_000_000).toFixed(2)),
    conversions: Number(totals.conversions.toFixed(2)),
    allConversions: Number(totals.allConversions.toFixed(2)),
    ctr: totals.impressions > 0 ? Number((totals.clicks / totals.impressions).toFixed(4)) : 0,
    cpc: totals.clicks > 0 ? Number((totals.costMicros / 1_000_000 / totals.clicks).toFixed(2)) : 0,
  };
}

function groupCount<T extends GoogleAdsRow>(rows: T[], getter: (row: T) => string | undefined): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const key = getter(row) ?? "UNKNOWN";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function topCampaigns(rows: GoogleAdsRow[]): JsonRecord[] {
  return rows
    .map((row) => ({
      id: row.campaign?.id,
      name: row.campaign?.name,
      status: row.campaign?.status,
      channel: row.campaign?.advertisingChannelType,
      servingStatus: row.campaign?.servingStatus,
      impressions: numberValue(row.metrics?.impressions),
      clicks: numberValue(row.metrics?.clicks),
      cost: Number((numberValue(row.metrics?.costMicros) / 1_000_000).toFixed(2)),
      conversions: numberValue(row.metrics?.conversions),
    }))
    .sort((a, b) => (numberValue(b.impressions) + numberValue(b.cost) * 100) - (numberValue(a.impressions) + numberValue(a.cost) * 100))
    .slice(0, 12);
}

async function main(): Promise<void> {
  const checkedAt = new Date().toISOString();
  const apiVersion = arg("version") ?? env("GOOGLE_ADS_API_VERSION") ?? "v24";
  const customerId = normalizeCustomerId(arg("customer") ?? env("GOOGLE_ADS_CUSTOMER_ID"));
  const loginCustomerId = normalizeCustomerId(arg("login-customer") ?? env("GOOGLE_ADS_LOGIN_CUSTOMER_ID"));
  const missingEnv = missingEnvironment();

  if (missingEnv.length || !customerId) {
    console.log(JSON.stringify({
      ok: false,
      configured: false,
      checkedAt,
      apiVersion,
      missingEnv,
      requiredEnv: {
        base: requiredBaseEnv,
        oauthRefreshTokenAuth: oauthEnv,
        serviceAccountAuth: serviceAccountEnv,
        optional: ["GOOGLE_ADS_LOGIN_CUSTOMER_ID", "GOOGLE_ADS_API_VERSION"],
      },
      notes: [
        "This script is read-only and does not create, pause, edit, or delete ads.",
        "Store credentials in the local shell/secrets layer, not in the repo.",
      ],
    }, null, 2));
    return;
  }

  const currentRange = { from: isoDaysAgo(6), to: isoDaysAgo(0) };
  const previousRange = { from: isoDaysAgo(13), to: isoDaysAgo(7) };

  try {
    const auth = await getAccessToken();

    const accountQuery = "SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone, customer.status FROM customer LIMIT 1";
    const campaignStatusQuery = "SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, campaign.serving_status, campaign.start_date, campaign.end_date FROM campaign WHERE campaign.status != REMOVED LIMIT 100";
    const campaignMetricsQuery = (range: { from: string; to: string }) =>
      `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, campaign.serving_status, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.all_conversions, metrics.ctr, metrics.average_cpc FROM campaign WHERE segments.date BETWEEN '${range.from}' AND '${range.to}' ORDER BY metrics.impressions DESC LIMIT 100`;
    const adPolicyQuery = "SELECT campaign.id, campaign.name, ad_group.id, ad_group.name, ad_group_ad.ad.id, ad_group_ad.status, ad_group_ad.policy_summary.approval_status, ad_group_ad.policy_summary.review_status FROM ad_group_ad WHERE ad_group_ad.status != REMOVED LIMIT 100";
    const conversionActionQuery = "SELECT conversion_action.id, conversion_action.name, conversion_action.status, conversion_action.type, conversion_action.category, conversion_action.primary_for_goal FROM conversion_action WHERE conversion_action.status != REMOVED LIMIT 100";

    const [account, campaignStatus, currentCampaigns, previousCampaigns, adPolicy, conversionActions] = await Promise.all([
      runQuery<GoogleAdsRow>("account", accountQuery, auth.token, apiVersion, customerId, loginCustomerId),
      runQuery<GoogleAdsRow>("campaign_status", campaignStatusQuery, auth.token, apiVersion, customerId, loginCustomerId),
      runQuery<GoogleAdsRow>("campaign_metrics_current_7d", campaignMetricsQuery(currentRange), auth.token, apiVersion, customerId, loginCustomerId),
      runQuery<GoogleAdsRow>("campaign_metrics_previous_7d", campaignMetricsQuery(previousRange), auth.token, apiVersion, customerId, loginCustomerId),
      runQuery<GoogleAdsRow>("ad_policy_review", adPolicyQuery, auth.token, apiVersion, customerId, loginCustomerId),
      runQuery<GoogleAdsRow>("conversion_actions", conversionActionQuery, auth.token, apiVersion, customerId, loginCustomerId),
    ]);

    const queries = [account, campaignStatus, currentCampaigns, previousCampaigns, adPolicy, conversionActions];
    const queryErrors = queries.filter((result) => !result.ok).map((result) => ({
      query: result.query,
      error: result.error,
    }));

    console.log(JSON.stringify({
      ok: queryErrors.length === 0,
      configured: true,
      checkedAt,
      apiVersion,
      authMode: auth.mode,
      customerId,
      loginCustomerId,
      dateRanges: {
        current7d: currentRange,
        previous7d: previousRange,
      },
      account: account.rows[0]?.customer ?? null,
      campaignStatus: {
        ok: campaignStatus.ok,
        total: campaignStatus.rows.length,
        byStatus: groupCount(campaignStatus.rows, (row) => row.campaign?.status as string | undefined),
        byServingStatus: groupCount(campaignStatus.rows, (row) => row.campaign?.servingStatus as string | undefined),
      },
      performance: {
        current7d: campaignTotals(currentCampaigns.rows),
        previous7d: campaignTotals(previousCampaigns.rows),
        topCampaigns: topCampaigns(currentCampaigns.rows),
      },
      adReview: {
        ok: adPolicy.ok,
        total: adPolicy.rows.length,
        byStatus: groupCount(adPolicy.rows, (row) => row.adGroupAd?.status),
        byApprovalStatus: groupCount(adPolicy.rows, (row) => row.adGroupAd?.policySummary?.approvalStatus),
        byReviewStatus: groupCount(adPolicy.rows, (row) => row.adGroupAd?.policySummary?.reviewStatus),
      },
      conversionActions: {
        ok: conversionActions.ok,
        total: conversionActions.rows.length,
        byStatus: groupCount(conversionActions.rows, (row) => row.conversionAction?.status as string | undefined),
        byCategory: groupCount(conversionActions.rows, (row) => row.conversionAction?.category as string | undefined),
      },
      queryErrors,
    }, null, 2));
  } catch (error) {
    console.log(JSON.stringify({
      ok: false,
      configured: true,
      checkedAt,
      apiVersion,
      customerId,
      loginCustomerId,
      error: error instanceof Error ? error.message : String(error),
    }, null, 2));
  }
}

await main();
