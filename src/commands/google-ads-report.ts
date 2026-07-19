#!/usr/bin/env bun

export {};

type GoogleAdsConfig = {
  apiVersion: string;
  clientId: string;
  clientSecret: string;
  customerId: string;
  developerToken: string;
  loginCustomerId?: string;
  refreshToken: string;
};

type GoogleAdsRow = {
  adGroup?: {
    id?: string;
    name?: string;
    primaryStatus?: string;
    primaryStatusReasons?: string[];
    status?: string;
  };
  adGroupAd?: {
    ad?: { id?: string };
    policySummary?: {
      approvalStatus?: string;
      reviewStatus?: string;
    };
    primaryStatus?: string;
    primaryStatusReasons?: string[];
    status?: string;
  };
  campaign?: {
    advertisingChannelSubType?: string;
    advertisingChannelType?: string;
    biddingStrategyType?: string;
    id?: string;
    name?: string;
    primaryStatus?: string;
    primaryStatusReasons?: string[];
    status?: string;
  };
  campaignBudget?: {
    amountMicros?: string;
  };
  customer?: {
    currencyCode?: string;
    descriptiveName?: string;
    id?: string;
    timeZone?: string;
  };
  metrics?: {
    allConversions?: number | string;
    biddableAppInstallConversions?: number | string;
    clicks?: string;
    conversions?: number | string;
    costMicros?: string;
    impressions?: string;
    viewThroughConversions?: number | string;
  };
};

type DateRange = {
  from: string;
  to: string;
};

type CampaignPerformance = {
  allConversions: number;
  clicks: number;
  conversions: number;
  cost: number;
  costPerInstall: number | null;
  impressions: number;
  installs: number;
  viewThroughConversions: number;
};

const requiredEnvNames = [
  "GOOGLE_ADS_API_VERSION",
  "GOOGLE_ADS_CLIENT_ID",
  "GOOGLE_ADS_CLIENT_SECRET",
  "GOOGLE_ADS_CUSTOMER_ID",
  "GOOGLE_ADS_DEVELOPER_TOKEN",
  "GOOGLE_ADS_REFRESH_TOKEN",
] as const;

