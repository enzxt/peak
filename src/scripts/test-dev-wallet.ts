import {
  fetchWalletTransfers,
  getPublicRewardTransactions,
  normalizeTransfers,
} from "../dev-wallet/index.js";
import { loadLocalEnv } from "../config/load-env.js";

loadLocalEnv();

interface CliOptions {
  wallet: string;
  address: string;
  limit: number;
  before?: string;
  rpcUrl?: string;
  mint?: string;
  json: boolean;
}

const DEFAULT_WALLET = "AgyEoDHFxZvkYFaHgUZ5TcFk6VRB3idzD4NaPmRjDsZ8";
const DEFAULT_MINT = "71utbKBwCwL22NsJZzeuR23K3BTZaTmzj3X7kzTzpump";
const DEFAULT_ADDRESS = "wboB5jMNtDqUJw7BaJHoyosA4TFgNKUsYMSZDVWBMbK";

function printHelp(): void {
  console.log(`Usage:

  npm.cmd run wallet:test -- --wallet <address> [--address <queryAddress>] [--limit <count>] [--before <signature>] [--rpc <url>] [--mint <tokenMint>] [--json]

Examples:

  npm.cmd run wallet:test
  npm.cmd run wallet:test -- --wallet ${DEFAULT_WALLET} --limit 50
  npm.cmd run wallet:test -- --address ${DEFAULT_ADDRESS}
  npm.cmd run wallet:test -- --wallet ${DEFAULT_WALLET} --mint 71utbKBwCwL22NsJZzeuR23K3BTZaTmzj3X7kzTzpump
  npm.cmd run wallet:test -- --wallet ${DEFAULT_WALLET} --before <signature>
  npm.cmd run wallet:test -- --json

Environment variables still supported:

  DEV_WALLET
  DEV_WALLET_SIG_LIMIT
  DEV_WALLET_BEFORE
  SOLANA_RPC_URL
  DEV_WALLET_MINT
`);
}

function parseCliArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    wallet: process.env.DEV_WALLET ?? DEFAULT_WALLET,
    address: process.env.DEV_WALLET_ADDRESS ?? DEFAULT_ADDRESS,
    limit: Number(process.env.DEV_WALLET_SIG_LIMIT ?? "5"),
    before: process.env.DEV_WALLET_BEFORE,
    rpcUrl: process.env.SOLANA_RPC_URL,
    mint: process.env.DEV_WALLET_MINT ?? DEFAULT_MINT,
    json: argv.includes("--json"),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }

    if (arg === "--wallet" && next) {
      options.wallet = next;
      index += 1;
      continue;
    }

    if (arg === "--address" && next) {
      options.address = next;
      index += 1;
      continue;
    }

    if (arg === "--limit" && next) {
      options.limit = Number(next);
      index += 1;
      continue;
    }

    if (arg === "--before" && next) {
      options.before = next;
      index += 1;
      continue;
    }

    if (arg === "--rpc" && next) {
      options.rpcUrl = next;
      index += 1;
      continue;
    }

    if (arg === "--mint" && next) {
      options.mint = next;
      index += 1;
    }
  }

  return options;
}

function printSummary(payload: {
  wallet: string;
  address: string;
  rpcUrl: string | undefined;
  signatureLimit: number;
  before?: string;
  mint?: string;
  transferCount: number;
  publicRewardCount: number;
  latestTransfers: unknown[];
  latestPublicRewards: unknown[];
}): void {
  console.log(`Wallet: ${payload.wallet}`);
  console.log(`Query address: ${payload.address}`);
  console.log(`RPC: ${payload.rpcUrl ?? "default"}`);
  console.log(`Signature limit: ${payload.signatureLimit}`);
  console.log(`Before cursor: ${payload.before ?? "none"}`);
  console.log(`Mint filter: ${payload.mint ?? "none"}`);
  console.log(`Transfers found: ${payload.transferCount}`);
  console.log(`Public reward matches: ${payload.publicRewardCount}`);
  console.log("");
  console.log("Latest transfers:");
  console.log(JSON.stringify(payload.latestTransfers, null, 2));
  console.log("");
  console.log("Latest public reward matches:");
  console.log(JSON.stringify(payload.latestPublicRewards, null, 2));
}

async function main(): Promise<void> {
  const options = parseCliArgs(process.argv.slice(2));

  const transfers = await fetchWalletTransfers(options.wallet, {
    address: options.address,
    limit: options.limit,
    before: options.before,
    rpcUrl: options.rpcUrl,
    mint: options.mint,
  });

  const normalized = normalizeTransfers(transfers, {
    devWallet: options.wallet,
  });

  const publicRewards = getPublicRewardTransactions(normalized, {
    devWallet: options.wallet,
  });

  const payload = {
    wallet: options.wallet,
    address: options.address,
    rpcUrl: options.rpcUrl,
    signatureLimit: options.limit,
    before: options.before,
    mint: options.mint,
    transferCount: normalized.length,
    publicRewardCount: publicRewards.length,
    latestTransfers: normalized.slice(0, 10),
    latestPublicRewards: publicRewards.slice(0, 10),
  };

  if (options.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  printSummary(payload);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
