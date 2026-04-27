import {
  FetchWalletTransfersOptions,
  RawWalletTransfer,
  TokenAccountRecord,
} from "./types.js";

const DEFAULT_RPC_URL = "https://api.mainnet-beta.solana.com";
const LAMPORTS_PER_SOL = 1_000_000_000;

interface RpcRequest<T> {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params: T;
}

interface SignatureInfo {
  signature: string;
  slot: number;
  blockTime: number | null;
  err: object | null;
  memo: string | null;
}

interface ParsedInstructionInfo {
  source?: string;
  destination?: string;
  authority?: string;
  multisigAuthority?: string;
  amount?: string;
  lamports?: number;
  mint?: string;
  tokenAmount?: {
    amount: string;
    decimals: number;
    uiAmountString?: string;
  };
}

interface ParsedTokenBalance {
  accountIndex: number;
  mint: string;
  owner?: string;
  uiTokenAmount?: {
    amount: string;
    decimals: number;
    uiAmountString?: string;
  };
}

interface ParsedInstruction {
  program: string;
  parsed?: {
    type?: string;
    info?: ParsedInstructionInfo;
  };
}

interface ParsedTransactionMessage {
  accountKeys: Array<
    | string
    | {
        pubkey: string;
      }
  >;
  instructions: ParsedInstruction[];
}

interface ParsedTransactionResponse {
  slot: number;
  blockTime: number | null;
  transaction: {
    signatures: string[];
    message: ParsedTransactionMessage;
  };
  meta: {
    err: object | null;
    innerInstructions?: Array<{
      instructions: ParsedInstruction[];
    }>;
    preTokenBalances?: ParsedTokenBalance[];
    postTokenBalances?: ParsedTokenBalance[];
  } | null;
}

interface TokenAccountsByOwnerResponse {
  value: Array<{
    pubkey: string;
    account: {
      data: {
        parsed?: {
          info?: {
            mint?: string;
            owner?: string;
            tokenAmount?: {
              amount: string;
              decimals: number;
            };
          };
        };
      };
    };
  }>;
}

interface TokenAccountContext {
  mint: string;
  owner?: string;
  decimals: number;
}

async function rpcCall<TParams, TResult>(
  method: string,
  params: TParams,
  rpcUrl: string,
): Promise<TResult> {
  const payload: RpcRequest<TParams> = {
    jsonrpc: "2.0",
    id: Date.now(),
    method,
    params,
  };

  let attempt = 0;

  while (attempt < 10) {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 429) {
      attempt += 1;
      await delay(1000 * attempt);
      continue;
    }

    if (!response.ok) {
      throw new Error(`RPC request failed: ${response.status} ${response.statusText}`);
    }

    const json = (await response.json()) as {
      result?: TResult;
      error?: { message?: string };
    };

    if (json.error) {
      throw new Error(`RPC error: ${json.error.message ?? "Unknown error"}`);
    }

    if (!("result" in json)) {
      throw new Error("RPC response did not include a result.");
    }

    return json.result as TResult;
  }

  throw new Error("RPC request failed after repeated rate-limit retries.");
}

async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function accountKeyToString(
  accountKey: string | { pubkey: string },
): string {
  return typeof accountKey === "string" ? accountKey : accountKey.pubkey;
}

function buildTokenAccountMap(
  transaction: ParsedTransactionResponse,
): Map<string, TokenAccountContext> {
  const map = new Map<string, TokenAccountContext>();
  const accountKeys = transaction.transaction.message.accountKeys.map(accountKeyToString);
  const tokenBalances = [
    ...(transaction.meta?.preTokenBalances ?? []),
    ...(transaction.meta?.postTokenBalances ?? []),
  ];

  for (const balance of tokenBalances) {
    const account = accountKeys[balance.accountIndex];
    if (!account) {
      continue;
    }

    map.set(account, {
      mint: balance.mint,
      owner: balance.owner,
      decimals: balance.uiTokenAmount?.decimals ?? 0,
    });
  }

  return map;
}

