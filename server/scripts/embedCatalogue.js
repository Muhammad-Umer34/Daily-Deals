// Computes meaning vectors for every product whose description changed.
// Usage: node scripts/embedCatalogue.js
require("dotenv").config();
const mongoose = require("mongoose");
const dns = require("dns");
const { embedProducts } = require("../services/catalog/embeddings");

if (dns.getServers().every((s) => s.startsWith("127.") || s === "::1")) dns.setServers(["8.8.8.8", "1.1.1.1"]);

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB_NAME || "dailydeals" });
  const n = await embedProducts();
  console.log(`embedded ${n} product(s) in ${process.env.MONGO_DB_NAME}`);
  await mongoose.disconnect();
})().catch(async (e) => { console.error("FAIL:", e.message.replace(/\/\/[^@]*@/g, "//***@")); await mongoose.disconnect().catch(() => {}); process.exit(1); });
