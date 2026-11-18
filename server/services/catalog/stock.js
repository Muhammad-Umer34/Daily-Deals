// Variant stock: finding the right size-and-colour line, checking it, and taking
// stock away safely when an order is placed. Shared by the shop's cart and
// checkout, the seller tools and the shop assistant.
const Product = require("../../models/store").default;
const { normaliseSize } = require("./taxonomy");

const same = (a, b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();

/** The variant matching a sku, or a size and colour (case-insensitive). */
function findVariant(product, { sku, size, color } = {}) {
  const variants = product?.variants || [];
  if (sku) {
    const bySku = variants.find((v) => v.sku === sku);
    if (bySku) return bySku;
  }
  return variants.find((v) => same(v.size, normaliseSize(size)) && same(v.color, color)) || null;
}

/** Sizes still in stock for a colour (or any colour), for "which sizes are left?". */
function sizesInStock(product, color) {
  return [...new Set((product?.variants || []).filter((v) => v.stock > 0 && (!color || same(v.color, color))).map((v) => v.size))];
}

/**
 * Take stock for every line atomically, one variant at a time. If any line is
 * short (sold out, or someone else bought the last one a moment ago), every
 * line already taken is put back and the shortfall is reported.
 * @param {{productId:string, sku:string, quantity:number, name?:string}[]} lines
 * @returns {Promise<{ok:true}|{ok:false, line:object}>}
 */
async function takeStock(lines) {
  const taken = [];
  for (const line of lines) {
    const res = await Product.updateOne(
      { _id: line.productId, variants: { $elemMatch: { sku: line.sku, stock: { $gte: line.quantity } } } },
      { $inc: { "variants.$.stock": -line.quantity, purchasedCount: line.quantity } }
    );
    if (res.modifiedCount !== 1) {
      await putBackStock(taken);
      return { ok: false, line };
    }
    taken.push(line);
  }
  await refreshDerived(lines.map((l) => l.productId));
  return { ok: true };
}

/** Undo takeStock for the given lines (used on a failed order). */
async function putBackStock(lines) {
  for (const line of lines) {
    await Product.updateOne(
      { _id: line.productId, "variants.sku": line.sku },
      { $inc: { "variants.$.stock": line.quantity, purchasedCount: -line.quantity } }
    );
  }
  if (lines.length) await refreshDerived(lines.map((l) => l.productId));
}

/** Re-run the model's derivation (stock, sizesInStock…) after a raw update. */
async function refreshDerived(productIds) {
  for (const id of [...new Set(productIds.map(String))]) {
    const product = await Product.findById(id);
    if (product) await product.save();
  }
}

module.exports = { findVariant, sizesInStock, takeStock, putBackStock, refreshDerived };