function parseInstructionTransfer(
  instruction: ParsedInstruction,
  signature: string,
  slot: number,
  blockTime: number,
  devWallet: string,
  tokenAccountMap: Map<string, TokenAccountContext>,
): RawWalletTransfer | null {
  if (!instruction.parsed?.info) {
    return null;
  }

  const type = instruction.parsed.type ?? "";
  const info = instruction.parsed.info;

  if (
    (instruction.program === "spl-token" ||
      instruction.program === "spl-token-2022") &&
    (type === "transfer" || type === "transferChecked") &&
    info.source &&
    info.destination
  ) {
    const sourceContext = tokenAccountMap.get(info.source);
    const destinationContext = tokenAccountMap.get(info.destination);
    const mint = info.mint ?? sourceContext?.mint ?? destinationContext?.mint;
    const decimals =
      info.tokenAmount?.decimals ??
      sourceContext?.decimals ??
      destinationContext?.decimals ??
      0;
    const amountText = info.tokenAmount?.amount ?? info.amount ?? "0";
    const amount = Number(amountText);
    const ownerMatches =
      sourceContext?.owner === devWallet || destinationContext?.owner === devWallet;

    if (!mint || !Number.isFinite(amount) || amount <= 0) {
      return null;
    }

    if (
      info.source !== devWallet &&
      info.destination !== devWallet &&
      !ownerMatches &&
      info.authority !== devWallet &&
      info.multisigAuthority !== devWallet
    ) {
      return null;
    }

    return {
      signature,
      slot,
      blockTime,
      source: info.source,
      sourceOwner: sourceContext?.owner,
      destination: info.destination,
      destinationOwner: destinationContext?.owner,
      mint,
      amount,
      decimals,
      symbol: "UNKNOWN",
      memo: undefined,
      program: instruction.program,
    };
  }

  if (
    instruction.program === "system" &&
    type === "transfer" &&
    info.source &&
    info.destination &&
    typeof info.lamports === "number"
  ) {
    if (info.source !== devWallet && info.destination !== devWallet) {
      return null;
    }

    return {
      signature,
      slot,
      blockTime,
      source: info.source,
      sourceOwner: info.source,
      destination: info.destination,
      destinationOwner: info.destination,
      mint: "SOL",
      amount: info.lamports,
      decimals: 9,
      symbol: "SOL",
      memo: undefined,
      program: "system",
    };
  }

  return null;
}

function getAllInstructions(transaction: ParsedTransactionResponse): ParsedInstruction[] {
  const topLevel = transaction.transaction.message.instructions;
  const inner =
    transaction.meta?.innerInstructions?.flatMap((entry) => entry.instructions) ?? [];

  return [...topLevel, ...inner];
}

export async function fetchWalletTransfers(
  devWallet: string,
  options: FetchWalletTransfersOptions = {},
): Promise<RawWalletTransfer[]> {
  const rpcUrl = options.rpcUrl ?? process.env.SOLANA_RPC_URL ?? DEFAULT_RPC_URL;
  const limit = options.limit ?? 25;
  const address = options.address ?? devWallet;

  const signatures = await rpcCall<
    [string, { limit: number; before?: string }],
    SignatureInfo[]
  >(
    "getSignaturesForAddress",
    [address, { limit, before: options.before }],
    rpcUrl,
  );

  const successfulSignatures = signatures.filter((item) => !item.err);
  const transactions: Array<ParsedTransactionResponse | null> = [];

  for (const item of successfulSignatures) {
    const transaction = await rpcCall<
      [string, { encoding: "jsonParsed"; maxSupportedTransactionVersion: 0 }],
      ParsedTransactionResponse | null
    >(
      "getTransaction",
      [
        item.signature,
        {
          encoding: "jsonParsed",
          maxSupportedTransactionVersion: 0,
        },
      ],
      rpcUrl,
    );

    transactions.push(transaction);
    await delay(150);
  }

  const transfers: RawWalletTransfer[] = [];

  for (const transaction of transactions) {
    if (!transaction?.meta || transaction.meta.err) {
      continue;
    }

    const signature = transaction.transaction.signatures[0];
    const slot = transaction.slot;
    const blockTime = transaction.blockTime ?? 0;
    const memo = signatures.find((item) => item.signature === signature)?.memo ?? undefined;
    const instructions = getAllInstructions(transaction);
    const tokenAccountMap = buildTokenAccountMap(transaction);

    for (const instruction of instructions) {
      const transfer = parseInstructionTransfer(
        instruction,
        signature,
        slot,
        blockTime,
        devWallet,
        tokenAccountMap,
      );

      if (!transfer) {
        continue;
      }

      if (options.mint && transfer.mint !== options.mint) {
        continue;
      }

      transfers.push({
        ...transfer,
        memo,
      });
    }
  }

  return transfers.sort((a, b) => b.blockTime - a.blockTime);
}

export async function fetchTokenAccountsByOwner(
  owner: string,
  mint: string,
  options: { rpcUrl?: string } = {},
): Promise<TokenAccountRecord[]> {
  const rpcUrl = options.rpcUrl ?? process.env.SOLANA_RPC_URL ?? DEFAULT_RPC_URL;
  const response = await rpcCall<
    [string, { mint: string }, { encoding: "jsonParsed" }],
    TokenAccountsByOwnerResponse
  >(
    "getTokenAccountsByOwner",
    [owner, { mint }, { encoding: "jsonParsed" }],
    rpcUrl,
  );

  return response.value
    .map((entry) => {
      const info = entry.account.data.parsed?.info;

      if (!info?.mint || !info.owner || !info.tokenAmount) {
        return null;
      }

      return {
        pubkey: entry.pubkey,
        mint: info.mint,
        owner: info.owner,
        amountRaw: info.tokenAmount.amount,
        decimals: info.tokenAmount.decimals,
      };
    })
    .filter((entry): entry is TokenAccountRecord => entry !== null);
}

export function formatAmountUi(amount: number, decimals: number): number {
  return amount / 10 ** decimals;
}

export function formatSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}
