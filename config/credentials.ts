export const CREDENTIALS_HOME_ENV = "SERVICE_CREDENTIALS_HOME";

export const CREDENTIALS_ROOT = ".config/my-setup/credentials";

export type CredentialFileRoute = {
  id: string;
  destination: string;
  legacyPaths: readonly string[];
  pathRewrites?: Readonly<Record<string, string>>;
};

export const CREDENTIAL_FILE_ROUTES: readonly CredentialFileRoute[] = [
  {
    id: "shell-secrets",
    destination: "secrets.zsh",
    legacyPaths: [".config/my-setup/secrets.zsh"],
  },
  {
    id: "google-play-service-account",
    destination: "google-play/service-account.json",
    legacyPaths: [".credentials/awraq-google-play.json"],
  },
  {
    id: "app-store-connect-private-key",
    destination: "app-store-connect/AuthKey_2FG8Y954VK.p8",
    legacyPaths: [".credentials/AuthKey_2FG8Y954VK.p8"],
  },
  {
    id: "mobile-release-environment",
    destination: "environments/awraq/mobile-release.env",
    legacyPaths: [".config/awraq-project/mobile-release.env"],
    pathRewrites: {
      GOOGLE_SERVICE_ACCOUNT_KEY: "google-play-service-account",
      ASC_KEY_PATH: "app-store-connect-private-key",
    },
  },
];
