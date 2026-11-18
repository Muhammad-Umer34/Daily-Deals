// Checkout tools. These prepare an order; none of them places one.
//
// prepare_checkout re-prices the cart from the product records, re-checks
// stock, and returns a summary plus a signed token. The token is handed to the
// page, never to the model's prose: only a real click on "Confirm order" can
// exchange it for an order.
const User = require("../../models/user");
const { buildOrderDraft, OrderError } = require("../orders");
const { sign, cartFingerprint } = require("./orderToken");

const PAYMENT_METHOD = "Cash on Delivery";

const toList = (value) => (Array.isArray(value) ? value : value ? [value] : []).filter(Boolean);
const clean = (value, max = 200) => (typeof value === "string" ? value.trim().slice(0, max) : "");

/**
 * Any international phone number: an optional leading +, then 7–15 digits
 * (the E.164 range), spaces, dashes, dots and brackets ignored.
 * Returns the number with only its digits and leading +, or "" when it isn't one.
 */
function normalisePhone(input) {
  const compact = String(input || "").trim().replace(/[\s\-().]/g, "");
  return /^\+?\d{7,15}$/.test(compact) ? compact : "";
}

const needsLogin = (tool, args) => ({
  result: {
    login_required: true,
    message: "The shopper must be logged in for this. Ask them to log in; their chat and cart are kept.",
  },
  pendingAction: { tool, args },
});

/** The shopper's saved delivery details, so the assistant can offer them. */
async function getMyDetails(_args = {}, ctx = {}) {
  if (!ctx.userId) return needsLogin("get_my_details", {});
  const user = await User.findById(ctx.userId).select("name address phoneNumber").lean();
  if (!user) return { result: { error: "Couldn't find your account details." } };
  return {
    result: {
      name: user.name || "",
      addresses: toList(user.address),
      phones: toList(user.phoneNumber),
    },
  };
}

/**
 * Adds a delivery address or phone number to the profile. Add-only on purpose:
 * unlike updateUserInfo it never replaces the existing list and never touches
 * the email.
 */
async function saveDeliveryDetails(args = {}, ctx = {}) {
  if (!ctx.userId) return needsLogin("save_delivery_details", args);

  const address = clean(args.address);
  const phoneInput = clean(args.phone, 32);
  const update = {};

  if (address) {
    if (address.length < 10) {
      return { result: { error: "That address looks too short — house or street, area and city, please." } };
    }
    update.address = address;
  }

  let phone = "";
  if (phoneInput) {
    phone = normalisePhone(phoneInput);
    if (!phone) {
      return { result: { error: `"${phoneInput}" isn't a phone number we can use. Include the country code, e.g. +44 20 7946 0958.` } };
    }
    update.phoneNumber = phone;
  }

  if (!address && !phone) return { result: { error: "Nothing to save: give an address, a phone number, or both." } };

  const $addToSet = {};
  if (update.address) $addToSet.address = update.address;
  if (update.phoneNumber) $addToSet.phoneNumber = update.phoneNumber;

  const user = await User.findByIdAndUpdate(ctx.userId, { $addToSet }, { new: true })
    .select("address phoneNumber")
    .lean();

  return {
    result: {
      saved: { address: update.address || undefined, phone: update.phoneNumber || undefined },
      addresses: toList(user?.address),
      phones: toList(user?.phoneNumber),
    },
  };
}

/**
 * Builds the order summary and the confirmation token. Does NOT order.
 *
 * The token returned alongside the result is for the page's confirm button;
 * the model only sees the summary.
 */
