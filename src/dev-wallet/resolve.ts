import { fetchMintTransfers } from "./rpc.js";

export interface ResolvedTokenInput {
  mint: string;
}

export interface DevWalletCandidate {
  wallet: string;
  totalSent: number;
  transferCount: number;
}

export interface ResolvedRewardSummaryInput {
  mint: string;
  wallet: string | null;
  candidates: DevWalletCandidate[];
}

const BASE58_ADDRESS_PATTERN = /([1-9A-HJ-NP-Za-km-z]{32,50})/;

export function parseTokenUrlOrMint(input: string): ResolvedTokenInput | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const match = trimmed.match(BASE58_ADDRESS_PATTERN);
  if (!match) {
    return null;
  }

  return { mint: match[1] };
}

export async function inferLikelyDevWallet(
  mint: string,
  options: {
    rpcUrl?: string;
    limit?: number;
  } = {},
): Promise<ResolvedRewardSummaryInput> {
  const pumpCreator = await fetchPumpFunCreator(mint);
  if (pumpCreator) {
    return {
      mint,
      wallet: pumpCreator,
      candidates: [
        {
          wallet: pumpCreator,
          totalSent: 0,
          transferCount: 0,
        },
      ],
    };
  }

  const transfers = await fetchMintTransfers(mint, {
    rpcUrl: options.rpcUrl,
    limit: options.limit ?? 25,
  });

  const grouped = new Map<string, DevWalletCandidate>();

  for (const transfer of transfers) {
    const sender = transfer.sourceOwner ?? transfer.source;
    const recipient = transfer.destinationOwner ?? transfer.destination;

    if (sender === recipient) {
      continue;
    }

    const existing = grouped.get(sender);
    const amountUi = transfer.amount / 10 ** transfer.decimals;

    if (!existing) {
      grouped.set(sender, {
        wallet: sender,
        totalSent: amountUi,
        transferCount: 1,
      });
      continue;
    }

    existing.totalSent += amountUi;
    existing.transferCount += 1;
  }

  const candidates = [...grouped.values()].sort((a, b) => {
    if (b.totalSent !== a.totalSent) {
      return b.totalSent - a.totalSent;
    }

    return b.transferCount - a.transferCount;
  });

  return {
    mint,
    wallet: candidates[0]?.wallet ?? null,
    candidates,
  };
}

async function fetchPumpFunCreator(mint: string): Promise<string | null> {
  if (!mint.endsWith("pump")) {
    return null;
  }

  try {
    const response = await fetch(`https://frontend-api-v3.pump.fun/coins/${mint}`);
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { creator?: string };
    return payload.creator ?? null;
  } catch {
    return null;
  }
}
