import { fetchTopTokenHolders } from "./rpc.js";

export interface TopHolderRow {
  rank: number;
  holder: string;
  amountHeld: number;
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
    limit: options.limit ?? 25,
  });

  return holders.map((holder, index) => ({
    rank: index + 1,
    holder: holder.owner,
    amountHeld: holder.amountUi,
  }));
}
