# Codex Automations

This is the source of truth for reusable, device-wide Codex automations. Recreate every table row after installing Codex on a device. Exclude
automations scoped to a project, campaign, pull request, or temporary access monitor.

| ID                             | Name                         | Schedule                                                                           | Prompt                                                                                              | Scope                                                              | Status |
| ------------------------------ | ---------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------ |
| `weekly-system-tools-update`   | Weekly system tools update   | Weekly (`FREQ=WEEKLY;INTERVAL=1`)                                                  | `$tool-updates`                                                                                     | Global; run with the default Codex model and execution environment | Active |
| `daily-product-health`         | Daily product health         | Daily at 13:00 local time (`FREQ=DAILY;BYHOUR=13;BYMINUTE=0`)                      | `$product-health`                                                                                   | Reusable for each product project; run from that project's root    | Active |
| `weekly-codex-storage-cleanup` | Weekly Codex storage cleanup | Weekly on Sunday at 03:00 Asia/Riyadh (`FREQ=WEEKLY;BYDAY=SU;BYHOUR=3;BYMINUTE=0`) | Clean disposable Codex logs/cache/temp/coverage/archived-session material; report reclaimed storage | This chat; heartbeat attached to the current thread                | Active |
