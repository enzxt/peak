import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { loadLocalEnv } from "../config/load-env.js";
import { QUERY_MODES, runQueryMode, type QueryModeId } from "./query-modes.js";

loadLocalEnv();

const PORT = Number(process.env.PORT ?? "4173");
const HOST = "127.0.0.1";
const DEFAULT_MINT = "71utbKBwCwL22NsJZzeuR23K3BTZaTmzj3X7kzTzpump";
const DEFAULT_MODE: QueryModeId = "top-holders";
const DEFAULT_LIMIT = 10;
const MODES_JSON = JSON.stringify(QUERY_MODES);

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>peak dashboard</title>
    <style>
      :root {
        --bg: #0b1220;
        --bg-soft: #10182a;
        --panel: rgba(15, 23, 42, 0.86);
        --panel-strong: rgba(9, 15, 28, 0.95);
        --line: rgba(148, 163, 184, 0.18);
        --line-strong: rgba(148, 163, 184, 0.28);
        --text: #e5eefb;
        --muted: #8ea0bd;
        --accent: #16a34a;
        --accent-soft: rgba(22, 163, 74, 0.14);
        --gold: #f7c66a;
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top, rgba(22, 163, 74, 0.20), transparent 30%),
          radial-gradient(circle at bottom right, rgba(247, 198, 106, 0.10), transparent 24%),
          linear-gradient(180deg, #050914 0%, #0b1220 48%, #0d1324 100%);
      }

      main {
        width: min(1180px, calc(100vw - 32px));
        margin: 32px auto 56px;
      }

      .shell {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 28px;
        overflow: hidden;
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(12px);
      }

      .hero {
        padding: 36px;
        background:
          linear-gradient(135deg, rgba(22, 163, 74, 0.18), rgba(8, 15, 28, 0.18)),
          var(--panel-strong);
        border-bottom: 1px solid var(--line);
      }

      .eyebrow {
        margin: 0 0 10px;
        color: var(--gold);
        font-size: 12px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      h1 {
        margin: 0;
        font-size: clamp(42px, 10vw, 74px);
        line-height: 0.95;
        letter-spacing: -0.05em;
      }

      .hero-copy {
        width: min(700px, 100%);
        margin-top: 14px;
        color: var(--muted);
        font-size: 17px;
        line-height: 1.6;
      }

      .mint-gate {
        display: grid;
        gap: 14px;
        margin-top: 28px;
        width: min(700px, 100%);
      }

      .mint-gate-row {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      label {
        display: block;
        margin-bottom: 8px;
        color: var(--muted);
        font-size: 12px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      input, select, button {
        font: inherit;
      }

      input, select {
        width: 100%;
        min-width: 0;
        color: var(--text);
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 14px 16px;
      }

      input::placeholder {
        color: #6f829f;
      }

      button {
        border: 0;
        border-radius: 999px;
        padding: 14px 22px;
        color: white;
        background: linear-gradient(135deg, #16a34a, #15803d);
        font-weight: 700;
        cursor: pointer;
      }

      button:disabled {
        cursor: wait;
        opacity: 0.7;
      }

      .dashboard {
        display: none;
        padding: 28px 28px 32px;
        gap: 22px;
      }

      .dashboard.is-visible {
        display: grid;
      }

      .summary-bar {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }

      .summary-card {
        padding: 18px;
        border: 1px solid var(--line);
        border-radius: 18px;
        background: rgba(8, 15, 28, 0.76);
      }

      .summary-label {
        color: var(--muted);
        font-size: 12px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .summary-value {
        margin-top: 10px;
        font-size: 22px;
        font-weight: 700;
        word-break: break-word;
      }

      .tab-row {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .tab {
        padding: 12px 16px;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: rgba(10, 16, 29, 0.75);
        color: var(--muted);
      }

      .tab.is-active {
        background: var(--accent-soft);
        border-color: rgba(22, 163, 74, 0.4);
        color: white;
      }

      .controls {
        display: grid;
        gap: 14px;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        padding: 18px;
        border: 1px solid var(--line);
        border-radius: 20px;
        background: rgba(8, 15, 28, 0.72);
      }

      .control {
        min-width: 0;
      }

      .control.full {
        grid-column: 1 / -1;
      }

      .control.hidden {
        display: none;
      }

      .control-actions {
        display: flex;
        align-items: end;
      }

      .status {
        min-height: 24px;
        color: var(--muted);
      }

      .board {
        border: 1px solid var(--line);
        border-radius: 22px;
        overflow: hidden;
        background: rgba(8, 15, 28, 0.72);
      }

      .board-header {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        padding: 20px 22px;
        border-bottom: 1px solid var(--line);
      }

      .board-title {
        margin: 0;
        font-size: 26px;
      }

      .board-copy {
        margin: 6px 0 0;
        color: var(--muted);
      }

      .table-wrap {
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th, td {
        padding: 16px 18px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.10);
        text-align: left;
        white-space: nowrap;
      }

      th {
        color: var(--muted);
        font-size: 12px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      td {
        font-size: 15px;
      }

      tr:last-child td {
        border-bottom: 0;
      }

      .rank {
        font-weight: 800;
        color: var(--gold);
      }

      .wallet {
        max-width: 340px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .empty {
        padding: 22px;
        color: var(--muted);
      }

      @media (max-width: 920px) {
        .summary-bar,
        .controls {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 640px) {
        main {
          width: min(100vw - 18px, 100%);
          margin: 10px auto 28px;
        }

        .hero,
        .dashboard {
          padding: 20px;
        }

        .mint-gate-row,
        .tab-row {
          flex-direction: column;
        }

        .summary-bar,
        .controls {
          grid-template-columns: 1fr;
        }

        button {
          width: 100%;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="shell">
        <section class="hero">
          <p class="eyebrow">peak dashboard</p>
          <h1>Mint In. Leaderboard Up.</h1>
          <p class="hero-copy">
            Start with a mint address. peak pulls the holder board first, then lets you pivot into transfer views without leaving the same page.
          </p>

          <form id="mintGate" class="mint-gate">
            <div>
              <label for="entryMint">Mint Address Or Token URL</label>
              <input id="entryMint" name="entryMint" value="${DEFAULT_MINT}" placeholder="Paste a Solana mint or token link" />
            </div>
            <div class="mint-gate-row">
              <button id="mintSubmit" type="submit">Open Dashboard</button>
            </div>
          </form>
        </section>

        <section id="dashboard" class="dashboard">
          <div class="summary-bar">
            <article class="summary-card">
              <div class="summary-label">Mint</div>
              <div id="summaryMint" class="summary-value">-</div>
            </article>
            <article class="summary-card">
              <div class="summary-label">Active View</div>
              <div id="summaryMode" class="summary-value">Top Holders</div>
            </article>
            <article class="summary-card">
              <div class="summary-label">Resolved Dev Wallet</div>
              <div id="summaryWallet" class="summary-value">Auto detect</div>
            </article>
          </div>

          <div id="tabs" class="tab-row"></div>

          <form id="controls" class="controls">
            <div class="control full">
              <label for="mintControl">Mint Address Or Token URL</label>
              <input id="mintControl" name="mintControl" value="${DEFAULT_MINT}" />
            </div>

            <div id="walletModeControl" class="control hidden">
              <label for="walletMode">Dev Wallet Address</label>
              <select id="walletMode" name="walletMode">
                <option value="auto">Auto Detect</option>
                <option value="manual">Enter Manually</option>
              </select>
            </div>

            <div id="walletControl" class="control hidden">
              <label for="wallet">Dev Wallet Address</label>
              <input id="wallet" name="wallet" value="" />
            </div>

            <div class="control">
              <label for="limit">Rows / Transactions To Search</label>
              <input id="limit" name="limit" type="number" min="1" max="100" value="${DEFAULT_LIMIT}" />
            </div>

            <div id="uniqueRecipientsControl" class="control hidden">
              <label for="uniqueRecipients">Unique Recipients</label>
              <select id="uniqueRecipients" name="uniqueRecipients">
                <option value="false">All Transfers</option>
                <option value="true">Consolidated</option>
              </select>
            </div>

            <div id="minimumAmountControl" class="control hidden">
              <label for="minimumAmount">Minimum Amount</label>
              <input id="minimumAmount" name="minimumAmount" type="number" min="0" step="0.000001" value="0" />
            </div>

            <div class="control control-actions">
              <button id="querySubmit" type="submit">Run View</button>
            </div>
          </form>

          <div id="status" class="status"></div>

          <section class="board">
            <header class="board-header">
              <div>
                <h2 id="boardTitle" class="board-title">Top Holders</h2>
                <p id="boardCopy" class="board-copy">Largest non-program wallets by amount held.</p>
              </div>
            </header>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr id="tableHead"></tr>
                </thead>
                <tbody id="tableBody"></tbody>
              </table>
            </div>
          </section>
        </section>
      </section>
    </main>

    <script>
      const MODES = ${MODES_JSON};
      const DEFAULT_MODE = "${DEFAULT_MODE}";

      const modeMeta = {
        "top-holders": {
          title: "Top Holders",
          copy: "Largest non-program wallets by amount held.",
          empty: "No holder data was returned for this mint.",
          columns: ["Rank", "Holder", "Amount Held"],
        },
        "airdrop-filter": {
          title: "Transfers",
          copy: "Outgoing token transfers from the detected or supplied dev wallet.",
          empty: "No outgoing transfers were found for this mint and wallet.",
          columns: ["Rank", "Recipient", "Amount", "From"],
        },
      };

      const state = {
        mode: DEFAULT_MODE,
        mint: "${DEFAULT_MINT}",
        wallet: "",
        resolvedWallet: "",
        resolvedMint: "",
      };

      const dashboard = document.getElementById("dashboard");
      const mintGate = document.getElementById("mintGate");
      const entryMint = document.getElementById("entryMint");
      const mintControl = document.getElementById("mintControl");
      const walletMode = document.getElementById("walletMode");
      const walletInput = document.getElementById("wallet");
      const limitInput = document.getElementById("limit");
      const minimumAmountInput = document.getElementById("minimumAmount");
      const querySubmit = document.getElementById("querySubmit");
      const mintSubmit = document.getElementById("mintSubmit");
      const status = document.getElementById("status");
      const summaryMint = document.getElementById("summaryMint");
      const summaryMode = document.getElementById("summaryMode");
      const summaryWallet = document.getElementById("summaryWallet");
      const boardTitle = document.getElementById("boardTitle");
      const boardCopy = document.getElementById("boardCopy");
      const tableHead = document.getElementById("tableHead");
      const tableBody = document.getElementById("tableBody");
      const tabs = document.getElementById("tabs");
      const walletModeControl = document.getElementById("walletModeControl");
      const walletControl = document.getElementById("walletControl");
      const uniqueRecipientsControl = document.getElementById("uniqueRecipientsControl");
      const uniqueRecipientsSelect = document.getElementById("uniqueRecipients");
      const minimumAmountControl = document.getElementById("minimumAmountControl");

      const numberFormat = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 6,
      });

      function getBoardMeta() {
        if (state.mode === "airdrop-filter" && uniqueRecipientsSelect.value === "true") {
          return {
            title: "Transfers",
            copy: "Outgoing token transfers grouped by recipient.",
            empty: "No matching consolidated recipients were found for this mint and wallet.",
            columns: ["Rank", "Recipient", "Total Received", "Transfers", "Latest Payout"],
          };
        }

        return modeMeta[state.mode];
      }

      function shortWallet(value) {
        if (!value) {
          return "-";
        }

        if (value.length <= 14) {
          return value;
        }

        return value.slice(0, 6) + "..." + value.slice(-6);
      }

      function syncControls() {
        const isTransfers = state.mode === "airdrop-filter";
        const isUniqueRecipients = isTransfers && uniqueRecipientsSelect.value === "true";

        walletModeControl.classList.toggle("hidden", !isTransfers);
        uniqueRecipientsControl.classList.toggle("hidden", !isTransfers);
        minimumAmountControl.classList.toggle("hidden", !isUniqueRecipients);
        walletControl.classList.toggle(
          "hidden",
          !(isTransfers && walletMode.value === "manual"),
        );

        if (isTransfers && walletMode.value === "manual") {
          walletInput.placeholder = "Enter a known dev wallet";
        } else {
          walletInput.placeholder = "Auto-detect from mint";
        }
      }

      function renderTabs() {
        tabs.innerHTML = "";

        for (const mode of MODES) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "tab" + (mode.id === state.mode ? " is-active" : "");
          button.textContent = mode.label;
          button.addEventListener("click", () => {
            state.mode = mode.id;
            syncControls();
            renderTabs();
            runCurrentMode();
          });
          tabs.appendChild(button);
        }
      }

      function renderTable(rows) {
        const meta = getBoardMeta();
        tableHead.innerHTML = meta.columns.map((column) => "<th>" + column + "</th>").join("");
        tableBody.innerHTML = "";

        if (!rows.length) {
          const tr = document.createElement("tr");
          tr.innerHTML = '<td colspan="' + meta.columns.length + '" class="empty">' + meta.empty + "</td>";
          tableBody.appendChild(tr);
          return;
        }

        rows.forEach((row, index) => {
          const tr = document.createElement("tr");
          const rank = '<td class="rank">#' + (row.rank ?? index + 1) + "</td>";

          if (state.mode === "top-holders") {
            tr.innerHTML =
              rank +
              '<td class="wallet" title="' + row.holder + '">' + row.holder + "</td>" +
              "<td>" + numberFormat.format(row.amountHeld) + "</td>";
          } else if (uniqueRecipientsSelect.value === "true") {
            tr.innerHTML =
              rank +
              '<td class="wallet" title="' + row.recipient + '">' + row.recipient + "</td>" +
              "<td>" + numberFormat.format(row.totalReceived) + "</td>" +
              "<td>" + row.transferCount + "</td>" +
              "<td>" + numberFormat.format(row.latestAmount) + "</td>";
          } else {
            tr.innerHTML =
              rank +
              '<td class="wallet" title="' + row.recipient + '">' + row.recipient + "</td>" +
              "<td>" + numberFormat.format(row.amount) + "</td>" +
              "<td>dev wallet</td>";
          }

          tableBody.appendChild(tr);
        });
      }

      function syncSummary(payload, rowCount) {
        const meta = getBoardMeta();
        summaryMint.textContent = shortWallet(payload.resolvedMint || state.mint);
        summaryMode.textContent = meta.title;
        summaryWallet.textContent =
          payload.resolvedWallet ? shortWallet(payload.resolvedWallet) : "Auto detect";
        boardTitle.textContent = meta.title;
        boardCopy.textContent = meta.copy;
        const sourceLabel = payload.source === "cache" ? "cache" : "live query";
        const generated = payload.generatedAt
          ? " Updated " + new Date(payload.generatedAt).toLocaleString() + "."
          : "";
        status.textContent = "Loaded " + rowCount + " row(s) from " + sourceLabel + "." + generated;
      }

      async function runCurrentMode() {
        const mintValue = mintControl.value.trim();
        if (!mintValue) {
          status.textContent = "Mint address or token URL is required.";
          return;
        }

        state.mint = mintValue;
        state.wallet = walletInput.value.trim();

        querySubmit.disabled = true;
        mintSubmit.disabled = true;
        status.textContent = "Loading leaderboard...";

        const shouldUseManualWallet =
          state.mode === "airdrop-filter" && walletMode.value === "manual";

        if (!shouldUseManualWallet) {
          walletInput.value = "";
        }

        const params = new URLSearchParams({
          mode: state.mode,
          mintOrToken: mintValue,
          limit: limitInput.value.trim() || "${DEFAULT_LIMIT}",
          minimumAmount: minimumAmountInput.value.trim() || "0",
          uniqueRecipients: uniqueRecipientsSelect.value,
          wallet: shouldUseManualWallet ? walletInput.value.trim() : "",
        });

        try {
          const response = await fetch("/api/query?" + params.toString());
          const payload = await response.json();

          if (!response.ok) {
            throw new Error(payload.error || "Request failed.");
          }

          state.resolvedWallet = payload.resolvedWallet || "";
          state.resolvedMint = payload.resolvedMint || mintValue;

          if (payload.resolvedMint) {
            mintControl.value = payload.resolvedMint;
            entryMint.value = payload.resolvedMint;
          }

          if (payload.resolvedWallet && (!shouldUseManualWallet || !walletInput.value.trim())) {
            walletInput.value = payload.resolvedWallet;
          }

          dashboard.classList.add("is-visible");
          renderTabs();
          renderTable(payload.results);
          syncSummary(payload, payload.results.length);
        } catch (error) {
          status.textContent = error instanceof Error ? error.message : "Unknown error.";
          tableHead.innerHTML = "";
          tableBody.innerHTML = "";
        } finally {
          querySubmit.disabled = false;
          mintSubmit.disabled = false;
        }
      }

      mintGate.addEventListener("submit", async (event) => {
        event.preventDefault();
        mintControl.value = entryMint.value.trim();
        state.mode = DEFAULT_MODE;
        syncControls();
        renderTabs();
        await runCurrentMode();
      });

      document.getElementById("controls").addEventListener("submit", async (event) => {
        event.preventDefault();
        await runCurrentMode();
      });

      walletMode.addEventListener("change", syncControls);
      uniqueRecipientsSelect.addEventListener("change", async () => {
        syncControls();
        if (dashboard.classList.contains("is-visible") && state.mode === "airdrop-filter") {
          await runCurrentMode();
        }
      });
      syncControls();
      renderTabs();
    </script>
  </body>
</html>`;

function sendJson(
  response: import("node:http").ServerResponse,
  status: number,
  payload: unknown,
): void {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? `${HOST}:${PORT}`}`);

  if (request.method === "GET" && url.pathname === "/") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(html);
    return;
  }

  if (
    request.method === "GET" &&
    (url.pathname === "/api/query" || url.pathname === "/api/airdrops")
  ) {
    const mode = (url.searchParams.get("mode")?.trim() ?? DEFAULT_MODE) as QueryModeId;
    const wallet = url.searchParams.get("wallet")?.trim();
    const mintOrToken = url.searchParams.get("mintOrToken")?.trim();
    const limitRaw = url.searchParams.get("limit")?.trim();
    const minimumAmountRaw = url.searchParams.get("minimumAmount")?.trim();
    const uniqueRecipientsRaw = url.searchParams.get("uniqueRecipients")?.trim();
    const limit = Math.min(100, Math.max(1, Number(limitRaw ?? `${DEFAULT_LIMIT}`) || DEFAULT_LIMIT));
    const minimumAmount = Math.max(0, Number(minimumAmountRaw ?? "0") || 0);
    const uniqueRecipients = uniqueRecipientsRaw === "true";

    if (!mintOrToken) {
      sendJson(response, 400, { error: "token URL or mint is required." });
      return;
    }

    try {
      const payload = await runQueryMode(mode, {
        wallet,
        mintOrToken,
        limit,
        rpcUrl: process.env.SOLANA_RPC_URL,
        minimumAmount,
        uniqueRecipients,
      });

      sendJson(response, 200, payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown server error.";
      sendJson(response, 500, { error: message });
    }

    return;
  }

  response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  response.end("Not found");
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.log(`Port ${PORT} is already in use.`);
    console.log(`If the app is already running, open http://${HOST}:${PORT}`);
    console.log(`Or start a new instance with: $env:PORT=4174; npm.cmd run app`);
    process.exit(0);
  }

  throw error;
});

server.listen(PORT, HOST, () => {
  const address = server.address() as AddressInfo | null;
  const activePort = address?.port ?? PORT;
  console.log(`Peak dashboard running at http://${HOST}:${activePort}`);
});
