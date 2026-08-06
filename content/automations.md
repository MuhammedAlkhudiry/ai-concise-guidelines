# Codex Automations

This is the source of truth for reusable, device-wide Codex automations. Recreate every table row after installing Codex on a device. Keep project-, campaign-, pull-request-, and temporary access-monitoring automations out of this file.

| ID | Name | Schedule | Prompt | Scope | Status |
| --- | --- | --- | --- | --- | --- |
| `weekly-system-tools-update` | Weekly system tools update | Weekly (`FREQ=WEEKLY;INTERVAL=1`) | `$tool-updates` | Global; run with the default Codex model and execution environment | Active |
| `daily-product-health` | Daily product health | Daily at 13:00 local time (`FREQ=DAILY;BYHOUR=13;BYMINUTE=0`) | `$product-health` | Reusable for each product project; run from that project's root | Active |
