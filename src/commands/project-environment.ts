#!/usr/bin/env bun

import { runProjectEnvironmentOperation } from "../lib/project-environment/projects";
import {
  PROJECT_ENVIRONMENT_OPERATIONS,
  type ProjectEnvironmentOperation,
} from "../lib/project-environment/types";

const [projectId, operation, ...args] = process.argv.slice(2);

function isProjectEnvironmentOperation(
  value: string | undefined,
): value is ProjectEnvironmentOperation {
  return PROJECT_ENVIRONMENT_OPERATIONS.some((candidate) => candidate === value);
}

if (!projectId || !isProjectEnvironmentOperation(operation)) {
  throw new Error(
    "Usage: project-environment.ts <project> <setup|mobile-development|verify|reset|destroy>",
  );
}

await runProjectEnvironmentOperation(projectId, operation, args);