try {
  const args = parseArgs(process.argv.slice(2));
  const config = getConfig();
  const campaignId = requiredArg(args, "campaign-id").replaceAll("-", "");
  const days = positiveInteger(args.get("days") ?? "3", "days");
  const accessToken = await getAccessToken(config);
  const queryErrors: Array<{ query: string; error: string }> = [];

  const customerRows = await queryGoogleAds(
    config,
    accessToken,
    "SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone FROM customer LIMIT 1",
  );
  const customer = customerRows[0]?.customer;

  if (!customer?.timeZone) {
    throw new Error("Google Ads did not return the customer time zone.");
  }

  const recentTo =
    args.get("through") ?? previousDate(dateInTimeZone(new Date(), customer.timeZone), 1);
  const recent = dateRangeEnding(recentTo, days);
  const previous = dateRangeEnding(previousDate(recent.from, 1), days);

  const campaignRows = await queryGoogleAds(
    config,
    accessToken,
    `SELECT campaign.id, campaign.name, campaign.status, campaign.primary_status, campaign.primary_status_reasons, campaign.advertising_channel_type, campaign.advertising_channel_sub_type, campaign.bidding_strategy_type, campaign_budget.amount_micros FROM campaign WHERE campaign.id = ${campaignId} LIMIT 1`,
  );
  const campaignRow = campaignRows[0];

  if (!campaignRow?.campaign) {
    throw new Error(`Campaign ${campaignId} was not found in customer ${config.customerId}.`);
  }

  const deliveryRows = await queryGoogleAds(
    config,
    accessToken,
    `SELECT segments.date, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.all_conversions, metrics.biddable_app_install_conversions, metrics.view_through_conversions FROM campaign WHERE campaign.id = ${campaignId} AND segments.date BETWEEN '${previous.from}' AND '${recent.to}'`,
  );
  const recentPerformance = summarizePerformance(
    deliveryRows.filter((row) => inRange(row, recent)),
  );
  const previousPerformance = summarizePerformance(
    deliveryRows.filter((row) => inRange(row, previous)),
  );

  const adGroups = await optionalQuery(
    "ad-groups",
    `SELECT ad_group.id, ad_group.name, ad_group.status, ad_group.primary_status, ad_group.primary_status_reasons FROM ad_group WHERE campaign.id = ${campaignId}`,
  );
  const ads = await optionalQuery(
    "ad-policy",
    `SELECT ad_group_ad.ad.id, ad_group_ad.status, ad_group_ad.primary_status, ad_group_ad.primary_status_reasons, ad_group_ad.policy_summary.approval_status, ad_group_ad.policy_summary.review_status FROM ad_group_ad WHERE campaign.id = ${campaignId}`,
  );

  const dailyBudget = microsToCurrency(campaignRow.campaignBudget?.amountMicros);
  const recentBudget = dailyBudget * days;

  console.log(
    JSON.stringify(
      {
        ok: true,
        configured: true,
        authMode: "oauth-refresh-token",
        apiVersion: config.apiVersion,
        customer: {
          id: customer.id ?? config.customerId,
          name: customer.descriptiveName ?? null,
          currencyCode: customer.currencyCode ?? null,
          timeZone: customer.timeZone,
          loginCustomerId: config.loginCustomerId ?? null,
        },
        campaign: {
          id: campaignRow.campaign.id,
          name: campaignRow.campaign.name,
          status: campaignRow.campaign.status,
          primaryStatus: campaignRow.campaign.primaryStatus,
          primaryStatusReasons: campaignRow.campaign.primaryStatusReasons ?? [],
          advertisingChannelType: campaignRow.campaign.advertisingChannelType,
          advertisingChannelSubType: campaignRow.campaign.advertisingChannelSubType,
          biddingStrategyType: campaignRow.campaign.biddingStrategyType,
          dailyBudget,
          monthlyBudgetCap: dailyBudget * 30.4,
        },
        ranges: { recent, previous },
        performance: {
          recent: recentPerformance,
          previous: previousPerformance,
          change: comparePerformance(recentPerformance, previousPerformance),
          budgetPacing: {
            expectedForRecentRange: recentBudget,
            spent: recentPerformance.cost,
            utilization: recentBudget ? recentPerformance.cost / recentBudget : null,
          },
        },
        adGroups: adGroups.map((row) => ({
          id: row.adGroup?.id,
          name: row.adGroup?.name,
          status: row.adGroup?.status,
          primaryStatus: row.adGroup?.primaryStatus,
          primaryStatusReasons: row.adGroup?.primaryStatusReasons ?? [],
        })),
        ads: ads.map((row) => ({
          id: row.adGroupAd?.ad?.id,
          status: row.adGroupAd?.status,
          primaryStatus: row.adGroupAd?.primaryStatus,
          primaryStatusReasons: row.adGroupAd?.primaryStatusReasons ?? [],
          approvalStatus: row.adGroupAd?.policySummary?.approvalStatus,
          reviewStatus: row.adGroupAd?.policySummary?.reviewStatus,
        })),
        queryErrors,
      },
      null,
      2,
    ),
  );

  async function optionalQuery(label: string, query: string): Promise<GoogleAdsRow[]> {
    try {
      return await queryGoogleAds(config, accessToken, query);
    } catch (error) {
      queryErrors.push({ query: label, error: errorMessage(error) });
      return [];
    }
  }
} catch (error) {
  console.log(
    JSON.stringify(
      {
        ok: false,
        configured: hasRequiredConfig(),
        error: errorMessage(error),
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}

function getConfig(): GoogleAdsConfig {
  const missing = requiredEnvNames.filter((name) => !process.env[name]);

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  return {
    apiVersion: process.env.GOOGLE_ADS_API_VERSION!,
    clientId: process.env.GOOGLE_ADS_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
    customerId: normalizeCustomerId(process.env.GOOGLE_ADS_CUSTOMER_ID!),
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    loginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID
      ? normalizeCustomerId(process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID)
      : undefined,
    refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
  };
}

function hasRequiredConfig(): boolean {
  return requiredEnvNames.every((name) => Boolean(process.env[name]));
}

async function getAccessToken(config: GoogleAdsConfig): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const body = (await response.json()) as { access_token?: string; error?: string };

  if (!response.ok || !body.access_token) {
    throw new Error(
      `OAuth token refresh failed (${response.status}): ${body.error ?? "unknown_error"}`,
    );
  }

  return body.access_token;
}

async function queryGoogleAds(
  config: GoogleAdsConfig,
  accessToken: string,
  query: string,
): Promise<GoogleAdsRow[]> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "developer-token": config.developerToken,
  };

  if (config.loginCustomerId) {
    headers["login-customer-id"] = config.loginCustomerId;
  }

  const response = await fetch(
    `https://googleads.googleapis.com/${config.apiVersion}/customers/${config.customerId}/googleAds:searchStream`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ query }),
    },
  );
  const body = (await response.json()) as
    | Array<{ results?: GoogleAdsRow[] }>
    | {
        error?: { message?: string; status?: string };
      };

  if (!response.ok || !Array.isArray(body)) {
    const apiError = Array.isArray(body) ? undefined : body.error;
    throw new Error(
      `Google Ads query failed (${response.status}): ${apiError?.status ?? "unknown"}${apiError?.message ? ` - ${apiError.message}` : ""}`,
    );
  }

  return body.flatMap((batch) => batch.results ?? []);
}

