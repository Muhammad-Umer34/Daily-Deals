// Cart tools — the first ones that need an account.
//
// Two rules hold everywhere in this file:
//   1. The shopper is whoever the access token says they are. `ctx.userId`
//      comes from the verified JWT; the model cannot pass a user id.
//   2. A logged-out call never runs and never errors. It returns
//      `login_required` plus the action to replay, which the controller saves
//      on the conversation and the page turns into a "Log in to continue"
//      button. (An HTTP 401/403 here would trip the client's axios
//      interceptor and log the shopper out mid-conversation.)
const Product = require("../../models/store").default;
const Cart = require("../../models/cart").default;
const { cartTotals } = require("../pricing");
const { findVariant, sizesInStock } = require("../catalog/stock");

const MAX_QUANTITY = 10;
const OBJECT_ID = /^[a-f\d]{24}$/i;

const clean = (value) => (typeof value === "string" ? value.trim().slice(0, 40) : "");
const sameText = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();

const toLine = (item) => ({
  id: String(item._id),
  productId: item.productId,
  name: item.name,
  image: item.image,
  price: item.price,
  quantity: item.quantity,
  color: item.color,
  size: item.size,
});

/** The cart as both the model and the page see it. */
async function cartSummary(userId) {
  if (!userId) return { units: 0, subtotal: 0, delivery: 0, total: 0, freeDeliveryShortfall: 0, items: [] };
  const lines = await Cart.find({ userId }).lean();
  // Priced like the order is: from the product record now, not the price saved
  // when the line was added, so the drawer and the summary card always agree.
  const products = await Product.find({ _id: { $in: lines.map((l) => l.productId).filter((id) => OBJECT_ID.test(id)) } })
    .select("price")
    .lean();
  const priceOf = new Map(products.map((p) => [String(p._id), p.price]));
  const items = lines.map((l) => ({ ...l, price: priceOf.get(l.productId) ?? l.price }));
  return { ...cartTotals(items), items: items.map(toLine) };
}

const needsLogin = (tool, args) => ({
  result: {
    login_required: true,
    message:
      "The shopper must be logged in for this. Tell them in one short line that they need to log in, and that the item will be added for them as soon as they are back.",
  },
  pendingAction: { tool, args },
});

// ── tools ──────────────────────────────────────────────────────────────────

async function addToCart(args = {}, ctx = {}) {
  if (!ctx.userId) return needsLogin("add_to_cart", args);

  const productId = clean(args.product_id);
  if (!OBJECT_ID.test(productId)) return { result: { error: "Unknown product. Search again and use an id from the results." } };

  const product = await Product.findOne({ _id: productId, status: "active" }).lean();
  if (!product) return { result: { error: "That product isn't available any more." } };

  const sizes = (product.size || []).filter(Boolean);
  const colors = (product.color || []).filter(Boolean);

  // A missing choice is a question for the shopper, not an error.
  const size = clean(args.size);
  if (!size && sizes.length) return { result: { needs_choice: "size", available_sizes: sizes, product: product.name } };
  if (size && sizes.length && !sizes.some((s) => sameText(s, size))) {
    return { result: { error: `"${size}" isn't offered for this product.`, available_sizes: sizes } };
  }

  const color = clean(args.color);
  if (!color && colors.length) return { result: { needs_choice: "color", available_colors: colors, product: product.name } };
  if (color && colors.length && !colors.some((c) => sameText(c, color))) {
    return { result: { error: `"${color}" isn't offered for this product.`, available_colors: colors } };
  }

  let quantity = Number(args.quantity ?? 1);
  if (!Number.isInteger(quantity) || quantity < 1) quantity = 1;
  if (quantity > MAX_QUANTITY) quantity = MAX_QUANTITY;

  // Stock is per size and colour: check that exact variant.
  const variant = findVariant(product, { size, color });
  if (!variant || variant.stock <= 0) {
    return {
      result: {
        error: `${product.name} is sold out in ${color}, size ${size}.`,
        sizes_in_stock_in_this_colour: sizesInStock(product, color),
        colours_with_this_size: [...new Set((product.variants || []).filter((v) => v.stock > 0 && sameText(v.size, variant?.size || size)).map((v) => v.color))],
      },
    };
  }
  const canonicalSize = variant.size;
  const canonicalColor = variant.color;

  // Same variant already in the cart: add to that line, never past its stock.
  const existing = await Cart.findOne({ productId, userId: ctx.userId, sku: variant.sku });
  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, variant.stock);
    quantity = existing.quantity;
    await existing.save();
  } else {
    if (quantity > variant.stock) quantity = variant.stock;
    await Cart.create({
      productId,
      userId: ctx.userId,
      name: product.name,
      image: product.images?.[0],
      price: product.price,
      quantity,
      color: canonicalColor,
      size: canonicalSize,
      sku: variant.sku,
    });
  }

  const cart = await cartSummary(ctx.userId);
  return {
    result: {
      added: { name: product.name, size: canonicalSize, color: canonicalColor, quantity, price: product.price },
      cart_units: cart.units,
      cart_total: cart.total,
    },
    cart,
  };
}

