import { fetchAirdropResults } from "./airdrops.js";

export interface RewardSummaryRow {
  recipient: string;
  totalReceived: number;
  transferCount: number;
  latestAmount: number;
  latestSignature: string;
  latestBlockTime: number;
}

export interface FetchRewardSummaryOptions {
  rpcUrl?: string;
  signatureLimit?: number;
  minimumAmount?: number;
}

export async function fetchRewardSummary(
  wallet: string,
  mint: string,
  options: FetchRewardSummaryOptions = {},
): Promise<RewardSummaryRow[]> {
  const transfers = await fetchAirdropResults(wallet, mint, {
    rpcUrl: options.rpcUrl,
    signatureLimit: options.signatureLimit,
  });

  const minimumAmount = options.minimumAmount ?? 0;
  const filtered = transfers.filter((transfer) => transfer.amount >= minimumAmount);
  const grouped = new Map<string, RewardSummaryRow>();

  for (const transfer of filtered) {
    const existing = grouped.get(transfer.recipient);

    if (!existing) {
      grouped.set(transfer.recipient, {
        recipient: transfer.recipient,
        totalReceived: transfer.amount,
        transferCount: 1,
        latestAmount: transfer.amount,
        latestSignature: transfer.signature,
        latestBlockTime: transfer.blockTime,
      });
      continue;
    }

    existing.totalReceived += transfer.amount;
    existing.transferCount += 1;

    if (transfer.blockTime > existing.latestBlockTime) {
      existing.latestAmount = transfer.amount;
      existing.latestSignature = transfer.signature;
      existing.latestBlockTime = transfer.blockTime;
    }
  }

  return [...grouped.values()].sort((a, b) => b.totalReceived - a.totalReceived);
}
