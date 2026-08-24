#!/usr/bin/env bun

import { cac } from "cac";
import {
  knowledgeFeature,
  knowledgeFind,
  knowledgeInit,
  knowledgeLearning,
  knowledgeLint,
  knowledgeList,
} from "./knowledge";

const cli = cac("knowledge");

cli
  .command("init", "Create docs/knowledge scaffolding")
  .option("--project <path>", "Project root to manage, defaults to the current directory")
  .action(async (options) => knowledgeInit(options));

cli
  .command("feature <name>", "Create or index a feature knowledge pack")
  .option("--project <path>", "Project root to manage, defaults to the current directory")
  .action(async (name: string, options) => knowledgeFeature(name, options));

cli
  .command("learning <title>", "Create or index a durable constraint learning")
  .option("--project <path>", "Project root to manage, defaults to the current directory")
  .action(async (title: string, options) => knowledgeLearning(title, options));

cli
  .command("find <query>", "Find the most relevant glossary terms and knowledge documents")
  .option("--limit <count>", "Maximum glossary terms and documents to return", { default: 3 })
  .option("--project <path>", "Project root to search, defaults to the current directory")
  .action(async (query: string, options) => knowledgeFind(query, options));

cli
  .command("list", "List project knowledge documents")
  .option("--project <path>", "Project root to manage, defaults to the current directory")
  .action(async (options) => knowledgeList(options));

cli
  .command("lint", "Validate knowledge structure without claiming factual freshness")
  .option("--project <path>", "Project root to manage, defaults to the current directory")
  .action(async (options) => knowledgeLint(options));

cli.help();
cli.parse();
