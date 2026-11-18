// Placing an order — the one place it happens.
//
// Extracted verbatim from customerController.postOrder so the checkout page
// and the shop assistant run the SAME rules: prices re-read from the product
// records, stock checked across every cart line, the seller's copy written,
// stock decremented, cart emptied. Nothing here knows about HTTP.
const Cart = require("../models/cart").default;
const Product = require("../models/store").default;
const Order = require("../models/order.js");
const StoreOrder = require("../models/storeOrders.js").default;
const { deliveryFee } = require("./pricing");
const { findVariant, takeStock, putBackStock } = require("./catalog/stock");

/**
 * A refusal the shopper is allowed to see ("Only 3 left of X"). The checkout
 * page prints these verbatim, so the wording is part of the contract.
 */
class OrderError extends Error {
  constructor(message) {
    super(message);
    this.name = "OrderError";
    this.userMessage = message;
  }
}

/**
 * Price the cart from the product records and refuse anything that can't be
 * ordered. Used both to show a summary and to place the order, so the two can
 * never disagree.
 */
async function buildOrderDraft(userId) {
  const cartItems = await Cart.find({ userId });
  if (cartItems.length === 0) throw new OrderError("Cart is empty");

  const products = await Product.find({ _id: { $in: cartItems.map((i) => i.productId) } });
  const productsById = new Map(products.map((p) => [p.id, p]));

  const items = [];
  const wanted = new Map(); // sku -> total quantity across cart lines
  for (const cartItem of cartItems) {
    const product = productsById.get(cartItem.productId);
    if (!product || product.status !== "active" || !Number.isInteger(cartItem.quantity) || cartItem.quantity < 1) {
      throw new OrderError(`${cartItem.name} is no longer available`);
    }
    // Stock is per size and colour: check the exact variant in the cart.
    const variant = findVariant(product, { sku: cartItem.sku, size: cartItem.size, color: cartItem.color });
    if (!variant) throw new OrderError(`${product.name} is no longer sold in ${cartItem.color}, size ${cartItem.size}`);
    wanted.set(variant.sku, (wanted.get(variant.sku) || 0) + cartItem.quantity);
    if (wanted.get(variant.sku) > variant.stock) {
      throw new OrderError(
        variant.stock > 0
          ? `Only ${variant.stock} left of ${product.name} in ${variant.color}, size ${variant.size}`
          : `${product.name} is sold out in ${variant.color}, size ${variant.size}`
      );
    }
    items.push({ ...cartItem.toObject(), sku: variant.sku, size: variant.size, color: variant.color, price: product.price, currency: product.currency, storeId: product.storeId });
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const delivery = deliveryFee(subtotal);
  return { items, subtotal, delivery, total: subtotal + delivery };
}

/**
 * Place the order: take the stock first (atomically, per variant), then write
 * the order and the sellers' copies, then clear the cart. If the stock can't
 * be taken nothing is written; if writing fails the stock is put back.
 */
async function placeOrder({ userId, userName, userEmail, shippingAddress, phoneNumber, paymentMethod, verifyDraft }) {
  const draft = await buildOrderDraft(userId);
  // The assistant passes a check that the cart is still exactly what the shopper
  // confirmed; run it on the very draft being ordered, so nothing can slip in between.
  if (verifyDraft && !verifyDraft(draft)) {
    throw new OrderError("Your cart changed since that summary. Ask me to check out again for an updated one.");
  }
  const { items, subtotal, total } = draft;

  const lines = items.map((i) => ({ productId: i.productId, sku: i.sku, quantity: i.quantity, name: i.name }));
  const taken = await takeStock(lines);
  if (!taken.ok) {
    throw new OrderError(`Sorry, ${taken.line.name} just sold out in that size and colour. Please check your bag.`);
  }

  let order;
  try {
  order = await Order.create({
    items,
    totalPrice: total,
    shippingAddress,
    paymentMethod,
    phoneNumber,
    orderStatus: "Pending",
    paymentStatus: "Pending",
    expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userId,
    userName,
    userEmail,
  });

  // The seller's view of the same sale, one row per line.
  await StoreOrder.insertMany(
    items.map((i) => ({
      productId: i.productId,
      userId,
      storeId: i.storeId,
      productName: i.name,
      productImage: i.image,
      price: i.price,
      quantity: i.quantity,
      color: i.color,
      size: i.size,
      sku: i.sku,
      parentOrderId: order.id,
    }))
  );
  } catch (err) {
    // Nothing half-written should keep the shopper's stock.
    await putBackStock(lines);
    if (order) await Order.deleteOne({ _id: order._id }).catch(() => {});
    throw err;
  }

  await Cart.deleteMany({ userId });

  // subtotal is returned for callers that want to show the breakdown.
  return { order, subtotal };
}

module.exports = { placeOrder, buildOrderDraft, OrderError };
