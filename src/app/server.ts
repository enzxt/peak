import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { loadLocalEnv } from "../config/load-env.js";
import { QUERY_MODES, runQueryMode } from "./query-modes.js";

loadLocalEnv();

const PORT = Number(process.env.PORT ?? "4173");
const HOST = "127.0.0.1";
const DEFAULT_WALLET = "AgyEoDHFxZvkYFaHgUZ5TcFk6VRB3idzD4NaPmRjDsZ8";
const DEFAULT_MINT = "71utbKBwCwL22NsJZzeuR23K3BTZaTmzj3X7kzTzpump";
const DEFAULT_MODE = "airdrop-filter";
const queryModeOptions = QUERY_MODES.map((mode) => {
  const selected = mode.id === DEFAULT_MODE ? " selected" : "";
  const disabled = mode.id === "coming-soon" ? " disabled" : "";
  return `<option value="${mode.id}"${selected}${disabled}>${mode.label}</option>`;
}).join("");

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Peak Airdrop Tester</title>
    <style>
      :root {
        --bg: #f4f1e8;
        --panel: #fffdf8;
        --line: #d9d0be;
        --text: #16130f;
        --muted: #6e665a;
        --accent: #0c8f61;
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Georgia, "Times New Roman", serif;
        background: linear-gradient(180deg, #f7f3eb 0%, #efe7d8 100%);
        color: var(--text);
      }

      main {
        max-width: 920px;
        margin: 48px auto;
        padding: 0 20px 48px;
      }

      .card {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 24px;
        box-shadow: 0 14px 40px rgba(29, 23, 15, 0.06);
      }

      h1 {
        margin: 0 0 10px;
        font-size: 42px;
        line-height: 1;
      }

      p {
        margin: 0 0 20px;
        color: var(--muted);
      }

      .grid {
        display: grid;
        gap: 14px;
      }

      label {
        font-size: 13px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
        display: block;
        margin-bottom: 8px;
      }

      input {
        width: 100%;
        padding: 14px 16px;
        border-radius: 12px;
        border: 1px solid var(--line);
        font: inherit;
        color: var(--text);
        background: #fff;
      }

      select {
        width: 100%;
        padding: 14px 16px;
        border-radius: 12px;
        border: 1px solid var(--line);
        font: inherit;
        color: var(--text);
        background: #fff;
      }

      button {
        margin-top: 14px;
        border: 0;
        border-radius: 999px;
        padding: 14px 20px;
        font: inherit;
        font-weight: 700;
        background: var(--accent);
        color: white;
        cursor: pointer;
      }

      button:disabled {
        opacity: 0.6;
        cursor: wait;
      }

      .status {
        min-height: 24px;
        margin-top: 14px;
        color: var(--muted);
      }

      .results {
        margin-top: 22px;
        display: grid;
        gap: 12px;
      }

      .row {
        border: 1px solid var(--line);
        border-radius: 14px;
        background: #fff;
        padding: 14px 16px;
        display: grid;
        gap: 6px;
      }

      .recipient {
        font-weight: 700;
        word-break: break-all;
      }

      .meta {
        color: var(--muted);
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="card">
        <h1>Peak Airdrop Tester</h1>
        <p>Save and reuse small onchain queries from one place. The current working tool is the airdrop filter.</p>

        <form id="form" class="grid">
          <div>
            <label for="mode">Query Mode</label>
            <select id="mode" name="mode">${queryModeOptions}</select>
          </div>

          <div>
            <label for="wallet">Dev Wallet</label>
            <input id="wallet" name="wallet" value="${DEFAULT_WALLET}" />
          </div>

          <div>
            <label for="mint">Mint</label>
            <input id="mint" name="mint" value="${DEFAULT_MINT}" />
          </div>

          <div>
            <label for="limit">Transactions To Search</label>
            <input id="limit" name="limit" type="number" min="1" max="100" value="5" />
          </div>

          <button id="submit" type="submit">Check Transfers</button>
        </form>

        <div id="status" class="status"></div>
        <div id="results" class="results"></div>
      </section>
    </main>

    <script>
      const form = document.getElementById("form");
      const submit = document.getElementById("submit");
      const status = document.getElementById("status");
      const results = document.getElementById("results");

      function renderRows(rows) {
        results.innerHTML = "";

        if (!rows.length) {
          results.innerHTML = '<div class="row"><div class="recipient">No matching outgoing transfers found.</div></div>';
          return;
        }

        for (const row of rows) {
          const item = document.createElement("article");
          item.className = "row";
          item.innerHTML = \`
            <div class="recipient">\${row.recipient}</div>
            <div>\${row.amount.toLocaleString()} received</div>
            <div class="meta">from: dev wallet</div>
          \`;
          results.appendChild(item);
        }
      }

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        submit.disabled = true;
        status.textContent = "Checking chain data...";
        results.innerHTML = "";

        const params = new URLSearchParams({
          mode: document.getElementById("mode").value.trim(),
          wallet: document.getElementById("wallet").value.trim(),
          mint: document.getElementById("mint").value.trim(),
          limit: document.getElementById("limit").value.trim(),
        });

        try {
          const response = await fetch("/api/airdrops?" + params.toString());
          const payload = await response.json();

          if (!response.ok) {
            throw new Error(payload.error || "Request failed.");
          }

          status.textContent = \`Found \${payload.results.length} outgoing transfer(s).\`;
          renderRows(payload.results);
        } catch (error) {
          status.textContent = error.message;
        } finally {
          submit.disabled = false;
        }
      });
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

  if (request.method === "GET" && url.pathname === "/api/airdrops") {
    const mode = (url.searchParams.get("mode")?.trim() ?? DEFAULT_MODE);
    const wallet = url.searchParams.get("wallet")?.trim();
    const mint = url.searchParams.get("mint")?.trim();
    const limitRaw = url.searchParams.get("limit")?.trim();
    const limit = Math.min(
      100,
      Math.max(1, Number(limitRaw ?? "5") || 5),
    );

    if (!wallet || !mint) {
      sendJson(response, 400, { error: "wallet and mint are required." });
      return;
    }

    try {
      const results = await runQueryMode(mode as "airdrop-filter" | "coming-soon", {
        wallet,
        mint,
        limit,
        rpcUrl: process.env.SOLANA_RPC_URL,
      });

      sendJson(response, 200, { results });
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
  console.log(`Peak airdrop tester running at http://${HOST}:${activePort}`);
});
