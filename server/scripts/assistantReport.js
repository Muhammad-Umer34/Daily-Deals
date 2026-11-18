#!/usr/bin/env node
/**
 * Assistant visibility report — Phase 4.
 *
 * Reads the turn log (assistantturnlogs) and prints:
 *   - real token usage and a rough cost estimate, so the OpenRouter monthly
 *     credit limit can be set from measured numbers instead of guesses;
 *   - the searches that found nothing — what shoppers want but the shop
 *     doesn't stock.
 *
 *   cd server && npm run report:assistant
 */
require("dotenv").config();

const mongoose = require("mongoose");
const dns = require("dns");
if (dns.getServers().every((s) => s.startsWith("127.") || s === "::1")) {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const AssistantTurnLog = require("../models/assistantTurnLog");

// Rough $/1M tokens, only for models likely to appear in the log. Update when
// the model changes; the exact figure doesn't matter — the order of magnitude does.
const PRICES = {
  "openai/gpt-6-luna": { in: 0.1, out: 0.5 },
  "deepseek/deepseek-v4.1-flash": { in: 0.006, out: 0.5 },
};
const FALLBACK_PRICE = { in: 0.1, out: 0.5 };

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB_NAME || "dailydeals" });

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const turns = await AssistantTurnLog.find({ createdAt: { $gte: since } }).lean();

  if (!turns.length) {
    console.log("\nNo assistant turns logged in the last 7 days.\n");
    await mongoose.disconnect();
    return;
  }

  // ── cost ────────────────────────────────────────────────────────────────
  const byModel = {};
  for (const turn of turns) {
    const model = turn.model || "(none)";
    byModel[model] ||= { turns: 0, in: 0, out: 0, errors: 0, totalMs: 0 };
    byModel[model].turns += 1;
    byModel[model].in += turn.promptTokens || 0;
    byModel[model].out += turn.completionTokens || 0;
    byModel[model].totalMs += turn.durationMs || 0;
    if (turn.error) byModel[model].errors += 1;
  }

  let cents = 0;
  console.log(`\nAssistant turns, last 7 days: ${turns.length}\n`);
  console.log("model                          turns  tokens in/out        avg time   errors");
  for (const [model, s] of Object.entries(byModel)) {
    const price = PRICES[model] || FALLBACK_PRICE;
    cents += ((s.in / 1e6) * price.in + (s.out / 1e6) * price.out) * 100;
    console.log(
      `${model.padEnd(30)} ${String(s.turns).padStart(5)}  ${`${s.in}/${s.out}`.padStart(16)}   ${(s.totalMs / s.turns / 1000).toFixed(1).padStart(5)}s   ${String(s.errors).padStart(5)}`
    );
  }
  console.log(`\n≈ $${(cents / 100).toFixed(4)} spent in 7 days (rough, at list prices).`);
  console.log(`→ A monthly OpenRouter limit of $${Math.max(5, Math.ceil((cents / 7) * 31 * 2))} covers this with a 2× margin.\n`);

  // ── zero-result searches ────────────────────────────────────────────────
  const zero = turns.filter((t) => t.zeroResultQuery).map((t) => t.zeroResultQuery);
  console.log(`Searches that found nothing: ${zero.length}`);
  for (const [, query] of [...new Set(zero)].slice(0, 20).entries()) {
    console.log(`  · ${query}`);
  }
  if (zero.length) {
    console.log("\nThese are shoppers asking for things the shop doesn't (appear to) stock.");
    console.log("Worth a look before assuming the assistant is at fault.\n");
  }

  await mongoose.disconnect();
})();
