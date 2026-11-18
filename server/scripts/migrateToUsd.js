// One-time move of every stored price from Pakistani rupees to US dollars.
//
// Converts products, cart lines, orders (items and totals) and the sellers'
// order lines at a fixed rate, after writing a full backup of those four
// collections. Runs once: a marker in `migrations` makes a second run a no-op.
// Usage: node scripts/migrateToUsd.js
// Undo:  node scripts/migrateToUsd.js --restore backups/pre-usd-<timestamp>.json
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const dns = require("dns");
const { MongoClient, ObjectId } = require("mongodb");

if (dns.getServers().every((s) => s.startsWith("127.") || s === "::1")) dns.setServers(["8.8.8.8", "1.1.1.1"]);

const PKR_PER_USD = 280;
const MARKER = "currency-pkr-to-usd";
const COLLECTIONS = ["products", "carts", "orders", "storeorders"];

// Product prices become whole dollars (never below $1); everything priced from
// them follows, so carts and orders keep adding up.
const toUsdWhole = (pkr) => Math.max(1, Math.round(Number(pkr || 0) / PKR_PER_USD));
const toUsdCents = (pkr) => Math.round((Number(pkr || 0) / PKR_PER_USD) * 100) / 100;

// Mongo types survive the JSON round trip for restore.
const revive = (doc) => JSON.parse(JSON.stringify(doc), (k, v) => {
  if (v && typeof v === "object" && v.$oid) return new ObjectId(v.$oid);
  if (v && typeof v === "object" && v.$date) return new Date(v.$date);
  return v;
});
const serialise = (docs) => JSON.stringify(docs, (k, v) => {
  if (v && v._bsontype === "ObjectId") return { $oid: String(v) };
  if (v instanceof Date) return { $date: v.toISOString() };
  return v;
}, 0);

(async () => {
  if (!process.env.MONGO_URI) throw new Error("Set MONGO_URI");
  const client = await MongoClient.connect(process.env.MONGO_URI);
  const db = client.db(process.env.MONGO_DB_NAME || "dailydeals");
  try {
    const restoreIdx = process.argv.indexOf("--restore");
    if (restoreIdx > -1) {
      const file = process.argv[restoreIdx + 1];
      const backup = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
      for (const name of COLLECTIONS) {
        const docs = backup[name].map(revive);
        for (const doc of docs) await db.collection(name).replaceOne({ _id: doc._id }, doc, { upsert: true });
        console.log(`restored ${docs.length} ${name}`);
      }
      await db.collection("migrations").deleteOne({ _id: MARKER });
      return;
    }

    if (await db.collection("migrations").findOne({ _id: MARKER })) {
      console.log("Prices are already in USD; nothing changed.");
      return;
    }

    // 1. Backup, before touching anything.
    const backup = {};
    for (const name of COLLECTIONS) backup[name] = await db.collection(name).find({}).toArray();
    const dir = path.join(__dirname, "..", "backups");
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `pre-usd-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    fs.writeFileSync(file, `{${COLLECTIONS.map((n) => `"${n}":${serialise(backup[n])}`).join(",")}}`);
    console.log(`backup: ${path.relative(process.cwd(), file)} (${COLLECTIONS.map((n) => `${backup[n].length} ${n}`).join(", ")})`);

    // 2. Products: the source of every other price.
    const priceById = new Map();
    for (const p of backup.products) {
      const usd = toUsdWhole(p.price);
      priceById.set(String(p._id), usd);
      await db.collection("products").updateOne({ _id: p._id }, { $set: { price: usd } });
    }

    // 3. Cart lines follow their product (or convert on their own if it's gone).
    for (const c of backup.carts) {
      const usd = priceById.get(String(c.productId)) ?? toUsdWhole(c.price);
      await db.collection("carts").updateOne({ _id: c._id }, { $set: { price: usd } });
    }

    // 4. Orders: convert each line, then rebuild the total from the lines plus
    //    the delivery that was actually charged, so history still adds up.
    for (const o of backup.orders) {
      const items = (o.items || []).map((i) => ({ ...i, price: toUsdWhole(i.price) }));
      const oldSubtotal = (o.items || []).reduce((s, i) => s + Number(i.price || 0) * Number(i.quantity || 0), 0);
      const oldDelivery = Math.max(0, Number(o.totalPrice || 0) - oldSubtotal);
      const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
      const totalPrice = Math.round((subtotal + toUsdCents(oldDelivery)) * 100) / 100;
      await db.collection("orders").updateOne({ _id: o._id }, { $set: { items, totalPrice } });
    }

    // 5. The sellers' copies of each line.
    for (const s of backup.storeorders) {
      await db.collection("storeorders").updateOne({ _id: s._id }, { $set: { price: toUsdWhole(s.price) } });
    }

    await db.collection("migrations").insertOne({ _id: MARKER, rate: PKR_PER_USD, at: new Date(), backup: path.basename(file) });
    console.log(`converted at ${PKR_PER_USD} PKR = 1 USD: ${backup.products.length} products, ${backup.carts.length} cart lines, ${backup.orders.length} orders, ${backup.storeorders.length} seller lines`);
  } finally {
    await client.close();
  }
})().catch((e) => { console.error("FAIL:", e.message.replace(/\/\/[^@]*@/g, "//***@")); process.exit(1); });
