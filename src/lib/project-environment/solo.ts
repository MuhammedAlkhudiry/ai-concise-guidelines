import { existsSync, readFileSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import { Database } from "bun:sqlite";

import { output, run } from "./command";
import type { ProjectEnvironmentContext } from "./types";

interface SoloProject {
  id: number;
  path: string;
}

interface SoloProjectsResponse {
  ok: boolean;
  data: { projects: SoloProject[] };
}

interface SoloDoctorResponse {
  ok: boolean;
  data: { status: { ready: boolean; config: { appDataDir: string } } };
}

interface SoloTrustStatus {
  commandCount: number;
  untrustedCount: number;
  missingHistoryCount: number;
}

interface SoloProcessRow {
  name: string;
  command: string;
  working_dir: string;
  auto_start: number;
  auto_restart: number;
  restart_when_changed: string;
  env: string;
}

interface SoloCommand {
  name: string;
  command: string;
  working_dir?: string;
  auto_start?: boolean;
  auto_restart?: boolean;
  restart_when_changed?: string[] | boolean;
  env?: Record<string, string>;
}

function parseSoloResponse<T>(value: string, command: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    throw new Error(`Solo ${command} did not return JSON`);
  }
}

function soloProjects(context: ProjectEnvironmentContext): SoloProject[] {
  const response = parseSoloResponse<SoloProjectsResponse>(
    output(context, "solo", "solo", ["projects", "list", "--json", "--limit", "500"], {
      cwd: context.root,
    }),
    "projects list",
  );
  if (!response.ok) throw new Error("Solo could not list projects");
  return response.data.projects;
}

function pathsMatch(first: string, second: string): boolean {
  const normalize = (path: string) => (existsSync(path) ? realpathSync(path) : resolve(path));
  return normalize(first) === normalize(second);
}

function soloProject(context: ProjectEnvironmentContext, create: boolean): SoloProject | undefined {
  const existing = soloProjects(context).find((project) => pathsMatch(project.path, context.root));
  if (existing || !create) return existing;
  run(
    context,
    "solo",
    "solo",
    ["projects", "create", context.soloProjectName, context.root, "--json"],
    { cwd: context.root },
  );
  return soloProjects(context).find((project) => pathsMatch(project.path, context.root));
}

function soloDatabase(context: ProjectEnvironmentContext): Database {
  const response = parseSoloResponse<SoloDoctorResponse>(
    output(context, "solo", "solo", ["doctor", "--json"], { cwd: context.root }),
    "doctor",
  );
  if (!response.ok || !response.data.status.ready) throw new Error("Solo is not ready");
  const path = resolve(response.data.status.config.appDataDir, "solo.db");
  if (!existsSync(path)) throw new Error(`Solo database is missing at ${path}`);
  const database = new Database(path, { strict: true });
  database.exec("PRAGMA busy_timeout = 5000");
  return database;
}

function soloCommands(context: ProjectEnvironmentContext): SoloCommand[] {
  const document = Bun.YAML.parse(readFileSync(resolve(context.root, "solo.yml"), "utf8")) as {
    commands?: SoloCommand[];
  };
  const commands = document.commands ?? [];
  if (commands.length === 0) throw new Error("solo.yml has no commands");
  if (commands.some((command) => !command.name || !command.command)) {
    throw new Error("solo.yml contains an invalid command");
  }
  return commands;
}

function reconcileSoloCommands(
  database: Database,
  projectId: number,
  commands: SoloCommand[],
): void {
  database.transaction(() => {
    database
      .query("DELETE FROM processes WHERE project_id = ?1 AND kind = 'command' AND in_yml = 1")
      .run(projectId);
    const insert = database.query(`INSERT INTO processes (
      project_id, name, command, working_dir, auto_start, auto_restart,
      restart_when_changed, env, in_yml, trusted, position, kind
    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 1, 0, ?9, 'command')`);
    commands.forEach((command, index) => {
      insert.run(
        projectId,
        command.name,
        command.command,
        command.working_dir ?? ".",
        command.auto_start === false ? 0 : 1,
        command.auto_restart ? 1 : 0,
        JSON.stringify(
          Array.isArray(command.restart_when_changed) ? command.restart_when_changed : [],
        ),
        JSON.stringify(command.env ?? {}),
        (index + 1) * 1000,
      );
    });
  })();
}

