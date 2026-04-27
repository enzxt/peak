import {
  DevWalletAuditConfig,
  DevWalletTransactionCategory,
  RawWalletTransfer,
} from "./types.js";

const DEFAULT_REWARD_CATEGORIES: DevWalletTransactionCategory[] = [
  "reward",
  "airdrop",
];

const DEFAULT_TAG_RULES = [
  { category: "reward" as const, match: ["reward", "winner", "snapshot"] },
  { category: "airdrop" as const, match: ["airdrop", "drop", "round"] },
  { category: "ops" as const, match: ["ops", "infra", "hosting", "tooling"] },
];

export function classifyTransfer(
  transfer: RawWalletTransfer,
  config: DevWalletAuditConfig,
): { category: DevWalletTransactionCategory; notes: string[] } {
  const notes: string[] = [];
  const rules = config.tagRules ?? DEFAULT_TAG_RULES;
  const lowerMemo = (transfer.memo ?? "").toLowerCase();

  for (const rule of rules) {
    if (rule.match.some((term) => lowerMemo.includes(term.toLowerCase()))) {
      notes.push(`Matched memo tag rule for ${rule.category}.`);
      return { category: rule.category, notes };
    }
  }

  const destinationIsDev =
    transfer.destination === config.devWallet ||
    transfer.destinationOwner === config.devWallet;
  const sourceIsDev =
    transfer.source === config.devWallet || transfer.sourceOwner === config.devWallet;

  if (destinationIsDev) {
    notes.push("Transfer moved into the dev wallet.");
    return { category: "inflow", notes };
  }

  if (sourceIsDev) {
    notes.push("Outgoing transfer did not match a published tag rule.");
    return { category: "unknown", notes };
  }

  notes.push("Transfer could not be classified from wallet direction alone.");
  return { category: "unknown", notes };
}

export function isPublicRewardCategory(
  category: DevWalletTransactionCategory,
  config: DevWalletAuditConfig,
): boolean {
  const rewardCategories = config.rewardCategories ?? DEFAULT_REWARD_CATEGORIES;
  return rewardCategories.includes(category);
}
