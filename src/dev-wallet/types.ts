export type DevWalletTransactionCategory =
  | "reward"
  | "airdrop"
  | "ops"
  | "inflow"
  | "unknown";

export interface RawWalletTransfer {
  signature: string;
  slot: number;
  blockTime: number;
  source: string;
  sourceOwner?: string;
  destination: string;
  destinationOwner?: string;
  mint: string;
  amount: number;
  decimals: number;
  symbol?: string;
  memo?: string;
  program: "spl-token" | "spl-token-2022" | "system";
}

export interface WalletTransactionTagRule {
  category: DevWalletTransactionCategory;
  match: string[];
}

export interface DevWalletTransaction {
  signature: string;
  slot: number;
  blockTime: number;
  mint: string;
  symbol: string;
  amountRaw: number;
  amountUi: number;
  source: string;
  sourceOwner?: string;
  destination: string;
  destinationOwner?: string;
  direction: "in" | "out";
  category: DevWalletTransactionCategory;
  memo?: string;
  notes: string[];
}

export interface DevWalletAuditConfig {
  devWallet: string;
  tagRules?: WalletTransactionTagRule[];
  rewardCategories?: DevWalletTransactionCategory[];
}

export interface FetchWalletTransfersOptions {
  rpcUrl?: string;
  limit?: number;
  before?: string;
  mint?: string;
  address?: string;
}

export interface TokenAccountRecord {
  pubkey: string;
  mint: string;
  owner: string;
  amountRaw: string;
  decimals: number;
}
