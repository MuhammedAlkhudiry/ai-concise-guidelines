import { expect, test } from "bun:test";

import {
  ACTIVE_PROJECTS,
  getProjectEnvironmentDefinition,
  PROJECT_DEFINITIONS,
} from "./active-projects";
import { PROJECT_ENVIRONMENT_OPERATIONS } from "../src/lib/project-environment/types";

test("derives lane catalog and environment metadata from one project registry", () => {
  expect(ACTIVE_PROJECTS.map(({ id }) => id)).toEqual(PROJECT_DEFINITIONS.map(({ id }) => id));

  const awraq = ACTIVE_PROJECTS.find(({ id }) => id === "awraq")!;
  const environment = getProjectEnvironmentDefinition("awraq");
  expect(environment).toMatchObject({
    id: awraq.id,
    name: awraq.name,
    rootEnvironmentVariable: awraq.environmentVariable,
    mobileDirectory: awraq.mobile?.directory,
    backendDirectory: awraq.services.find(({ id }) => id === "frontend")?.directory,
  });
});

test("registers an exhaustive environment adapter for every active project", async () => {
  for (const project of PROJECT_DEFINITIONS) {
    const { adapter } = await project.loadEnvironmentAdapter();
    expect(Object.keys(adapter.operations).sort()).toEqual(
      [...PROJECT_ENVIRONMENT_OPERATIONS].sort(),
    );
  }

  expect((await PROJECT_DEFINITIONS[0]!.loadEnvironmentAdapter()).adapter.databaseRoles).toEqual([
    "agent",
    "mutation",
  ]);
  expect((await PROJECT_DEFINITIONS[1]!.loadEnvironmentAdapter()).adapter.databaseRoles).toEqual(
    [],
  );
});
