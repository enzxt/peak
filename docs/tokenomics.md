# peak v1 tokenomics

## Goal

Create a reward system that is:

- easy to explain
- sustainable over time
- fair to normal holders
- exciting enough to revisit
- transparent enough to audit

## Supply context

Launch context:

- `PEAK` total supply: `1,000,000,000`
- Launch venue: `pump.fun`
- The dev can acquire an initial position at launch through a public buy.

This document now recommends a conservative v1 structure that can be published before launch and adjusted only if the tradeoffs are clearly explained.

## First principle

Rewards must come from a predefined reserve, not from vague future emissions.

That means:

- a dedicated reward reserve is set aside up front
- the wallet used for rewards is public
- distributions follow published rules
- each cycle has a hard cap

## Recommended launch structure

The safest v1 model is for the dev to buy a meaningful but clearly bounded position at launch, then split that position by purpose.

Recommended public wallet structure:

- `reward reserve wallet`: funds scheduled rewards only
- `ops wallet`: covers project costs such as infrastructure, design, and tooling
- `dev alignment wallet`: long-term dev position that is publicly identified

Recommended policy:

- the reward reserve should be the largest named dev-controlled bucket
- the ops wallet should be smaller and used sparingly
- the dev alignment wallet should be held transparently and not treated as an active profit wallet

## Recommended dev buy range

V1 should avoid both extremes:

- too little dev inventory makes rewards weak and short-lived
- too much dev inventory damages trust and concentration optics

Recommended starting range:

- `8% to 15%` of total supply acquired by the dev at launch

Practical recommendation:

- target `10% to 12%` if execution conditions allow it

Why this range fits v1:

- large enough to sustain rewards over time
- small enough to remain defendable publicly
- flexible enough to split into reward, ops, and alignment buckets

## Recommended internal split

If the dev acquires a launch position, the default split should be:

- `60%` reward reserve
- `15%` ops reserve
- `25%` dev alignment

Example using a `100,000,000 PEAK` dev buy:

- `60,000,000` to reward reserve
- `15,000,000` to ops reserve
- `25,000,000` to dev alignment

This is only an example to show proportions. The key point is that the reward reserve should be the dominant purpose of the dev-controlled allocation.

## V1 reward buckets

V1 should use only three reward buckets.

### 1. Community rewards

Purpose:
Keep normal holders included.

Examples:

- random eligible-holder rewards
- broad snapshot rounds
- milestone-triggered community distributions

Design notes:

- should represent the largest share of the reward budget
- should not be dominated by whales

### 2. Loyalty rewards

Purpose:
Reward conviction and reduce short-term farming.

Examples:

- holding across multiple snapshots
- maintaining eligibility for a defined period
- streak-based qualification

Design notes:

- should reward consistency more than aggression
- should be simple enough to verify and explain

### 3. Event rewards

Purpose:
Create moments of excitement without overcommitting the reserve.

Examples:

- announced special rounds
- milestone events
- limited seasonal/community events

Design notes:

- should be a smaller percentage of total emissions
- should never become the default reward mode

## Recommended reward budget split

Within the reward reserve, v1 should allocate by intent:

- `55%` community rewards
- `30%` loyalty rewards
- `15%` event rewards

This keeps the system community-first while leaving room for occasional higher-energy moments.

## V1 exclusions

The following should not be core token reward drivers in v1:

- whale-only payout systems
- highly complex point formulas
- discretionary team-selected distributions
- large leaderboard-based emissions

Leaderboard-based recognition can exist in v1, but token payouts tied directly to ranks should remain small or disabled until the system proves healthy.

## Eligibility framework

V1 should define a minimum holding threshold for reward eligibility.

Recommended first-pass threshold:

- `250,000 PEAK`

Why this works well for v1:

- high enough to make dust-wallet farming less attractive
- low enough that normal holders can still participate
- easy to explain on one screen

The rule should still follow these goals:

- low enough that normal holders can participate
- high enough to reduce dust-wallet abuse
- simple enough to explain in one sentence

Example policy shape:

- wallet must hold at least the minimum amount at snapshot time
- wallet should meet the threshold for the full loyalty window if entering a loyalty round
- wallet must not be excluded by published anti-abuse rules

## Weighting philosophy

V1 should use hybrid weighting with diminishing returns.

Why:

- flat odds can remove incentive to hold more
- fully linear weighting quickly becomes whale-dominated
- hybrid weighting keeps larger holders interested without making smaller holders irrelevant

Target behavior:

- every eligible wallet has a base chance
- larger holdings improve odds
- odds scale less aggressively after defined bands

This approach should be published clearly before activation.

Recommended v1 weighting bands:

- `Tier 1`: `250,000` to `999,999` PEAK = `1x` entry weight
- `Tier 2`: `1,000,000` to `4,999,999` PEAK = `2x` entry weight
- `Tier 3`: `5,000,000` to `14,999,999` PEAK = `3x` entry weight
- `Tier 4`: `15,000,000+` PEAK = `4x` entry weight

Why bands are better than pure linear scaling:

- easy to explain publicly
- gives larger holders better odds
- avoids making very large wallets mathematically dominant

## Snapshot policy

V1 should keep cadence predictable.

Recommended cadence:

- `2` standard snapshots per week
- community rewards can run on each snapshot
- loyalty rewards can run once per week based on continuous eligibility across both weekly snapshots
- event rewards should be announced separately and remain irregular

Why this cadence works:

- frequent enough to keep the system alive
- slow enough to avoid operational chaos
- simple enough for holders to follow

## Emission policy

The reserve should have both:

- a per-round cap
- a broader time-based cap, such as weekly or monthly

This protects the project from over-distribution during high-hype periods.

Design target:

- conservative by default
- easy to increase later if project health supports it
- difficult to abuse through pressure or impulsive changes

Recommended caps for v1:

- no more than `0.35%` of the reward reserve distributed in a single week
- no more than `1.5%` of the reward reserve distributed in a single month
- no single reward event should consume more than `30%` of that week's budget

This creates room for excitement without letting one event drain the system.

## First rounds policy

The first rounds should prove consistency, not maximize excitement.

Recommended launch sequence:

1. `Round 1: Proof`
Small community distribution to prove the system works.
2. `Round 2: Loyalty`
First loyalty-focused round after enough time has passed to measure actual holding.
3. `Round 3: Community`
Second broad holder round with the same public rules.
4. `Round 4: Event`
Small announced event round with a tighter cap.

This structure gives holders an understandable story before launch.

## Transparency policy

V1 should publish:

- the reward reserve wallet
- the purpose of that wallet
- the active reward rules
- prior reward distributions
- the dev wallet policy

## Dev wallet policy

The dev position should be explained in plain English before launch.

Desired principles:

- no hidden profit-taking narrative
- clear separation between dev holdings and reward reserve
- public explanation of what each wallet is for
- changes to policy should be announced, not improvised

Recommended public standard:

- the reward reserve wallet should never be used for personal sales
- the ops wallet should have a stated purpose and visible outflows
- the dev alignment wallet should be publicly acknowledged as a long-term position
- if any policy changes are needed, they should be announced before the wallet behavior changes

## Open decisions for next pass

These are the next tokenomics decisions to lock:

1. Final dev buy target within the recommended range
2. Final minimum holder threshold
3. Loyalty window length in days
4. Exact weekly and monthly reward budget percentages
5. Anti-abuse and exclusion rules
6. Public wording for wallet policy

Those decisions should be made before app implementation begins.
