# State Schema

```json
{
  "version": 1,
  "repoPath": "/canonical/repo/path",
  "branch": "branch-name",
  "pr": 123,
  "revision": { "base": "base-sha", "head": "head-sha" },
  "summary": "One short description.",
  "cursor": { "part": 0, "checkpoint": 0 },
  "parts": [
    {
      "title": "Part title",
      "status": "pending",
      "checkpoints": ["One observable checkpoint"],
      "note": "Optional decision, outcome, or stale reason."
    }
  ],
  "environment": { "url": "https://example.test", "note": "Durable resume context." },
  "blocker": "One active actionable blocker",
  "updatedAt": "ISO-8601 timestamp"
}
```

`pr` is a number. `revision.base`, `cursor`, `environment`, `blocker`, and `note` may be omitted. Omit the cursor when
complete; both cursor values are zero-based indexes. Part status is `pending`, `completed`, `skipped`, or `stale`. Do not
add part IDs, file inventories, or history arrays; reconstruct those details from the repository.
