# Ads Menu

Native read-only advertising status and performance menu-bar app.

The Swift app is a thin client of the installed `ads` JSON contracts. Provider access, normalization, attribution, and project mappings belong to
`src/lib/ads.ts` and `config/ads.ts`; the client and views belong to this directory. Keep business logic out of the app.
