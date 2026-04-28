import { fetchTopTokenHolders } from "./rpc.js";

export interface TopHolderRow {
  rank: number;
  holder: string;
  amountHeld: number;
  label?: string;
}

export interface FetchTopHoldersOptions {
  rpcUrl?: string;
  limit?: number;
}

export async function fetchTopHolders(
  mint: string,
  options: FetchTopHoldersOptions = {},
): Promise<TopHolderRow[]> {
  const holders = await fetchTopTokenHolders(mint, {
    rpcUrl: options.rpcUrl,
    limit: Math.min(50, (options.limit ?? 25) + 15),
  });

  return holders
    .filter((holder) => holder.holderType === "user")
    .slice(0, options.limit ?? 25)
    .map((holder, index) => ({
      rank: index + 1,
      holder: holder.owner,
      amountHeld: holder.amountUi,
      label: holder.label,
    }));
}
