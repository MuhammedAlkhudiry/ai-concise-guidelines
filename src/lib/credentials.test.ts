import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { describe, expect, test } from "bun:test";

import { CREDENTIALS_HOME_ENV, CREDENTIALS_ROOT } from "../../config/credentials";
import { migrateManagedCredentials } from "./credentials";

describe("migrateManagedCredentials", () => {
  test("moves legacy files, rewrites embedded paths, and removes empty legacy directories", async () => {
    const home = await mkdtemp(join(tmpdir(), "my-setup-credentials-"));
    try {
      const legacySecrets = join(home, ".config/my-setup/secrets.zsh");
      const legacyGoogle = join(home, ".credentials/awraq-google-play.json");
      const legacyApple = join(home, ".credentials/AuthKey_2FG8Y954VK.p8");
      const legacyEnvironment = join(home, ".config/awraq-project/mobile-release.env");

      for (const path of [legacySecrets, legacyGoogle, legacyApple, legacyEnvironment]) {
        mkdirSync(dirname(path), { recursive: true });
      }

      writeFileSync(legacySecrets, 'export POSTHOG_API_KEY="test"\n');
      writeFileSync(legacyGoogle, '{"type":"service_account"}\n');
      writeFileSync(legacyApple, "private-key\n");
      writeFileSync(
        legacyEnvironment,
        [
          'export GOOGLE_SERVICE_ACCOUNT_KEY="$HOME/.credentials/awraq-google-play.json"',
          'export ASC_KEY_ID="key-id"',
          'export ASC_KEY_PATH="$HOME/.credentials/AuthKey_2FG8Y954VK.p8"',
          "",
        ].join("\n"),
      );

      const result = await migrateManagedCredentials({ home });

      const root = join(home, CREDENTIALS_ROOT);
      const environment = readFileSync(join(root, "environments/awraq/mobile-release.env"), "utf8");

      expect(result.moved).toHaveLength(4);
      expect(existsSync(join(root, "secrets.zsh"))).toBe(true);
      expect(existsSync(join(root, "google-play/service-account.json"))).toBe(true);
      expect(existsSync(join(root, "app-store-connect/AuthKey_2FG8Y954VK.p8"))).toBe(true);
      expect(environment).toContain(
        `GOOGLE_SERVICE_ACCOUNT_KEY="$${CREDENTIALS_HOME_ENV}/google-play/service-account.json"`,
      );
      expect(environment).toContain(
        `ASC_KEY_PATH="$${CREDENTIALS_HOME_ENV}/app-store-connect/AuthKey_2FG8Y954VK.p8"`,
      );
      expect(existsSync(join(home, ".credentials"))).toBe(false);
      expect(existsSync(join(home, ".config/awraq-project"))).toBe(false);
      expect(statSync(root).mode & 0o777).toBe(0o700);
      expect(statSync(join(root, "environments")).mode & 0o777).toBe(0o700);
      expect(statSync(join(root, "secrets.zsh")).mode & 0o777).toBe(0o600);
    } finally {
      rmSync(home, { recursive: true, force: true });
    }
  });

  test("refuses to overwrite a different centralized credential file", async () => {
    const home = await mkdtemp(join(tmpdir(), "my-setup-credentials-conflict-"));
    try {
      const legacy = join(home, ".config/my-setup/secrets.zsh");
      const centralized = join(home, CREDENTIALS_ROOT, "secrets.zsh");
      mkdirSync(dirname(legacy), { recursive: true });
      mkdirSync(dirname(centralized), { recursive: true });
      writeFileSync(legacy, "legacy\n");
      writeFileSync(centralized, "centralized\n");

      await expect(migrateManagedCredentials({ home })).rejects.toThrow(
        "Credential migration conflict for shell-secrets",
      );

      expect(readFileSync(legacy, "utf8")).toBe("legacy\n");
      expect(readFileSync(centralized, "utf8")).toBe("centralized\n");
    } finally {
      rmSync(home, { recursive: true, force: true });
    }
  });
});
