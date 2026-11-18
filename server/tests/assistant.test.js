// Offline unit tests for the assistant's safety-critical pure functions.
//
// No database, no network — these run anywhere:
//   cd server && npm test
//
// (The DB-backed probes live in the phase notes; the conversation test set,
// which needs a model, is scripts/testConversations.js.)
const test = require("node:test");
const assert = require("node:assert");

process.env.ASSISTANT_ORDER_SECRET ||= "test-secret-for-unit-tests-only";

const { escapeRegex, buildFilter, PAGE_SIZE } = require("../services/assistant/tools");
const { sign, verify, cartFingerprint } = require("../services/assistant/orderToken");
const { normalisePhone } = require("../services/assistant/checkoutTools");
const { deliveryFee, cartTotals } = require("../services/pricing");

// ── regex escaping: a shopper's input must never become query syntax ───────

test("escapeRegex neutralises regex operators", () => {
  assert.strictEqual(escapeRegex("shirt.*"), "shirt\\.\\*");
  assert.strictEqual(escapeRegex("a|b(c)$"), "a\\|b\\(c\\)\\$");
  assert.strictEqual(escapeRegex("^.*$"), "\\^\\.\\*\\$");
  assert.strictEqual(escapeRegex("{2,}"), "\\{2,\\}");
});

test("buildFilter puts hostile text in as a literal", () => {
  const filter = buildFilter({ terms: ["shirt.*|("] });
  const clause = filter.$and.find((c) => c.$or);
  // JSON.stringify renders RegExp as {}, so inspect .source directly.
  const source = clause.$or[0].name.source;
  assert.strictEqual(source, "shirt\\.\\*\\|\\(", "operators must be escaped");

  // The compiled pattern must not throw, and must not match ordinary text
  // meant to be searched (i.e. it behaves as a literal, not as syntax).
  assert.doesNotThrow(() => new RegExp(source, "i"));
  assert.ok(!new RegExp(source, "i").test("shirt white"));
});

test("buildFilter composes every filter family", () => {
  const filter = buildFilter({
    terms: ["white", "shirt"],
    genre: "men",
    color: "white",
    size: "m",
    minPrice: 500,
    maxPrice: 3000,
    inStockOnly: true,
  });
  const serialized = JSON.stringify(filter);
  for (const needle of ['"genre"', '"$elemMatch"', '"$gte"', '"$lte"', '"$gt"']) {
    assert.ok(serialized.includes(needle), `expected ${needle} in ${serialized}`);
  }
});

test("buildFilter with nothing set still hides inactive products", () => {
  const filter = buildFilter({});
  const serialized = JSON.stringify(filter);
  assert.ok(serialized.includes("\"status\":\"active\""), serialized);
});

test("PAGE_SIZE stays at the documented cap of 6", () => {
  assert.strictEqual(PAGE_SIZE, 6);
});

// ── the order token: what makes Confirm order meaningful ───────────────────

const draftArgs = {
  userId: "u123",
  cartHash: "abc",
  total: 3490,
  shippingAddress: "Test house, Lahore",
  phoneNumber: "03001234567",
  paymentMethod: "Cash on Delivery",
};

test("a signed token verifies and round-trips its payload", () => {
  const { token, payload } = sign(draftArgs);
  const checked = verify(token);
  assert.ok(checked.ok);
  assert.strictEqual(checked.payload.userId, payload.userId);
  assert.strictEqual(checked.payload.total, 3490);
  assert.strictEqual(checked.payload.phoneNumber, "03001234567");
});

test("a tampered payload fails the signature check", () => {
  const { token } = sign(draftArgs);
  const [body] = token.split(".");
  const forged = `${body}${body.slice(-1)}.${"A".repeat(43)}`;
  assert.strictEqual(verify(forged).ok, false);
  assert.strictEqual(verify(`${token}x`).ok, false);
});

