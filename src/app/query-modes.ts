import { fetchAirdropResults } from "../dev-wallet/airdrops.js";

export const QUERY_MODES = [
  {
    id: "airdrop-filter",
    label: "Airdrop Filter",
    description: "Find outgoing transfers for a specific mint from a dev wallet.",
  },
  {
    id: "coming-soon",
    label: "More Queries Soon",
    description: "Reserved for future wallet and leaderboard tools.",
  },
] as const;

export type QueryModeId = (typeof QUERY_MODES)[number]["id"];

export async function runQueryMode(
  mode: QueryModeId,
  input: {
    wallet: string;
    mint: string;
    limit: number;
    rpcUrl?: string;
  },
) {
  if (mode === "airdrop-filter") {
    return fetchAirdropResults(input.wallet, input.mint, {
      rpcUrl: input.rpcUrl,
      signatureLimit: input.limit,
    });
  }

  throw new Error("This query mode is not implemented yet.");
}