async function viewCart(_args = {}, ctx = {}) {
  if (!ctx.userId) return needsLogin("view_cart", {});
  const cart = await cartSummary(ctx.userId);
  return { result: cart, cart };
}

async function updateCartItem(args = {}, ctx = {}) {
  if (!ctx.userId) return needsLogin("update_cart_item", args);

  const itemId = clean(args.cart_item_id);
  if (!OBJECT_ID.test(itemId)) return { result: { error: "Unknown cart item. Call view_cart first for the ids." } };

  const quantity = Number(args.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) return { result: { error: "Quantity must be a whole number of at least 1." } };
  // Say no rather than silently setting something the shopper didn't ask for.
  if (quantity > MAX_QUANTITY) {
    return { result: { error: `At most ${MAX_QUANTITY} of one item per cart line.`, max_per_line: MAX_QUANTITY } };
  }

  const line = await Cart.findOne({ _id: itemId, userId: ctx.userId });
  if (!line) return { result: { error: "That item isn't in the cart." } };

  const product = await Product.findById(line.productId).select("name variants").lean();
  const variant = product && findVariant(product, { sku: line.sku, size: line.size, color: line.color });
  if (variant && quantity > variant.stock) {
    return { result: { error: `Only ${variant.stock} left of ${product.name} in ${variant.color}, size ${variant.size}.`, max_available: variant.stock } };
  }

  line.quantity = quantity;
  await line.save();

  const cart = await cartSummary(ctx.userId);
  return { result: { updated: { name: line.name, quantity }, cart_units: cart.units, cart_total: cart.total }, cart };
}

async function removeFromCart(args = {}, ctx = {}) {
  if (!ctx.userId) return needsLogin("remove_from_cart", args);

  const itemId = clean(args.cart_item_id);
  if (!OBJECT_ID.test(itemId)) return { result: { error: "Unknown cart item. Call view_cart first for the ids." } };

  const removed = await Cart.findOneAndDelete({ _id: itemId, userId: ctx.userId });
  if (!removed) return { result: { error: "That item isn't in the cart." } };

  const cart = await cartSummary(ctx.userId);
  return { result: { removed: removed.name, cart_units: cart.units, cart_total: cart.total }, cart };
}

// ── definitions handed to the model ────────────────────────────────────────

const definitions = [
  {
    type: "function",
    function: {
      name: "add_to_cart",
      description:
        "Add a product to the shopper's cart. Size and colour must be ones the product actually offers — if the shopper hasn't said which, this tool tells you the available options so you can ask.",
      parameters: {
        type: "object",
        properties: {
          product_id: { type: "string", description: "Product id from a search result." },
          size: { type: "string" },
          color: { type: "string" },
          quantity: { type: "number", description: "1 to 10. Defaults to 1." },
        },
        required: ["product_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "view_cart",
      description: "The shopper's current cart: items with their cart_item_id, subtotal, delivery fee and total.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "update_cart_item",
      description: "Change the quantity of one cart line. Use view_cart first to get its cart_item_id.",
      parameters: {
        type: "object",
        properties: {
          cart_item_id: { type: "string" },
          quantity: { type: "number", description: "1 to 10." },
        },
        required: ["cart_item_id", "quantity"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "remove_from_cart",
      description: "Remove one line from the cart. Use view_cart first to get its cart_item_id.",
      parameters: {
        type: "object",
        properties: { cart_item_id: { type: "string" } },
        required: ["cart_item_id"],
      },
    },
  },
];

const handlers = {
  add_to_cart: addToCart,
  view_cart: viewCart,
  update_cart_item: updateCartItem,
  remove_from_cart: removeFromCart,
};

module.exports = { definitions, handlers, cartSummary, addToCart, viewCart, updateCartItem, removeFromCart, MAX_QUANTITY };
