# Ads Menu

Native read-only advertising status and performance menu-bar app.

The Swift app is deliberately a thin client of the installed `ads` command. It decodes the versioned `status`, `stats`, and `campaigns` JSON
contracts; provider authentication, API calls, normalization, caching, attribution metadata, and errors stay in the CLI.

Project mappings live in `config/ads.ts` and use stable account and campaign IDs. The menu's project selector passes the selected ID to the CLI, and
the daily spend chart renders the provider's native-currency series without aggregating across platforms.
