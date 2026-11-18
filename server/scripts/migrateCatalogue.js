// Moves the LOCAL catalogue onto the new schema (labels, controlled vocabulary,
// per-variant stock, occasions/seasons/fit/pattern/tags). Refuses to run against
// anything but a local database.
//
// Usage: node scripts/migrateCatalogue.js [--no-ai]
//   --no-ai  skip the AI attribute suggestions (taxonomy + variants only)
// Writes catalogue-review.md (git-ignored) listing every suggestion it applied.
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const taxonomy = require("../services/catalog/taxonomy");
const { buildVariants } = require("../models/store");
const Product = require("../models/store").default;
const Label = require("../models/label");
const User = require("../models/user");
const Cart = require("../models/cart").default;
const StoreOrder = require("../models/storeOrders").default;
const Order = require("../models/order");
const { findVariant } = require("../services/catalog/stock");
const { chat } = require("../services/assistant/openrouter");

const USE_AI = !process.argv.includes("--no-ai");

// Label copy for the seeded labels (sample text, to be confirmed by each seller).
const LABEL_COPY = {
  "noor atelier": { description: "Occasion wear and soft tailoring for women.", styles: ["traditional", "party", "formal"] },
  "ashcroft tailoring": { description: "Suits, coats and shirting for men.", styles: ["formal"] },
  "studio sabr": { description: "Leather goods, shoes, scarves and sunglasses.", styles: ["casual", "formal"] },
  "urban thread": { description: "Linen, denim and everyday wear.", styles: ["casual", "gym"] },
  "little lantern": { description: "Childrenswear for ages 2 to 9.", styles: ["casual", "party"] },
  "monofit basics": { description: "Wardrobe staples from the MonoFit house label.", styles: ["casual"] },
};
// A real brand name should not appear on the demo shop.
const RENAME_LABEL = { nike: "MonoFit Basics" };

const JUNK = new Set(["color", "colour", "x", ""]);

function normalise(p) {
  const genre = String(p.genre || "").split(",")[0].trim().toLowerCase();
  const subcategory = taxonomy.categoryForWord(p.subcategory) || String(p.subcategory || "").toLowerCase();
  const category = taxonomy.STYLES.includes(String(p.category).toLowerCase()) ? String(p.category).toLowerCase() : "casual";
  const sizes = (p.size || []).map(taxonomy.normaliseSize).filter((s) => s && !JUNK.has(s.toLowerCase()));
  const colors = (p.color || []).map((c) => String(c).trim().toLowerCase()).filter((c) => !JUNK.has(c));
  return { genre, subcategory, category, sizes: sizes.length ? sizes : ["One size"], colors: colors.length ? colors : ["black"] };
}

async function suggestAttributes(batch) {
  const vocab = {
    occasions: taxonomy.OCCASIONS, seasons: taxonomy.SEASONS, fit: taxonomy.FITS,
    pattern: taxonomy.PATTERNS, fabricWeight: taxonomy.FABRIC_WEIGHTS,
  };
  const items = batch.map((p, i) => ({ i, name: p.name, department: p.genre, category: p.subcategory, style: p.category, material: p.material, description: String(p.description).slice(0, 220) }));
  const prompt = `You tag fashion products for search. For each product choose ONLY from these allowed values:
${JSON.stringify(vocab)}
Rules: occasions 1-4 values; seasons 1-3 values (use "all-season" alone when it suits every season); fit, pattern and fabricWeight exactly one value each; tags 3-6 short lowercase phrases a shopper might search for (fabric, detail, feel), not repeating the category or colour.
Reply with JSON only: {"items":[{"i":0,"occasions":[],"seasons":[],"fit":"","pattern":"","fabricWeight":"","tags":[]}]}
Products: ${JSON.stringify(items)}`;
  const { message } = await chat({ messages: [{ role: "user", content: prompt }], maxTokens: 3000, temperature: 0.2 });
  const text = String(message.content || "").replace(/^```(?:json)?|```$/g, "").trim();
  const parsed = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  const ok = (list, allowed) => [...new Set([].concat(list || []).map((v) => String(v).toLowerCase()).filter((v) => allowed.includes(v)))];
  const one = (v, allowed) => (allowed.includes(String(v || "").toLowerCase()) ? String(v).toLowerCase() : "");
  return new Map(parsed.items.map((r) => [r.i, {
    occasions: ok(r.occasions, taxonomy.OCCASIONS).slice(0, 4),
    seasons: ok(r.seasons, taxonomy.SEASONS).slice(0, 3),
    fit: one(r.fit, taxonomy.FITS),
    pattern: one(r.pattern, taxonomy.PATTERNS),
    fabricWeight: one(r.fabricWeight, taxonomy.FABRIC_WEIGHTS),
    tags: [...new Set([].concat(r.tags || []).map((t) => String(t).toLowerCase().trim().slice(0, 40)).filter(Boolean))].slice(0, 6),
  }]));
}

