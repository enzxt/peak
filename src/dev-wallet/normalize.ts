import { classifyTransfer } from "./classify.js";
import {
  DevWalletAuditConfig,
  DevWalletTransaction,
  RawWalletTransfer,
} from "./types.js";

export function normalizeTransfer(
  transfer: RawWalletTransfer,
  config: DevWalletAuditConfig,
): DevWalletTransaction {
  const { category, notes } = classifyTransfer(transfer, config);
  const amountUi = transfer.amount / 10 ** transfer.decimals;
  const direction =
    transfer.destination === config.devWallet ||
    transfer.destinationOwner === config.devWallet
      ? "in"
      : "out";

  return {
    signature: transfer.signature,
    slot: transfer.slot,
    blockTime: transfer.blockTime,
    mint: transfer.mint,
    symbol: transfer.symbol ?? "UNKNOWN",
    amountRaw: transfer.amount,
    amountUi,
    source: transfer.source,
    sourceOwner: transfer.sourceOwner,
    destination: transfer.destination,
    destinationOwner: transfer.destinationOwner,
    direction,
    category,
    memo: transfer.memo,
    notes,
  };
}

export function normalizeTransfers(
  transfers: RawWalletTransfer[],
  config: DevWalletAuditConfig,
): DevWalletTransaction[] {
  return transfers
    .map((transfer) => normalizeTransfer(transfer, config))
    .sort((a, b) => b.blockTime - a.blockTime);
}
