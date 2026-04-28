# tools

## Working baseline

The current saved baseline is the `Airdrop Filter`.

Purpose:

- take a dev wallet
- take a mint
- inspect outgoing transfers for that mint
- show recipient address and amount received

Current app entrypoint:

- [src/app/server.ts](C:/Users/Enzo/Documents/Scripts/TS/peak/src/app/server.ts)

Current query implementation:

- [src/app/query-modes.ts](C:/Users/Enzo/Documents/Scripts/TS/peak/src/app/query-modes.ts)
- [src/dev-wallet/airdrops.ts](C:/Users/Enzo/Documents/Scripts/TS/peak/src/dev-wallet/airdrops.ts)

## Configuration

Local secrets should stay local.

- `.env` is ignored by git
- `.env.example` documents expected variables
- the current app reads `SOLANA_RPC_URL` from local environment or `.env`
- `local-data/` is ignored by git and now stores cached query snapshots

This keeps RPC keys out of the public repository.

## Snapshot cache

The current query app now supports a simple local snapshot cache for:

- `Top Holders`
- `Airdrop Filter`
- `Reward Summary`

Snapshots are:

- stored locally only
- keyed by query inputs
- fresh for a few hours
- intended to reduce repeated RPC/indexer usage during testing

The cache implementation is generic, while the local namespace can be set per project or token through `CACHE_NAMESPACE`.

## Next logical additions

- load more / pagination
- export results
- holder leaderboard queries
- reward-history views
