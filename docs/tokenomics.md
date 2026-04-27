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

This document does not lock final percentages yet. It defines the system shape first so the final allocation can be chosen safely.

## First principle

Rewards must come from a predefined reserve, not from vague future emissions.

That means:

- a dedicated reward reserve is set aside up front
- the wallet used for rewards is public
- distributions follow published rules
- each cycle has a hard cap

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

## V1 exclusions

The following should not be core token reward drivers in v1:

- whale-only payout systems
- highly complex point formulas
- discretionary team-selected distributions
- large leaderboard-based emissions

Leaderboard-based recognition can exist in v1, but token payouts tied directly to ranks should remain small or disabled until the system proves healthy.

## Eligibility framework

V1 should define a minimum holding threshold for reward eligibility.

The exact threshold can be decided later, but the rule should follow these goals:

- low enough that normal holders can participate
- high enough to reduce dust-wallet abuse
- simple enough to explain in one sentence

Example policy shape:

- wallet must hold at least the minimum amount at snapshot time
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

## Emission policy

The reserve should have both:

- a per-round cap
- a broader time-based cap, such as weekly or monthly

This protects the project from over-distribution during high-hype periods.

Design target:

- conservative by default
- easy to increase later if project health supports it
- difficult to abuse through pressure or impulsive changes

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

## Open decisions for next pass

These are the next tokenomics decisions to lock:

1. Reward reserve size
2. Minimum holder threshold
3. Snapshot frequency
4. Loyalty window length
5. Hybrid weighting formula
6. Per-round and per-period caps

Those decisions should be made before app implementation begins.