(async () => {
  const uri = process.env.MONGO_URI || "";
  if (!/127\.0\.0\.1|localhost/.test(uri)) throw new Error("Refusing to run: MONGO_URI is not a local database.");
  await mongoose.connect(uri, { dbName: process.env.MONGO_DB_NAME || "monofit_local" });
  const db = mongoose.connection.db;
  const report = [`# Catalogue migration review\n\nDatabase: ${process.env.MONGO_DB_NAME} (local). AI suggestions: ${USE_AI ? "on" : "off"}.\n`];

  // 1. Labels, one per seller.
  const sellers = await User.find({ userType: "storeOwner" }).lean();
  const labelBySeller = new Map();
  for (const seller of sellers) {
    const original = String(seller.brand_name || seller.name || "Label").trim();
    const name = RENAME_LABEL[original.toLowerCase()] || original;
    const copy = LABEL_COPY[name.toLowerCase()] || {};
    const label = await Label.findOneAndUpdate(
      { sellerId: seller._id },
      { $set: { name, slug: taxonomy.slugify(name), logo: seller.brand_logo || "", description: copy.description || "", styles: copy.styles || [], active: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    if (name !== original) await db.collection("users").updateOne({ _id: seller._id }, { $set: { brand_name: name } });
    labelBySeller.set(String(seller._id), label);
  }
  report.push(`## Labels\n${[...labelBySeller.values()].map((l) => `- **${l.name}** (${l.slug})`).join("\n")}\n`);

  // 2–4. Products: taxonomy, variants, attributes.
  const raw = await db.collection("products").find({}).toArray();
  const normalised = raw.map((p) => ({ raw: p, n: normalise(p) }));
  const attrs = new Map();
  if (USE_AI) {
    for (let start = 0; start < normalised.length; start += 10) {
      const batch = normalised.slice(start, start + 10);
      try {
        const res = await suggestAttributes(batch.map(({ raw: p, n }) => ({ ...p, ...n })));
        batch.forEach((b, i) => res.has(i) && attrs.set(String(b.raw._id), res.get(i)));
        process.stdout.write(`tagged ${Math.min(start + 10, normalised.length)}/${normalised.length}\r`);
      } catch (err) {
        console.warn(`\nbatch ${start / 10 + 1}: AI tagging failed (${err.message}); those products keep empty attributes`);
      }
    }
    console.log();
  }

  report.push("## Products\n| Product | Department / category / style | Variants | Occasions | Seasons | Fit · pattern · weight | Tags |\n|---|---|---|---|---|---|---|");
  let saved = 0;
  for (const { raw: p, n } of normalised) {
    const label = labelBySeller.get(String(p.storeId));
    const a = attrs.get(String(p._id)) || {};
    const doc = Product.hydrate(p);
    Object.assign(doc, {
      genre: n.genre, subcategory: n.subcategory, category: n.category,
      currency: "USD", status: p.isAvailable === false ? "archived" : "active",
      labelId: label?._id, brand: label?.name || p.brand,
      variants: buildVariants({ sizes: n.sizes, colors: n.colors, stock: Number(p.stock) || 0, skuPrefix: (label?.slug || "mf").slice(0, 4) + "-" + String(p._id).slice(-4) }),
      occasions: a.occasions || [], seasons: a.seasons || [], fit: a.fit || "", pattern: a.pattern || "",
      fabricWeight: a.fabricWeight || "", tags: a.tags || [],
    });
    doc.isNew = false;
    await doc.save();
    saved++;
    report.push(`| ${doc.name} | ${doc.genre} / ${doc.subcategory} / ${doc.category} | ${doc.variants.length} (${doc.stock} units) | ${doc.occasions.join(", ")} | ${doc.seasons.join(", ")} | ${[doc.fit, doc.pattern, doc.fabricWeight].filter(Boolean).join(" · ")} | ${doc.tags.join(", ")} |`);
  }

  // 5. Carts and orders point at the exact variant.
  const products = new Map((await Product.find({})).map((p) => [String(p._id), p]));
  let linked = 0;
  for (const line of await Cart.find({})) {
    const v = findVariant(products.get(String(line.productId)), { size: line.size, color: line.color });
    if (v) { line.sku = v.sku; line.size = v.size; line.color = v.color; line.price = products.get(String(line.productId)).price; await line.save(); linked++; }
  }
  for (const line of await StoreOrder.find({})) {
    const v = findVariant(products.get(String(line.productId)), { size: line.size, color: line.color });
    if (v) { line.sku = v.sku; await line.save(); linked++; }
  }
  for (const order of await Order.find({})) {
    const items = order.items.map((i) => {
      const v = findVariant(products.get(String(i.productId)), { size: i.size, color: i.color });
      return v ? { ...i, sku: v.sku, currency: "USD" } : i;
    });
    await Order.updateOne({ _id: order._id }, { $set: { items } });
  }
  await Product.syncIndexes();

  fs.writeFileSync(path.join(__dirname, "..", "catalogue-review.md"), report.join("\n") + "\n");
  console.log(`labels: ${labelBySeller.size} · products migrated: ${saved} · AI-tagged: ${attrs.size} · cart/order lines linked to variants: ${linked}`);
  console.log("review: server/catalogue-review.md");
  await mongoose.disconnect();
})().catch(async (e) => {
  console.error("FAIL:", e.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
