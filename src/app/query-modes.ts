import {
  readFreshQuerySnapshot,
  writeQuerySnapshot,
} from "../cache/query-snapshots.js";
import { fetchAirdropResults } from "../dev-wallet/airdrops.js";
import { inferLikelyDevWallet, parseTokenUrlOrMint } from "../dev-wallet/resolve.js";
import { fetchRewardSummary } from "../dev-wallet/reward-summary.js";
import { fetchTopHolders } from "../dev-wallet/top-holders.js";

export const QUERY_MODES = [
  {
    id: "top-holders",
    label: "Top Holders",
    description: "Show the largest holders for a token mint.",
  },
  {
    id: "airdrop-filter",
    label: "Transfers",
    description: "View outgoing transfers for a mint, with optional recipient consolidation.",
  },
] as const;

export type QueryModeId = (typeof QUERY_MODES)[number]["id"];

export async function runQueryMode(
  mode: QueryModeId,
  input: {
    wallet?: string;
    mintOrToken: string;
    limit: number;
    rpcUrl?: string;
    minimumAmount?: number;
    uniqueRecipients?: boolean;
  },
) {
  const resolvedToken = parseTokenUrlOrMint(input.mintOrToken);
  if (!resolvedToken) {
    throw new Error("Could not parse a mint from the provided token input.");
  }

  const cacheInput = {
    mode,
    mint: resolvedToken.mint,
    wallet: input.wallet?.trim() || null,
    limit: input.limit,
    minimumAmount: input.minimumAmount,
    uniqueRecipients: input.uniqueRecipients,
  };

  const cached = await readFreshQuerySnapshot(cacheInput);
  if (cached) {
    return cached;
  }

  if (mode === "top-holders") {
    return writeQuerySnapshot(cacheInput, {
      resolvedWallet: input.wallet?.trim() || null,
      resolvedMint: resolvedToken.mint,
      results: await fetchTopHolders(resolvedToken.mint, {
        rpcUrl: input.rpcUrl,
        limit: input.limit,
      }),
    });
  }

  if (mode === "airdrop-filter") {
    const resolved =
      input.wallet?.trim()
        ? {
            mint: resolvedToken.mint,
            wallet: input.wallet.trim(),
          }
        : await inferLikelyDevWallet(resolvedToken.mint, {
            rpcUrl: input.rpcUrl,
            limit: input.limit,
          });

    if (!resolved.wallet) {
      throw new Error("Could not infer a likely dev wallet from this token.");
    }

    return writeQuerySnapshot(cacheInput, {
      resolvedWallet: resolved.wallet,
      resolvedMint: resolvedToken.mint,
      results: input.uniqueRecipients
        ? await fetchRewardSummary(resolved.wallet, resolved.mint, {
          rpcUrl: input.rpcUrl,
          signatureLimit: input.limit,
          minimumAmount: input.minimumAmount,
        })
        : await fetchAirdropResults(resolved.wallet, resolvedToken.mint, {
          rpcUrl: input.rpcUrl,
          signatureLimit: input.limit,
        }),
    });
  }

  throw new Error("This query mode is not implemented yet.");
}
