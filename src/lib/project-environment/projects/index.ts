import { getProjectDefinition } from "../../../../config/active-projects";

import type { ProjectEnvironmentAdapter, ProjectEnvironmentOperation } from "../types";

export async function loadProjectEnvironmentAdapter(
  projectId: string,
): Promise<ProjectEnvironmentAdapter> {
  const testModule = process.env.PROJECT_LANES_TEST_ADAPTER_MODULE;
  if (testModule) {
    const module = (await import(testModule)) as {
      adapter?: ProjectEnvironmentAdapter;
    };
    if (!module.adapter) throw new Error("Test project environment module must export adapter");
    return module.adapter;
  }
  return (await getProjectDefinition(projectId).loadEnvironmentAdapter()).adapter;
}

export async function runProjectEnvironmentOperation(
  projectId: string,
  operation: ProjectEnvironmentOperation,
  args: string[],
): Promise<void> {
  const adapter = await loadProjectEnvironmentAdapter(projectId);
  await adapter.operations[operation](args);
}