test("an expired token is refused as expired, not rejected as garbage", () => {
  const crypto = require("crypto");
  const { sign: _ } = { };
  const payload = { ...draftArgs, jti: crypto.randomUUID(), iat: 0, exp: 1 };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", process.env.ASSISTANT_ORDER_SECRET).update(body).digest("base64url");
  const checked = verify(`${body}.${sig}`);
  assert.strictEqual(checked.ok, false);
  assert.strictEqual(checked.reason, "expired");
});

test("garbage and empty strings are refused without throwing", () => {
  assert.strictEqual(verify("").ok, false);
  assert.strictEqual(verify("not-a-token").ok, false);
  assert.strictEqual(verify(null).ok, false);
  assert.strictEqual(verify("x".repeat(5000)).ok, false);
});

test("cartFingerprint changes when anything buyable changes", () => {
  const line = { productId: "p1", size: "m", color: "white", quantity: 2, price: 1000 };
  const base = cartFingerprint([line]);
  assert.strictEqual(base, cartFingerprint([{ ...line }]), "same items, same hash");
  assert.strictEqual(base, cartFingerprint([{ ...line, name: "different name" }]), "naming doesn't matter");
  assert.notStrictEqual(base, cartFingerprint([{ ...line, quantity: 3 }]), "quantity matters");
  assert.notStrictEqual(base, cartFingerprint([{ ...line, price: 999 }]), "price matters");
  assert.notStrictEqual(base, cartFingerprint([{ ...line, size: "l" }]), "size matters");
  // Order of lines doesn't change what's being bought.
  assert.strictEqual(
    cartFingerprint([line, { productId: "p2", size: "s", color: "black", quantity: 1, price: 500 }]),
    cartFingerprint([{ productId: "p2", size: "s", color: "black", quantity: 1, price: 500 }, line])
  );
});

// ── phone normalisation: the number the courier dials ──────────────────────

test("international numbers are accepted and compacted", () => {
  assert.strictEqual(normalisePhone("+44 20 7946 0958"), "+442079460958");
  assert.strictEqual(normalisePhone("+1 (212) 555-0100"), "+12125550100");
  assert.strictEqual(normalisePhone("+92 300 1234567"), "+923001234567");
  assert.strictEqual(normalisePhone("030 1234 5678"), "03012345678");
  assert.strictEqual(normalisePhone("+971.50.123.4567"), "+971501234567");
});

test("non-numbers are refused, not mangled", () => {
  assert.strictEqual(normalisePhone("12345"), "");          // too short
  assert.strictEqual(normalisePhone("+1234567890123456"), ""); // longer than E.164 allows
  assert.strictEqual(normalisePhone("12-ab-34"), "");
  assert.strictEqual(normalisePhone("hello"), "");
  assert.strictEqual(normalisePhone(""), "");
  assert.strictEqual(normalisePhone(undefined), "");
});

// ── pricing: one rule for checkout, the assistant and the client ───────────

test("delivery is free from $50, otherwise $5", () => {
  assert.strictEqual(deliveryFee(49.99), 5);
  assert.strictEqual(deliveryFee(50), 0);
  assert.strictEqual(deliveryFee(180), 0);
});

test("cart totals add up and the shortfall points at free delivery", () => {
  const items = [
    { price: 30, quantity: 1 },
    { price: 10, quantity: 2 },
  ];
  const totals = cartTotals(items);
  assert.strictEqual(totals.units, 3);
  assert.strictEqual(totals.subtotal, 50);
  assert.strictEqual(totals.delivery, 0);
  assert.strictEqual(totals.total, 50);
  assert.strictEqual(totals.freeDeliveryShortfall, 0);

  const small = cartTotals([{ price: 20, quantity: 1 }]);
  assert.strictEqual(small.total, 25);
  assert.strictEqual(small.freeDeliveryShortfall, 30);
});

test("an empty cart costs nothing", () => {
  const totals = cartTotals([]);
  assert.strictEqual(totals.units, 0);
  assert.strictEqual(totals.subtotal, 0);
  assert.strictEqual(totals.delivery, 0);
  assert.strictEqual(totals.total, 0);
});

// ── history sent to the model: never starts on an orphaned tool result ─────