function soloTrustStatus(database: Database, projectId: number): SoloTrustStatus {
  return database
    .query<SoloTrustStatus, [number]>(`SELECT
      COUNT(*) AS commandCount,
      SUM(CASE WHEN trusted = 0 THEN 1 ELSE 0 END) AS untrustedCount,
      SUM(CASE WHEN NOT EXISTS (
        SELECT 1 FROM command_trust_history history
        WHERE history.project_id = processes.project_id
          AND history.command = processes.command
          AND history.working_dir = processes.working_dir
          AND history.auto_start = processes.auto_start
          AND history.auto_restart = processes.auto_restart
          AND history.restart_when_changed = processes.restart_when_changed
          AND history.env = processes.env
      ) THEN 1 ELSE 0 END) AS missingHistoryCount
      FROM processes WHERE project_id = ?1 AND kind = 'command' AND in_yml = 1`)
    .get(projectId) as SoloTrustStatus;
}

function verifySoloCommands(
  context: ProjectEnvironmentContext,
  database: Database,
  projectId: number,
  commands: SoloCommand[],
): void {
  const rows = database
    .query<SoloProcessRow, [number]>(`SELECT
      name, command, working_dir, auto_start, auto_restart, restart_when_changed, env
      FROM processes
      WHERE project_id = ?1 AND kind = 'command' AND in_yml = 1
      ORDER BY position`)
    .all(projectId);

  const matchesDefinition = rows.every((row, index) => {
    const command = commands[index];
    return (
      command &&
      row.name === command.name &&
      row.command === command.command &&
      row.working_dir === (command.working_dir ?? ".") &&
      row.auto_start === (command.auto_start === false ? 0 : 1) &&
      row.auto_restart === (command.auto_restart ? 1 : 0) &&
      row.restart_when_changed ===
        JSON.stringify(
          Array.isArray(command.restart_when_changed) ? command.restart_when_changed : [],
        ) &&
      row.env === JSON.stringify(command.env ?? {})
    );
  });
  if (rows.length !== commands.length || !matchesDefinition) {
    throw new Error("Solo commands do not match solo.yml");
  }

  if (
    rows.some((row) => {
      const workingDirectory = resolve(context.root, row.working_dir);
      return workingDirectory !== context.root && !workingDirectory.startsWith(`${context.root}/`);
    })
  ) {
    throw new Error("A Solo process belongs to another lane");
  }
}

export function setupSolo(context: ProjectEnvironmentContext): number {
  const project = soloProject(context, true);
  if (!project) throw new Error(`Solo did not register ${context.root}`);
  run(
    context,
    "solo",
    "solo",
    ["commands", "stop-all", "--project-id", String(project.id), "--json"],
    { cwd: context.root, allowFailure: true },
  );
  const database = soloDatabase(context);
  try {
    reconcileSoloCommands(database, project.id, soloCommands(context));
    database.transaction(() => {
      database
        .query(
          "UPDATE processes SET trusted = 1 WHERE project_id = ?1 AND kind = 'command' AND in_yml = 1",
        )
        .run(project.id);
      database
        .query(`INSERT INTO command_trust_history (
        project_id, process_name, command, working_dir, auto_start, auto_restart, restart_when_changed, env
      ) SELECT project_id, name, command, working_dir, auto_start, auto_restart, restart_when_changed, env
        FROM processes WHERE project_id = ?1 AND kind = 'command' AND in_yml = 1
        ON CONFLICT(project_id, command, working_dir, auto_start, auto_restart, restart_when_changed, env)
        DO UPDATE SET process_name = excluded.process_name, last_trusted_at = datetime('now')`)
        .run(project.id);
    })();
  } finally {
    database.close();
  }
  verifySolo(context);
  run(
    context,
    "solo",
    "solo",
    ["commands", "start-all", "--project-id", String(project.id), "--json"],
    { cwd: context.root },
  );
  return project.id;
}

export function verifySolo(context: ProjectEnvironmentContext): void {
  const project = soloProject(context, false);
  if (!project) throw new Error(`Solo project is missing for ${context.root}`);
  const commands = soloCommands(context);
  const database = soloDatabase(context);
  try {
    const status = soloTrustStatus(database, project.id);
    if (
      status.commandCount !== commands.length ||
      status.untrustedCount > 0 ||
      status.missingHistoryCount > 0
    ) {
      throw new Error("Solo command ownership or trust is incomplete");
    }
    verifySoloCommands(context, database, project.id, commands);
  } finally {
    database.close();
  }
}

export function cleanSolo(context: ProjectEnvironmentContext): void {
  const project = soloProject(context, false);
  if (!project) return;
  run(
    context,
    "clean:solo",
    "solo",
    ["projects", "delete", String(project.id), "--confirm-stop-running", "--json"],
    { cwd: context.root },
  );
}
