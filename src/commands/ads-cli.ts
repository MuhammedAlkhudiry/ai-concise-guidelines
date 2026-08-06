#!/usr/bin/env bun

import { execa } from "execa";
import { cac } from "cac";

import {
  adsCampaigns,
  adsProjects,
  adsStats,
  adsStatus,
  parseCampaign,
  parsePeriod,
  parsePlatform,
  parseProject,
  platformDashboard,
} from "../lib/ads";

type CommonOptions = {
  json?: boolean;
  platform?: string;
  project?: string;
  refresh?: boolean;
};

const cli = cac("ads");

cli
  .command("projects", "List configured advertising projects")
  .option("--json", "Print the stable JSON contract")
  .action((options: { json?: boolean }) => output(adsProjects(), options.json));

cli
  .command("status", "Show advertising account and API readiness")
  .option("--platform <name>", "Limit the result to one platform")
  .option("--project <id>", "Limit the result to one configured project")
  .option("--refresh", "Bypass the local fifteen-minute cache")
  .option("--json", "Print the stable JSON contract")
  .action(async (options: CommonOptions) => {
    const document = await adsStatus({
      platform: parsePlatform(options.platform),
      project: parseProject(options.project),
      refresh: options.refresh,
    });
    output(document, options.json);
  });

cli
  .command("stats", "Show read-only advertising performance")
  .option("--period <period>", "Reporting window: 7d or 30d", { default: "7d" })
  .option("--platform <name>", "Limit the result to one platform")
  .option("--project <id>", "Limit the result to one configured project")
  .option("--campaign <id>", "Limit the result to one campaign")
  .option("--refresh", "Bypass the local fifteen-minute cache")
  .option("--json", "Print the stable JSON contract")
  .action(async (options: CommonOptions & { campaign?: string | number; period?: string }) => {
    const document = await adsStats({
      period: parsePeriod(options.period),
      platform: parsePlatform(options.platform),
      project: parseProject(options.project),
      campaign: parseCampaign(options.campaign),
      refresh: options.refresh,
    });
    output(document, options.json);
  });

cli
  .command("campaigns", "List campaigns without changing advertising accounts")
  .option("--active", "Return active campaigns only")
  .option("--platform <name>", "Limit the result to one platform")
  .option("--project <id>", "Limit the result to one configured project")
  .option("--refresh", "Bypass the local fifteen-minute cache")
  .option("--json", "Print the stable JSON contract")
  .action(async (options: CommonOptions & { active?: boolean }) => {
    const document = await adsCampaigns({
      activeOnly: Boolean(options.active),
      platform: parsePlatform(options.platform),
      project: parseProject(options.project),
      refresh: options.refresh,
    });
    output(document, options.json);
  });

cli
  .command("open <platform>", "Open a platform's native advertising dashboard")
  .action(async (platform: string) => {
    await execa("open", [platformDashboard(parsePlatform(platform)!)], { stdio: "inherit" });
  });

cli.help();
cli.addEventListener("command:*", () => {
  console.error(`Unknown command: ${cli.args.join(" ")}`);
  process.exitCode = 1;
});

try {
  cli.parse();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

function output(document: object, json = false): void {
  if (json) {
    console.log(JSON.stringify(document, null, 2));
    return;
  }
  if ("projects" in document && Array.isArray(document.projects)) {
    for (const project of document.projects) {
      console.log(
        `${project.name}: ${project.platforms.length ? project.platforms.join(", ") : "no mapped platforms"}`,
      );
    }
    return;
  }
  if ("platforms" in document && Array.isArray(document.platforms)) {
    for (const platform of document.platforms) {
      const account = platform.account ? ` · ${platform.account.name || platform.account.id}` : "";
      const campaigns = Array.isArray(platform.campaigns)
        ? ` · ${platform.campaigns.length} campaigns`
        : "";
      const metrics = platform.metrics
        ? ` · ${platform.metrics.impressions} impressions · ${platform.metrics.clicks} clicks · ${platform.metrics.spend} ${platform.account?.currency || ""}`
        : "";
      console.log(
        `${platform.platformName}: ${platform.state}${account}${campaigns}${metrics}${platform.message ? ` · ${platform.message}` : ""}`,
      );
    }
  }
}
