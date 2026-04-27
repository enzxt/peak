# peak reward spec v1

## Purpose

This document translates the tokenomics direction into an operating model that can be published, implemented, and audited.

The goal is to keep v1 narrow:

- simple enough to explain on one page
- strong enough to create repeat engagement
- conservative enough to preserve runway

## Recommended baseline model

Recommended starting assumptions:

- total supply: `1,000,000,000 PEAK`
- dev buy target: `10% to 12%`
- reward reserve receives the largest share of dev-controlled supply
- rewards are funded only from the public reward reserve

## Wallet model

V1 should publicly identify three wallets or wallet roles:

### 1. Reward reserve

Purpose:
Funds all scheduled reward rounds.

Rules:

- used only for published rewards
- public balance displayed on site
- every distribution recorded publicly

### 2. Ops reserve

Purpose:
Supports infrastructure and project execution.

Examples:

- RPC and indexing costs
- hosting
- design and development expenses
- partner or launch operations if later approved publicly

Rules:

- should be smaller than the reward reserve
- should not be mixed with reward accounting

### 3. Dev alignment wallet

Purpose:
Represents the dev's long-term position.

Rules:

- publicly acknowledged
- not used as a hidden reward source
- not presented as locked unless it is actually locked

## Reward types

V1 should have exactly three reward types.

### Community round

Who it is for:
All eligible holders.

How it works:

- wallets above the threshold are entered
- selection uses tier-weighted odds
- multiple smaller winners are preferred over one large winner

Why it exists:
This is the broadest participation layer.

### Loyalty round

Who it is for:
Holders that maintain eligibility across a full loyalty window.

How it works:

- wallet must remain above threshold across the required snapshots
- winners can still be weighted, but eligibility is stricter

Why it exists:
This rewards conviction instead of pure wallet size.

### Event round

Who it is for:
Eligible holders under a specific announced event structure.

How it works:

- announced in advance
- capped more tightly than standard rounds
- used sparingly

Why it exists:
Creates moments of energy without redefining the whole system.

## Eligibility rules

Recommended default threshold:

- `250,000 PEAK`

Recommended anti-abuse posture:

- exclude obvious dust-wallet splitting if rules can be enforced reliably
- avoid subjective moderation wherever possible
- publish exclusions in plain language

V1 should prefer rules that can be checked automatically.

## Weighted entry model

Recommended weighting bands:

- `250,000` to `999,999` PEAK = `1` entry
- `1,000,000` to `4,999,999` PEAK = `2` entries
- `5,000,000` to `14,999,999` PEAK = `3` entries
- `15,000,000+` PEAK = `4` entries

This creates a reason to size up without letting whales scale linearly forever.

## Snapshot cadence

Recommended cadence:

- snapshot A each week
- snapshot B each week
- loyalty checks reference both snapshots

This means holders know activity happens regularly without needing a daily reward treadmill.

## Budgeting model

V1 budgeting should be reserve-relative, not hype-relative.

Recommended guardrails:

- weekly distribution cap: `0.35%` of reward reserve
- monthly distribution cap: `1.5%` of reward reserve
- event round cap: no more than `30%` of the active weekly budget

Example using a `60,000,000 PEAK` reward reserve:

- weekly cap = `210,000 PEAK`
- monthly cap = `900,000 PEAK`
- max single event round in a normal week = `63,000 PEAK`

This is intentionally conservative. If engagement is strong and sell pressure remains healthy, caps can be revisited later.

## First four rounds

The launch sequence should be known in advance.

### Round 1: Proof

Goal:
Show that the system works.

Shape:

- small community round
- many winners, small amounts

### Round 2: Loyalty

Goal:
Introduce the idea that holding through time matters.

Shape:

- loyalty-only qualification
- smaller winner count than round 1

### Round 3: Community

Goal:
Reinforce broad participation.

Shape:

- community round with same public threshold

### Round 4: Event

Goal:
Create a spike of attention without breaking budget discipline.

Shape:

- announced in advance
- small, capped, and visibly separate from standard rounds

## Public explanation standard

If a normal holder cannot understand the reward rules in one short read, v1 is too complicated.

Every public reward explanation should answer:

1. Who qualifies
2. When snapshots happen
3. How odds are weighted
4. How much can be distributed
5. Which wallet funds it

## What should not ship in v1

- direct rank-based whale emissions
- manual team-selected winners
- daily reward spam
- large discretionary treasury moves
- formulas that require too much interpretation

## Remaining decisions

Before implementation starts, we should finalize:

1. exact dev buy target
2. exact reward reserve size
3. exact snapshot days and times
4. loyalty window length
5. anti-abuse rules we can actually enforce
6. public wording for dev and ops wallet behavior
