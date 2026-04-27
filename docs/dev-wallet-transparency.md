# dev wallet transparency

## Goal

Use a single public dev wallet, but make every transaction legible.

The trust model is:

- every transaction is recorded
- reward and airdrop transactions are highlighted publicly
- non-reward transactions are still retained in the audit trail
- nothing should look hidden or improvised

## V1 implementation shape

The first implementation should do two separate jobs:

### 1. Full audit ledger

Store every transfer involving the dev wallet in a normalized internal format.

This should preserve:

- signature
- timestamp
- source wallet
- destination wallet
- mint
- amount
- memo
- category

### 2. Public reward feed

Show only outgoing reward-related transfers on the public site by default.

This should display:

- timestamp
- winner wallet
- amount
- transaction signature
- memo / round label
- category such as `reward` or `airdrop`

## Why this approach fits peak

Keeping one wallet is more opinionated, but it can still feel safe if the behavior is clean.

The important part is that the site does not pretend every transaction is a reward. Instead:

- the system stores everything
- the public rewards panel highlights reward-specific transfers
- a broader audit page can later expose the full ledger

That creates transparency without making the homepage noisy.

## Current TypeScript foundation

The repo now includes a small TypeScript module under [src/dev-wallet](C:/Users/Enzo/Documents/Scripts/TS/peak/src/dev-wallet) that:

- normalizes raw wallet transfers
- classifies transfers by purpose using memo tags and direction
- keeps all transactions in the internal model
- filters only reward and airdrop transactions for the public feed

## Local testing

You can test the current wallet tracker locally from the repo root.

Basic command:

```powershell
npm.cmd run wallet:test
```

Help:

```powershell
npm.cmd run wallet:help
```

Example with explicit wallet and limit:

```powershell
npm.cmd run wallet:test -- --wallet AgyEoDHFxZvkYFaHgUZ5TcFk6VRB3idzD4NaPmRjDsZ8 --limit 50
```

Example with a pagination cursor:

```powershell
npm.cmd run wallet:test -- --wallet AgyEoDHFxZvkYFaHgUZ5TcFk6VRB3idzD4NaPmRjDsZ8 --before <signature>
```

Example JSON output:

```powershell
npm.cmd run wallet:test -- --json
```

Environment variables can also be used. See [.env.example](C:/Users/Enzo/Documents/Scripts/TS/peak/.env.example).

## Classification model

Current supported categories:

- `reward`
- `airdrop`
- `ops`
- `inflow`
- `unknown`

`unknown` is important. If a transfer leaves the dev wallet and does not match a published category, it should not disappear. It should remain visible in the audit trail until explained.

## Recommended public behavior

For launch, the site should have two views:

1. `Recent Rewards`
Clean UI card list for reward and airdrop payouts.

2. `Wallet Audit`
Full transaction history with category badges.

This gives holders both the simple view and the serious view.

## Next implementation step

The next technical step is to connect the TypeScript model to a real Solana transaction source and then render the filtered reward feed in the website UI.
