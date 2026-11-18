#!/usr/bin/env node
/**
 * Model probe — Phase 1, task 1.
 *
 * Sends the same tool-calling conversation to each candidate model and checks
 * that it (a) answers, (b) asks for the search_products tool, and (c) passes
 * arguments that parse and make sense. The main and fallback models are chosen
 * from this output, not from the price table.
 *
 *   cd server
 *   node scripts/testModels.js
 *   node scripts/testModels.js openai/gpt-6-luna deepseek/deepseek-v4.1-flash
 *
 * Needs ASSISTANT_API_KEY in server/.env. Costs a fraction of a cent per model.
 */
require("dotenv").config();

const { definitions } = require("../services/assistant/tools");
const { SYSTEM_PROMPT } = require("../services/assistant/prompt");

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const TIMEOUT_MS = 40000;

const CANDIDATES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      process.env.ASSISTANT_MODEL,
      process.env.ASSISTANT_FALLBACK_MODEL,
    ].filter(Boolean);

// One turn that MUST produce a search_products call with a price ceiling.
const PROBE = [
  { role: "system", content: SYSTEM_PROMPT },
  { role: "user", content: "I need a white formal shirt for men under 3000" },
];

const ok = (s) => `\u001b[32m${s}\u001b[0m`;
const bad = (s) => `\u001b[31m${s}\u001b[0m`;
const dim = (s) => `\u001b[2m${s}\u001b[0m`;

async function probe(model) {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ASSISTANT_API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "Daily Deals Assistant model probe",
      },
      body: JSON.stringify({
        model,
        messages: PROBE,
        tools: definitions,
        tool_choice: "auto",
        provider: { require_parameters: true },
        temperature: 0.3,
        max_tokens: 400,
      }),
      signal: controller.signal,
    });

    const ms = Date.now() - started;
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return { model, pass: false, ms, note: `HTTP ${response.status} ${text.slice(0, 120)}` };
    }

    const data = await response.json();
    if (data.error) return { model, pass: false, ms, note: `provider error: ${data.error.message}` };

    const message = data.choices?.[0]?.message;
    const call = message?.tool_calls?.[0];
    if (!call) {
      return { model, pass: false, ms, note: `no tool call (said: "${String(message?.content || "").slice(0, 70)}…")` };
    }
    if (call.function?.name !== "search_products") {
      return { model, pass: false, ms, note: `called ${call.function?.name} instead of search_products` };
    }

    let args;
    try {
      args = JSON.parse(call.function.arguments || "{}");
    } catch {
      return { model, pass: false, ms, note: `arguments are not valid JSON: ${String(call.function.arguments).slice(0, 80)}` };
    }

    // Soft quality checks: the budget and the gender are the two facts the
    // shopper actually stated, so a good model passes both through.
    const caughtBudget = Number(args.max_price) === 3000;
    const caughtGenre = /men/i.test(String(args.genre || args.query || ""));
    const usage = data.usage || {};

    return {
      model,
      pass: true,
      ms,
      note: `args ${JSON.stringify(args)}`,
      quality: `${caughtBudget ? "budget ✓" : "budget ✗"} ${caughtGenre ? "gender ✓" : "gender ✗"}`,
      tokens: `${usage.prompt_tokens || "?"}/${usage.completion_tokens || "?"}`,
    };
  } catch (err) {
    const ms = Date.now() - started;
    return { model, pass: false, ms, note: err.name === "AbortError" ? `timeout after ${TIMEOUT_MS}ms` : err.message };
  } finally {
    clearTimeout(timer);
  }
}

(async () => {
  if (!process.env.ASSISTANT_API_KEY) {
    console.error(bad("ASSISTANT_API_KEY is not set in server/.env"));
    process.exit(1);
  }
  if (!CANDIDATES.length) {
    console.error(bad("No models to test: set ASSISTANT_MODEL or pass model ids as arguments."));
    process.exit(1);
  }

  console.log(`\nProbing ${CANDIDATES.length} model(s) with: "${PROBE[1].content}"\n`);

  const results = [];
  for (const model of CANDIDATES) {
    process.stdout.write(`  ${model} … `);
    const result = await probe(model);
    results.push(result);
    console.log(result.pass ? ok(`pass (${result.ms}ms)`) : bad(`fail (${result.ms}ms)`));
    if (result.quality) console.log(dim(`      ${result.quality}  tokens ${result.tokens}`));
    console.log(dim(`      ${result.note}`));
  }

  const passed = results.filter((r) => r.pass).sort((a, b) => a.ms - b.ms);
  console.log("\n" + "─".repeat(60));
  if (!passed.length) {
    console.log(bad("No candidate passed. Check the key, credit balance and privacy settings."));
    process.exit(1);
  }
  console.log(`Fastest passing model: ${ok(passed[0].model)} (${passed[0].ms}ms)`);
  if (passed[1]) console.log(`Suggested fallback:    ${ok(passed[1].model)} (${passed[1].ms}ms)`);
  console.log("\nSet ASSISTANT_MODEL and ASSISTANT_FALLBACK_MODEL in server/.env accordingly.\n");
})();