function summarizePerformance(rows: GoogleAdsRow[]): CampaignPerformance {
  const totals = rows.reduce(
    (summary, row) => {
      const metrics = row.metrics ?? {};
      summary.allConversions += numberValue(metrics.allConversions);
      summary.clicks += numberValue(metrics.clicks);
      summary.conversions += numberValue(metrics.conversions);
      summary.cost += microsToCurrency(metrics.costMicros);
      summary.impressions += numberValue(metrics.impressions);
      summary.installs += numberValue(metrics.biddableAppInstallConversions);
      summary.viewThroughConversions += numberValue(metrics.viewThroughConversions);
      return summary;
    },
    {
      allConversions: 0,
      clicks: 0,
      conversions: 0,
      cost: 0,
      impressions: 0,
      installs: 0,
      viewThroughConversions: 0,
    },
  );

  return {
    ...totals,
    cost: round(totals.cost),
    costPerInstall: totals.installs ? round(totals.cost / totals.installs) : null,
  };
}

function comparePerformance(current: CampaignPerformance, previous: CampaignPerformance) {
  return {
    cost: change(current.cost, previous.cost),
    impressions: change(current.impressions, previous.impressions),
    clicks: change(current.clicks, previous.clicks),
    installs: change(current.installs, previous.installs),
    conversions: change(current.conversions, previous.conversions),
    costPerInstall: change(current.costPerInstall, previous.costPerInstall),
  };
}

function change(current: number | null, previous: number | null) {
  if (current === null || previous === null) return { absolute: null, percent: null };
  if (!previous) return { absolute: round(current), percent: current ? null : 0 };
  return {
    absolute: round(current - previous),
    percent: round((current - previous) / previous),
  };
}

function inRange(row: GoogleAdsRow, range: DateRange): boolean {
  const date = (row as GoogleAdsRow & { segments?: { date?: string } }).segments?.date;
  return Boolean(date && date >= range.from && date <= range.to);
}

function dateInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function dateRangeEnding(to: string, days: number): DateRange {
  return { from: previousDate(to, days - 1), to };
}

function previousDate(date: string, days: number): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() - days);
  return parsed.toISOString().slice(0, 10);
}

function microsToCurrency(value: string | undefined): number {
  return numberValue(value) / 1_000_000;
}

function numberValue(value: number | string | undefined): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function round(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

function normalizeCustomerId(value: string): string {
  return value.replaceAll("-", "");
}

function positiveInteger(value: string, name: string): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) {
    throw new Error(`--${name} must be a positive integer.`);
  }
  return number;
}

function requiredArg(args: URLSearchParams, name: string): string {
  const value = args.get(name);
  if (!value) throw new Error(`Missing required argument --${name}.`);
  return value;
}

function parseArgs(values: string[]): URLSearchParams {
  const args = new URLSearchParams();

  for (let index = 0; index < values.length; index += 1) {
    const argument = values[index];
    if (!argument?.startsWith("--")) continue;
    const name = argument.slice(2);
    const value = values[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${name}.`);
    }
    args.set(name, value);
    index += 1;
  }

  return args;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
