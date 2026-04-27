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

This keeps RPC keys out of the public repository.

## Next logical additions

- load more / pagination
- export results
- holder leaderboard queries
- reward-history views
