import { getProjectEnvironmentDefinition } from "../../../../config/active-projects";

import * as runtime from "../runtime";
import type { ProjectEnvironmentAdapter, ProjectEnvironmentContext } from "../types";

interface AwraqContext extends ProjectEnvironmentContext {
  typesense: { url: string; apiKey: string };
}

const backendSecretKeys = [
  "MSEGAT_API_KEY",
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_WEBHOOK_VERIFY_TOKEN",
  "WHATSAPP_APP_SECRET",
  "RESEND_API_KEY",
  "OPENAI_API_KEY",
  "MOYASAR_SECRET_KEY",
  "MOYASAR_WEBHOOK_SECRET",
  "TAMARA_API_TOKEN",
  "TAMARA_NOTIFICATION_TOKEN",
  "TABBY_SECRET_KEY",
  "TABBY_WEBHOOK_HEADER_VALUE",
  "APP_STORE_PRIVATE_KEY",
  "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON",
  "EXPO_ACCESS_TOKEN",
  "RECAPTCHAV3_SECRET",
  "GOOGLE_CLIENT_SECRET",
  "TIKTOK_EVENTS_API_ACCESS_TOKEN",
];
const googleClientKeys = ["EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID", "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID"];
const databaseRoles = ["agent", "mutation"] as const;

const expoEnvironment = {
  apiUrlKeys: ["EXPO_PUBLIC_APP_URL", "EXPO_PUBLIC_IOS_APP_URL", "EXPO_PUBLIC_ANDROID_APP_URL"],
  metroPortKeys: ["EXPO_DEV_SERVER_PORT", "EXPO_PUBLIC_METRO_PORT"],
  simulatorNameKey: "AWRAQ_IOS_SIMULATOR_NAME",
  preserveKeys: googleClientKeys,
  secretKeys: googleClientKeys,
};

function context(): AwraqContext {
  return {
    ...runtime.createProjectEnvironmentContext(
      getProjectEnvironmentDefinition("awraq"),
      databaseRoles,
    ),
    typesense: { url: "http://127.0.0.1:8108", apiKey: "LARAVEL-HERD" },
  };
}

function backendEnvironmentValues(value: AwraqContext): Record<string, string> {
  return {
    REDIS_HOST: "127.0.0.1",
    REDIS_PORT: "6379",
    SCOUT_PREFIX: `${value.prefix}_`,
    TYPESENSE_HOST: "127.0.0.1",
    TYPESENSE_PORT: "8108",
    TYPESENSE_PROTOCOL: "http",
    TYPESENSE_API_KEY: value.typesense.apiKey,
    GOOGLE_REDIRECT_URI: `${value.appUrl}/auth/login/google/callback`,
    APPLE_REDIRECT_URI: `${value.appUrl}/auth/login/apple/callback`,
  };
}

function operationContext(): {
  value: AwraqContext;
  laravelEnvironment: { secretKeys: string[]; values: Record<string, string> };
} {
  const value = context();
  return {
    value,
    laravelEnvironment: {
      secretKeys: backendSecretKeys,
      values: backendEnvironmentValues(value),
    },
  };
}

async function setup(): Promise<void> {
  const { value, laravelEnvironment } = operationContext();
  runtime.log("setup", "starting lane setup");
  runtime.trustMise(value);
  runtime.loadShellSecret(value, "HUGEICONS_TOKEN");
  runtime.setupHerd(value);
  runtime.setupLaravelEnvironment(value, laravelEnvironment);
  runtime.setupExpoEnvironment(value, expoEnvironment);
  runtime.setupDatabase(value);
  runtime.ensureComposerDependencies(value);
  runtime.ensureBunDependencies(value, {
    label: "backend Bun dependencies",
    directory: value.backendDir,
  });
  runtime.ensureLaravelAppKey(value);
  runtime.artisan(value, "cache", ["optimize:clear"]);
  runtime.ensureLaravelS3Bucket(value);
  runtime.artisan(value, "wayfinder", ["wayfinder:generate"]);
  runtime.artisan(value, "migrations", ["migrate", "--force"]);
  runtime.artisan(value, "seed", [
    "db:seed",
    "--class=Database\\Seeders\\DatabaseSeeder",
    "--force",
  ]);
  runtime.reindexLaravelScoutModels(value);
  runtime.log("setup", "lane setup complete");
}

async function mobileDevelopment(): Promise<void> {
  const value = context();
  runtime.ensureBunDependencies(value, {
    label: "mobile Bun dependencies",
    directory: value.mobileDir,
  });
  runtime.setupExpoEnvironment(value, expoEnvironment);
  runtime.setupSimulator(value);
  runtime.log("mobile-development", "mobile development setup complete");
}

async function verify(args: string[]): Promise<void> {
  const { value, laravelEnvironment } = operationContext();
  runtime.verifyLaneInfrastructure(value);
  runtime.verifyLaravelEnvironment(value, laravelEnvironment);
  runtime.verifyExpoEnvironmentFile(value, expoEnvironment);
  runtime.verifyLaravelS3Bucket(value);
  runtime.artisan(value, "verify", [
    "tinker",
    "--execute",
    "dump(DB::table('branch_settings')->where('key', 'url')->where('value', 'qa-kitchen-sink')->exists()); dump(config('filesystems.disks.s3.bucket'));",
  ]);
  await runtime.verifyTypesense(value.typesense);
  if (runtime.shouldVerifyLiveServices()) await runtime.verifyViteDevelopmentServer(value);
  if (args.includes("--mobile-development")) {
    runtime.verifySimulator(value);
  }
  runtime.log("verify", "lane verification complete");
}

async function reset(): Promise<void> {
  const value = context();
  runtime.cleanTestingDatabases(value);
  runtime.setupDatabase(value);
  await runtime.deleteTypesenseCollections(value.typesense, `${value.prefix}_`);
  runtime.cleanLaravelS3Bucket(value);
  runtime.artisan(value, "reset-database", ["migrate:fresh", "--seed", "--force"]);
  runtime.reindexLaravelScoutModels(value);
  runtime.log("reset", `${value.lane} is reset`);
}

async function destroy(): Promise<void> {
  const value = context();
  runtime.deleteLaravelS3Bucket(value, { allowFailure: true });
  await runtime.deleteTypesenseCollections(value.typesense, `${value.prefix}_`, {
    allowFailure: true,
  });
  runtime.cleanDatabase(value);
  runtime.cleanHerd(value);
  runtime.cleanSimulator(value);
  runtime.removeProjectEnvironmentFiles(value);
  runtime.log("destroy", "lane destruction complete");
}

export const adapter: ProjectEnvironmentAdapter = {
  databaseRoles,
  operations: {
    setup,
    "mobile-development": mobileDevelopment,
    verify,
    reset,
    destroy,
  },
};
