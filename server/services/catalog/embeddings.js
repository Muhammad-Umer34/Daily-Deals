// Meaning vectors for semantic product search ("something breezy for a beach
// holiday"), from Pinecone's hosted multilingual-e5-large model — the same
// service the help chatbot already uses, so no new provider.
require("dotenv").config();
const Product = require("../../models/store").default;

const ENDPOINT = "https://api.pinecone.io/embed";
const MODEL = "multilingual-e5-large";
const BATCH = 90; // the API accepts up to 96 inputs per call

/** The text a product is understood by: everything a shopper might describe. */
function embeddingTextFor(p) {
  return [
    p.name,
    p.brand && `by ${p.brand}`,
    `${p.genre} ${p.subcategory}, ${p.category} style`,
    p.occasions?.length && `for ${p.occasions.join(", ")}`,
    p.seasons?.length && `season: ${p.seasons.join(", ")}`,
    [p.fit && `${p.fit} fit`, p.pattern, p.fabricWeight && `${p.fabricWeight}-weight`].filter(Boolean).join(", "),
    p.material,
    p.color?.length && `colours: ${p.color.join(", ")}`,
    p.tags?.length && p.tags.join(", "),
    p.description,
  ].filter(Boolean).join(". ").slice(0, 2000);
}

async function embed(texts, inputType) {
  const key = process.env.PINECONE_API_KEY;
  if (!key) throw new Error("PINECONE_API_KEY is not set");
  const out = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Api-Key": key, "Content-Type": "application/json", "X-Pinecone-API-Version": "2025-04" },
      body: JSON.stringify({ model: MODEL, parameters: { input_type: inputType, truncate: "END" }, inputs: texts.slice(i, i + BATCH).map((text) => ({ text })) }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`embedding service ${res.status}`);
    const json = await res.json();
    out.push(...json.data.map((d) => d.values));
  }
  return out;
}

const embedQuery = async (text) => (await embed([String(text).slice(0, 500)], "query"))[0];

/** (Re)embed products whose text changed. Pass ids, or nothing for all. */
async function embedProducts(ids) {
  const filter = ids?.length ? { _id: { $in: ids } } : {};
  const products = await Product.find(filter).select("+embeddingText +embedding");
  const stale = products.filter((p) => p.embeddingText !== embeddingTextFor(p) || !p.embedding?.length);
  if (!stale.length) return 0;
  const vectors = await embed(stale.map(embeddingTextFor), "passage");
  for (const [i, p] of stale.entries()) {
    await Product.updateOne({ _id: p._id }, { $set: { embedding: vectors[i], embeddingText: embeddingTextFor(p) } });
  }
  return stale.length;
}

const cosine = (a, b) => {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
};

module.exports = { embeddingTextFor, embedQuery, embedProducts, cosine };
