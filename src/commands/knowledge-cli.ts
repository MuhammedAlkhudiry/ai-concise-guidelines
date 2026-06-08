#!/usr/bin/env bun

import { cac } from "cac";

import {
  knowledgeCheck,
  knowledgeFeature,
  knowledgeInit,
  knowledgeLearning,
  knowledgeList,
} from "./knowledge";

const cli = cac("knowledge");

cli
  .command("init", "Create docs/knowledge scaffolding")
  .option("--project <path>", "Project root to manage, defaults to the current directory")
  .action(async (options) => {
    await knowledgeInit(options);
  });

cli
  .command("feature <name>", "Create or index a feature knowledge pack")
  .option("--project <path>", "Project root to manage, defaults to the current directory")
  .action(async (name: string, options) => {
    await knowledgeFeature(name, options);
  });

cli
  .command("learning <title>", "Create or index a hard-earned bug learning")
  .option("--project <path>", "Project root to manage, defaults to the current directory")
  .action(async (title: string, options) => {
    await knowledgeLearning(title, options);
  });

cli
  .command("list", "List project knowledge documents")
  .option("--project <path>", "Project root to manage, defaults to the current directory")
  .action(async (options) => {
    await knowledgeList(options);
  });

cli
  .command("check", "Validate project knowledge key file references")
  .option("--project <path>", "Project root to manage, defaults to the current directory")
  .action(async (options) => {
    await knowledgeCheck(options);
  });

cli.help();
cli.parse();
