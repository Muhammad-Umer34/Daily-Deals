// Copies every collection of the live (Atlas) database into a local MongoDB
// database, so schema work can happen without touching production.
// Read-only on the source. Replaces the local target database's contents.
// Usage: node scripts/copyToLocal.js [targetDbName]   (default: monofit_local)
require("dotenv").config();
const dns = require("dns");
const { MongoClient } = require("mongodb");

if (dns.getServers().every((s) => s.startsWith("127.") || s === "::1")) dns.setServers(["8.8.8.8", "1.1.1.1"]);

const SOURCE_URI = process.env.MONGO_URI_ATLAS || process.env.MONGO_URI;
const SOURCE_DB = "dailydeals";
const TARGET_URI = "mongodb://127.0.0.1:27017";
const TARGET_DB = process.argv[2] || "monofit_local";

(async () => {
  if (!SOURCE_URI || SOURCE_URI.includes("127.0.0.1")) throw new Error("Source must be the Atlas URI (MONGO_URI_ATLAS or MONGO_URI)");
  const source = await MongoClient.connect(SOURCE_URI);
  const target = await MongoClient.connect(TARGET_URI);
  try {
    const from = source.db(SOURCE_DB);
    const to = target.db(TARGET_DB);
    await to.dropDatabase();
    for (const { name } of await from.listCollections({}, { nameOnly: true }).toArray()) {
      const docs = await from.collection(name).find({}).toArray();
      if (docs.length) await to.collection(name).insertMany(docs, { ordered: false });
      console.log(`${name.padEnd(28)} ${docs.length}`);
    }
    console.log(`copied ${SOURCE_DB} (Atlas) -> ${TARGET_URI}/${TARGET_DB}`);
  } finally {
    await source.close();
    await target.close();
  }
})().catch((e) => { console.error("FAIL:", e.message.replace(/\/\/[^@]*@/g, "//***@")); process.exit(1); });
