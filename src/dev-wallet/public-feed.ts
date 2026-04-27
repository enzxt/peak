import { isPublicRewardCategory } from "./classify.js";
import { DevWalletAuditConfig, DevWalletTransaction } from "./types.js";

export interface PublicRewardFeedItem {
  signature: string;
  blockTime: number;
  amountUi: number;
  symbol: string;
  destination: string;
  category: string;
  memo?: string;
}

export function getPublicRewardTransactions(
  transactions: DevWalletTransaction[],
  config: DevWalletAuditConfig,
): PublicRewardFeedItem[] {
  return transactions
    .filter(
      (transaction) =>
        transaction.direction === "out" &&
        isPublicRewardCategory(transaction.category, config),
    )
    .map((transaction) => ({
      signature: transaction.signature,
      blockTime: transaction.blockTime,
      amountUi: transaction.amountUi,
      symbol: transaction.symbol,
      destination: transaction.destination,
      category: transaction.category,
      memo: transaction.memo,
    }));
}
