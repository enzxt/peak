interface RaydiumPoolsByMintResponse {
  success?: boolean;
  data?: {
    data?: Array<{
      id?: string;
      type?: string;
      mintA?: { address?: string };
      mintB?: { address?: string };
      mintAmountA?: number;
      mintAmountB?: number;
    }>;
  };
}

export interface LiquidityReserveHint {
  source: "raydium";
  poolId: string;
  amountHeld: number;
}

export async function fetchLiquidityReserveHints(
  mint: string,
): Promise<LiquidityReserveHint[]> {
  const url =
    "https://api-v3.raydium.io/pools/info/mint" +
    `?mint1=${mint}&poolType=all&poolSortField=default&sortType=desc&pageSize=20&page=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as RaydiumPoolsByMintResponse;
    const pools = payload.data?.data ?? [];
    const results: LiquidityReserveHint[] = [];

    for (const pool of pools) {
      if (!pool.id) {
        continue;
      }

      const reserveAmount =
        pool.mintA?.address === mint
          ? pool.mintAmountA
          : pool.mintB?.address === mint
            ? pool.mintAmountB
            : undefined;

      if (typeof reserveAmount !== "number" || !Number.isFinite(reserveAmount) || reserveAmount <= 0) {
        continue;
      }

      results.push({
        source: "raydium",
        poolId: pool.id,
        amountHeld: reserveAmount,
      });
    }

    return results;
  } catch {
    return [];
  }
}

export function matchesLiquidityReserve(
  amountHeld: number,
  reserves: LiquidityReserveHint[],
): boolean {
  return reserves.some((reserve) => {
    const tolerance = Math.max(0.000001, reserve.amountHeld * 0.000001);
    return Math.abs(amountHeld - reserve.amountHeld) <= tolerance;
  });
}
