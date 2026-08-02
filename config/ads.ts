import { ACTIVE_PROJECTS } from "./active-projects";

export type AdsProjectPlatform = {
  accountIds: readonly string[];
  campaignIds?: readonly string[];
};

export type AdsProjectDefinition = {
  id: string;
  name: string;
  classification: "project" | "unassigned";
  platforms: Partial<
    Record<"google" | "meta" | "snapchat" | "tiktok" | "apple", AdsProjectPlatform>
  >;
};

export const ADS_PROJECTS: readonly AdsProjectDefinition[] = [
  ...ACTIVE_PROJECTS.map(({ id, name }) => ({
    id,
    name,
    classification: "project" as const,
    platforms:
      id === "awraq"
        ? {
            google: {
              accountIds: ["7051243715"],
              campaignIds: ["20327044989", "24029997729"],
            },
            snapchat: { accountIds: ["6c77a3cc-b84a-4c30-8243-35f05b6f0a8f"] },
            apple: { accountIds: ["22534290"] },
            tiktok: { accountIds: ["7665783056824877073"] },
          }
        : {},
  })),
  {
    id: "needs-classification",
    name: "Needs classification",
    classification: "unassigned" as const,
    platforms: {
      meta: { accountIds: ["3535706293261316"] },
    },
  },
];