const { modelHistory } = require("../services/assistant/agent");

test("modelHistory starts at a shopper message and strips stored-only fields", () => {
  const at = new Date();
  const turn = (n) => [
    { role: "user", content: `q${n}`, at },
    { role: "assistant", content: "", tool_calls: [{ id: `c${n}`, type: "function", function: { name: "search_products", arguments: "{}" } }], at },
    { role: "tool", tool_call_id: `c${n}`, name: "search_products", content: "TOOL RESULT", at },
    { role: "assistant", content: `a${n}`, blocks: [{ type: "products", items: [1, 2, 3] }], at },
  ];
  const history = [...turn(1), ...turn(2), ...turn(3)];

  // A window of 6 would begin on turn 2's tool result; it must move to turn 3's question.
  const window = modelHistory(history, 6);
  assert.strictEqual(window[0].role, "user");
  assert.strictEqual(window[0].content, "q3");
  for (const m of window) {
    assert.ok(!("at" in m) && !("blocks" in m), "stored-only fields must not reach the model");
  }
  // Every tool result still follows the assistant turn that asked for it.
  const asked = new Set(window.flatMap((m) => (m.tool_calls || []).map((c) => c.id)));
  for (const m of window.filter((x) => x.role === "tool")) assert.ok(asked.has(m.tool_call_id));
});

test("modelHistory of a window with no shopper message is empty", () => {
  assert.deepStrictEqual(modelHistory([{ role: "assistant", content: "Welcome back" }]), []);
});

// ── catalogue vocabulary and variants ───────────────────────────────────────

const taxonomy = require("../services/catalog/taxonomy");
const { buildVariants, deriveFromVariants } = require("../models/store");
const { occasionFrom, colorFamilyFrom } = require("../services/assistant/tools");

test("shopper words land on the controlled vocabulary", () => {
  assert.strictEqual(taxonomy.categoryForWord("pants"), "trousers");
  assert.strictEqual(taxonomy.categoryForWord("Frock"), "dresses");
  assert.strictEqual(taxonomy.categoryForWord("shalwar kameez"), "kurta");
  assert.strictEqual(taxonomy.categoryForWord("spaceship"), "");
  assert.strictEqual(occasionFrom("wedding"), "wedding-guest");
  assert.strictEqual(occasionFrom("work"), "office");
  assert.strictEqual(colorFamilyFrom("navy"), "blue");
  assert.strictEqual(colorFamilyFrom("Dove Grey"), "grey");
  assert.strictEqual(taxonomy.normaliseSize("xl"), "XL");
  assert.strictEqual(taxonomy.normaliseSize("one size"), "One size");
});

test("variants share the stock and the flat fields follow them", () => {
  const variants = buildVariants({ sizes: ["s", "m"], colors: ["Navy", "white"], stock: 9, skuPrefix: "T" });
  assert.strictEqual(variants.length, 4);
  assert.strictEqual(variants.reduce((n, v) => n + v.stock, 0), 9, "no unit lost or invented");
  assert.ok(variants.every((v) => v.sku && v.size === v.size.toUpperCase()));
  assert.strictEqual(new Set(variants.map((v) => v.sku)).size, 4, "every sku unique");

  variants[0].stock = 0;
  const derived = deriveFromVariants(variants);
  assert.deepStrictEqual(derived.colorFamilies.sort(), ["blue", "white"]);
  assert.strictEqual(derived.stock, variants.reduce((n, v) => n + v.stock, 0));
  assert.ok(derived.sizesInStock.includes("M"));
});

test("a size-and-colour search checks both on the same variant", () => {
  const filter = buildFilter({ size: "m", colorFamily: "blue", inStockOnly: true });
  const elem = filter.$and.find((c) => c.variants)?.variants.$elemMatch;
  assert.ok(elem, JSON.stringify(filter));
  assert.strictEqual(elem.colorFamily, "blue");
  assert.deepStrictEqual(elem.stock, { $gt: 0 });
  assert.ok(elem.size.test("M") && !elem.size.test("XM"));
});
