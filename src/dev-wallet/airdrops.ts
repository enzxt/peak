import { normalizeTransfers } from "./normalize.js";
import {
  fetchTokenAccountsByOwner,
  fetchWalletTransfers,
} from "./rpc.js";

export interface AirdropResult {
  recipient: string;
  amount: number;
  from: "dev wallet";
  signature: string;
  blockTime: number;
}

export interface FetchAirdropResultsOptions {
  rpcUrl?: string;
  signatureLimit?: number;
}

export async function fetchAirdropResults(
  wallet: string,
  mint: string,
  options: FetchAirdropResultsOptions = {},
): Promise<AirdropResult[]> {
  const tokenAccounts = await fetchTokenAccountsByOwner(wallet, mint, {
    rpcUrl: options.rpcUrl,
  });

  if (tokenAccounts.length === 0) {
    return [];
  }

  const allTransfers = [];

  for (const tokenAccount of tokenAccounts) {
    const transfers = await fetchWalletTransfers(wallet, {
      rpcUrl: options.rpcUrl,
      limit: options.signatureLimit ?? 5,
      mint,
      address: tokenAccount.pubkey,
    });

    allTransfers.push(...transfers);
  }

  const normalized = normalizeTransfers(allTransfers, {
    devWallet: wallet,
  });

  const outgoing = normalized.filter(
    (transfer) => transfer.direction === "out" && transfer.mint === mint,
  );

  const deduped = new Map<string, AirdropResult>();

  for (const transfer of outgoing) {
    const key = [
      transfer.signature,
      transfer.destinationOwner ?? transfer.destination,
      transfer.amountRaw,
    ].join(":");

    if (deduped.has(key)) {
      continue;
    }

    deduped.set(key, {
      recipient: transfer.destinationOwner ?? transfer.destination,
      amount: transfer.amountUi,
      from: "dev wallet",
      signature: transfer.signature,
      blockTime: transfer.blockTime,
    });
  }

  return [...deduped.values()].sort((a, b) => b.blockTime - a.blockTime);
}
