// Signing and checking the order-confirmation token.
//
// The token is what makes "Confirm order" meaningful: the model can produce a
// summary, but only a token signed by this server — bound to one user, one
// exact cart, one address and one phone, for ten minutes — can be exchanged
// for a real order. The model never sees the secret and cannot mint one.
const crypto = require("crypto");
require("dotenv").config();

const TTL_SECONDS = 10 * 60;

const secret = () => {
  const value = process.env.ASSISTANT_ORDER_SECRET;
  if (!value) throw new Error("ASSISTANT_ORDER_SECRET is not set");
  return value;
};

const b64url = (value) => Buffer.from(value).toString("base64url");
const unb64url = (value) => Buffer.from(value, "base64url").toString("utf8");

const hmac = (body) => crypto.createHmac("sha256", secret()).update(body).digest("base64url");

/**
 * A stable fingerprint of exactly what is being bought. Any change to a line —
 * quantity, price, size, colour, or a line appearing or disappearing — changes
 * this, which invalidates an already-issued token.
 */
function cartFingerprint(items = []) {
  const canonical = items
    .map((i) => [i.productId, i.size, i.color, i.quantity, i.price].join(":"))
    .sort()
    .join("|");
  return crypto.createHash("sha256").update(canonical).digest("base64url").slice(0, 32);
}

/** @returns {string} token of the form `<payload>.<signature>` */
function sign({ userId, cartHash, total, shippingAddress, phoneNumber, paymentMethod }) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    jti: crypto.randomUUID(),
    userId,
    cartHash,
    total,
    shippingAddress,
    phoneNumber,
    paymentMethod,
    iat: now,
    exp: now + TTL_SECONDS,
  };
  const body = b64url(JSON.stringify(payload));
  return { token: `${body}.${hmac(body)}`, payload };
}

/**
 * Checks shape, signature and expiry only. Whether the cart still matches, and
 * whether this token has already been spent, are checked by the caller against
 * live data — they can change after the token was issued.
 *
 * @returns {{ok: boolean, payload?: object, reason?: string}}
 */
function verify(token) {
  if (typeof token !== "string" || token.length > 4096) return { ok: false, reason: "malformed" };
  const [body, signature] = token.split(".");
  if (!body || !signature) return { ok: false, reason: "malformed" };

  const expected = hmac(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  // Constant-time compare, and length-checked first because timingSafeEqual
  // throws on a length mismatch.
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return { ok: false, reason: "bad signature" };

  let payload;
  try {
    payload = JSON.parse(unb64url(body));
  } catch {
    return { ok: false, reason: "malformed" };
  }

  if (!payload.jti || !payload.userId) return { ok: false, reason: "malformed" };
  if (Math.floor(Date.now() / 1000) > payload.exp) return { ok: false, reason: "expired" };

  return { ok: true, payload };
}

module.exports = { sign, verify, cartFingerprint, TTL_SECONDS };
