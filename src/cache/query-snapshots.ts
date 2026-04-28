import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export type SnapshotQueryMode = "top-holders" | "airdrop-filter" | "reward-summary";
export type SnapshotSource = "cache" | "live-rpc";

export interface QuerySnapshotPayload<TResult> {
  resolvedWallet: string | null;
  resolvedMint: string;
  results: TResult;
  generatedAt: string;
  source: SnapshotSource;
}

interface SnapshotEnvelope<TResult> {
  queryType: SnapshotQueryMode;
  cacheKey: string;
  resolvedWallet: string | null;
  resolvedMint: string;
  rowCount: number;
  generatedAt: string;
  results: TResult;
}

interface QuerySnapshotKeyInput {
  mode: SnapshotQueryMode;
  mint: string;
  wallet?: string | null;
  limit: number;
  minimumAmount?: number;
}

const DEFAULT_FRESHNESS_MS = 4 * 60 * 60 * 1000;
const FRESHNESS_BY_MODE: Record<SnapshotQueryMode, number> = {
  "top-holders": DEFAULT_FRESHNESS_MS,
  "airdrop-filter": DEFAULT_FRESHNESS_MS,
  "reward-summary": DEFAULT_FRESHNESS_MS,
};

function sanitizeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function resolveNamespace(mint: string): string {
  const fromEnv = process.env.CACHE_NAMESPACE?.trim();
  if (fromEnv) {
    return sanitizeSegment(fromEnv);
  }

  return sanitizeSegment(mint);
}

function buildCacheKey(input: QuerySnapshotKeyInput): string {
  const wallet = input.wallet?.trim() ? sanitizeSegment(input.wallet.trim()) : "auto";
  const minAmount = Number(input.minimumAmount ?? 0);

  return [
    input.mode,
    `mint-${sanitizeSegment(input.mint)}`,
    `wallet-${wallet}`,
    `limit-${input.limit}`,
    `min-${Number.isFinite(minAmount) ? minAmount : 0}`,
  ].join("__");
}

function resolveSnapshotPath(input: QuerySnapshotKeyInput): string {
  const namespace = resolveNamespace(input.mint);
  const cacheKey = buildCacheKey(input);
  return resolve(process.cwd(), "local-data", "cache", namespace, `${cacheKey}.json`);
}

export async function readFreshQuerySnapshot<TResult>(
  input: QuerySnapshotKeyInput,
): Promise<QuerySnapshotPayload<TResult> | null> {
  const filepath = resolveSnapshotPath(input);

  try {
    const contents = await readFile(filepath, "utf8");
    const snapshot = JSON.parse(contents) as SnapshotEnvelope<TResult>;
    const generatedAtMs = Date.parse(snapshot.generatedAt);

    if (!Number.isFinite(generatedAtMs)) {
      return null;
    }

    const freshnessMs = FRESHNESS_BY_MODE[input.mode] ?? DEFAULT_FRESHNESS_MS;
    if (Date.now() - generatedAtMs > freshnessMs) {
      return null;
    }

    return {
      resolvedWallet: snapshot.resolvedWallet,
      resolvedMint: snapshot.resolvedMint,
      results: snapshot.results,
      generatedAt: snapshot.generatedAt,
      source: "cache",
    };
  } catch {
    return null;
  }
}

export async function writeQuerySnapshot<TResult extends ArrayLike<unknown>>(
  input: QuerySnapshotKeyInput,
  payload: {
    resolvedWallet: string | null;
    resolvedMint: string;
    results: TResult;
  },
): Promise<QuerySnapshotPayload<TResult>> {
  const filepath = resolveSnapshotPath(input);
  const generatedAt = new Date().toISOString();
  const envelope: SnapshotEnvelope<TResult> = {
    queryType: input.mode,
    cacheKey: buildCacheKey(input),
    resolvedWallet: payload.resolvedWallet,
    resolvedMint: payload.resolvedMint,
    rowCount: payload.results.length,
    generatedAt,
    results: payload.results,
  };

  await mkdir(dirname(filepath), { recursive: true });
  await writeFile(filepath, JSON.stringify(envelope, null, 2), "utf8");

  return {
    ...payload,
    generatedAt,
    source: "live-rpc",
  };
}