async function prepareCheckout(args = {}, ctx = {}) {
  if (!ctx.userId) return needsLogin("prepare_checkout", args);

  const user = await User.findById(ctx.userId).select("name address phoneNumber").lean();
  if (!user) return { result: { error: "Couldn't find your account details." } };

  const savedAddresses = toList(user.address);
  const savedPhones = toList(user.phoneNumber);

  // Use what was passed, else the only saved one. Several saved and none
  // chosen is a question for the shopper, not a guess.
  const givenAddress = clean(args.address);
  const shippingAddress = givenAddress || (savedAddresses.length === 1 ? savedAddresses[0] : "");
  if (!shippingAddress) {
    return {
      result: {
        needs_choice: "address",
        saved_addresses: savedAddresses,
        message: savedAddresses.length
          ? "Ask which saved address to deliver to."
          : "Ask for a delivery address, then save it with save_delivery_details.",
      },
    };
  }

  const givenPhone = clean(args.phone, 32);
  const phoneCandidate = givenPhone || (savedPhones.length === 1 ? savedPhones[0] : "");
  if (!phoneCandidate) {
    return {
      result: {
        needs_choice: "phone",
        saved_phones: savedPhones,
        message: savedPhones.length
          ? "Ask which saved number to use."
          : "Ask for a contact number, then save it with save_delivery_details.",
      },
    };
  }
  const phoneNumber = normalisePhone(phoneCandidate);
  if (!phoneNumber) {
    return { result: { error: `"${phoneCandidate}" isn't a phone number we can use. Include the country code, e.g. +44 20 7946 0958.` } };
  }

  // Re-price and re-check stock right now; this is the same function that
  // places the order, so the summary cannot disagree with the charge.
  let draft;
  try {
    draft = await buildOrderDraft(ctx.userId);
  } catch (err) {
    if (err instanceof OrderError) return { result: { error: err.userMessage } };
    throw err;
  }

  const cartHash = cartFingerprint(draft.items);
  const { token } = sign({
    userId: ctx.userId,
    cartHash,
    total: draft.total,
    shippingAddress,
    phoneNumber,
    paymentMethod: PAYMENT_METHOD,
  });

  const summary = {
    items: draft.items.map((i) => ({
      name: i.name,
      image: i.image,
      price: i.price,
      quantity: i.quantity,
      color: i.color,
      size: i.size,
      lineTotal: i.price * i.quantity,
    })),
    subtotal: draft.subtotal,
    delivery: draft.delivery,
    total: draft.total,
    shippingAddress,
    phoneNumber,
    paymentMethod: PAYMENT_METHOD,
  };

  return {
    // What the model sees: enough to talk about, no token.
    result: {
      ready: true,
      items: summary.items.length,
      total: summary.total,
      delivery: summary.delivery,
      shipping_address: shippingAddress,
      phone: phoneNumber,
      payment_method: PAYMENT_METHOD,
      message:
        "The confirmation card is now on screen with a Confirm order button. Tell the shopper to check it and press the button — you cannot place the order yourself, and saying yes in chat does not place it.",
    },
    // What the page needs: the card and the token behind its button.
    orderDraft: { summary, token },
  };
}

const definitions = [
  {
    type: "function",
    function: {
      name: "get_my_details",
      description: "The shopper's saved delivery addresses and phone numbers.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "save_delivery_details",
      description:
        "Save a NEW delivery address and/or phone number to the shopper's profile. Only adds; never replaces what is already saved.",
      parameters: {
        type: "object",
        properties: {
          address: { type: "string", description: "House or street, area, city." },
          phone: { type: "string", description: "Phone number with country code, e.g. +1 212 555 0100." },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "prepare_checkout",
      description:
        "Build the order summary card and its confirmation button. Call this when the shopper wants to check out. It does NOT place the order — only the shopper pressing Confirm order does that.",
      parameters: {
        type: "object",
        properties: {
          address: { type: "string", description: "Chosen delivery address. Omit to use the only saved one." },
          phone: { type: "string", description: "Chosen contact number. Omit to use the only saved one." },
        },
        required: [],
      },
    },
  },
];

const handlers = {
  get_my_details: getMyDetails,
  save_delivery_details: saveDeliveryDetails,
  prepare_checkout: prepareCheckout,
};

module.exports = {
  definitions,
  handlers,
  getMyDetails,
  saveDeliveryDetails,
  prepareCheckout,
  normalisePhone,
  PAYMENT_METHOD,
};
