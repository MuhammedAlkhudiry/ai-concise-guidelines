#!/usr/bin/env bun

import { cac } from "cac";

import { knowledgeCheck, knowledgeFeature, knowledgeInit, knowledgeList } from "./knowledge";

const cli = cac("knowledge");

cli
  .command("<action> [name]", "Manage project knowledge packs")
  .option("--project <path>", "Project root to manage, defaults to the current directory")
  .action(async (action: string, name: string | undefined, options) => {
    if (action === "init") {
      await knowledgeInit(options);
      return;
    }
    if (action === "feature") {
      await knowledgeFeature(name || "", options);
      return;
    }
    if (action === "list") {
      await knowledgeList(options);
      return;
    }
    if (action === "check") {
      await knowledgeCheck(options);
      return;
    }
    throw new Error(`Unknown knowledge action: ${action}`);
  });

cli.help();
cli.parse();
