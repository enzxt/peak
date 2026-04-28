# Peak Data Refresh Strategy

## Goal

Peak should feel live, but it should not hit Solana RPC or indexed APIs on every page load forever.

We want:

- predictable API cost
- faster page loads
- fewer rate-limit issues
- stable leaderboard views
- a clean path from local testing to production

## Recommendation

Do **not** build a heavy permanent "memory system" first.

Do build a **snapshot + cache layer** soon.

That means:

- queries still know how to pull fresh onchain data
- a background job runs on a schedule
- the app reads the latest stored snapshot by default
- manual refresh can still exist for admin/testing use

This gives us most of the value without overbuilding.

## Best Practice For Peak

Use two data modes:

1. `live query`
Used for debugging, admin checks, and one-off verification.

2. `stored snapshot`
Used for the public app and most normal page loads.

That split is the cleanest approach.

## What Should Be Cached

The best first candidates are:

1. `Top holders`
This is the most obvious leaderboard and one of the most expensive to keep recalculating.

2. `Reward summary`
This groups transfers and does not need to be recomputed on every visitor request.

3. `Airdrop filter results`
This is cheaper than a full holder board, but still worth caching when the same mint gets queried often.

## Suggested Refresh Cadence

For v1, a simple cadence is enough:

- top holders: every 4 hours
- reward summary: every 4 hours
- airdrop filter cache: every 4 hours

If there is a known launch event or active reward window, temporarily increase to:

- every 1 hour

I would **not** refresh every few minutes in v1. That burns credits without adding much value for this product.

## Storage Recommendation

### Local Development

Use a simple local file or SQLite store.

Best lightweight options:

- `data/cache/*.json`
- or a single local SQLite database

For current project scope, I would start with **JSON snapshot files** because:

- easy to inspect manually
- zero setup
- easy to diff and debug
- enough for local testing

### Production

For deployment, prefer either:

- SQLite if traffic is modest and the app is single-instance
- Postgres if we expect multiple workers, admin tools, or future analytics

## Snapshot Shape

Each stored snapshot should include:

- `queryType`
- `mint`
- `resolvedWallet` if applicable
- `generatedAt`
- `rowCount`
- `rows`
- `source`
  - `live-rpc`
  - `live-indexer`
  - `cached`

Example:

```json
{
  "queryType": "top-holders",
  "mint": "71utbKBwCwL22NsJZzeuR23K3BTZaTmzj3X7kzTzpump",
  "resolvedWallet": null,
  "generatedAt": "2026-04-27T22:10:00.000Z",
  "rowCount": 25,
  "rows": [],
  "source": "live-rpc"
}
```

## Good v1 Architecture

### Read path

1. user opens dashboard
2. app checks for latest stored snapshot
3. if snapshot is fresh enough, return it
4. if missing or stale, either:
   - generate on demand
   - or show latest stale snapshot with a freshness label

### Write path

1. scheduled job runs
2. pulls fresh chain data
3. normalizes and sorts results
4. writes a new snapshot

## Freshness Rules

Recommended v1 freshness rules:

- top holders snapshot is fresh for 4 hours
- reward summary snapshot is fresh for 4 hours
- airdrop filter snapshot is fresh for 4 hours

If data is older than the freshness window:

- still allow showing it
- but label it as stale

That is better than hard-failing the UI.

## Why This Is Better Than Always Live

Always-live querying sounds nice, but it creates problems:

- slower dashboard loads
- more Helius credit burn
- more temporary chain or RPC failures
- inconsistent public results if two visitors load between updates

Snapshots give the project a more stable and professional feel.

## Should We Build It Before Deployment?

My opinion:

- do **not** block deployment on a full persistence layer
- do plan the interfaces now so we do not rewrite the app later

The smart middle ground is:

1. finish current live query tooling
2. add a tiny storage interface
3. add snapshot generation for top holders first
4. later extend the same pattern to reward summary and airdrop filter

That keeps scope under control.

## Recommended Next Implementation Order

1. Add a small `snapshot-store` module.
2. Save `top-holders` snapshots to local JSON files.
3. Read those snapshots in the dashboard before falling back to live queries.
4. Add a manual admin refresh action later.
5. Extend the same system to `reward-summary`.

## Bottom Line

For Peak, caching is worth it.

But the right version is not a vague "memory system."

It is a **scheduled snapshot system**:

- simple
- inspectable
- cheaper to run
- easier to trust
- easy to upgrade later
