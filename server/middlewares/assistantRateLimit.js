// Assistant rate limiting.
//
// The counter lives in MongoDB because in-memory limits don't survive Vercel's
// serverless model — consecutive requests may land on different servers. One
// document per (identity, hour bucket); the bucket rolls over by itself.
const AssistantRateLimit = require("../models/assistantRateLimit");

const HOUR_MS = 60 * 60 * 1000;
const GUEST_LIMIT = Number(process.env.ASSISTANT_RATE_GUEST || 30);   // per IP
const USER_LIMIT = Number(process.env.ASSISTANT_RATE_USER || 100);    // per account

const clientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return String(forwarded).split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
};

const hourBucket = (at = new Date()) => new Date(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate(), at.getUTCHours()).toISOString().slice(0, 13);

/**
 * Counts this request and says whether it's over the limit.
 * @returns {Promise<{allowed: boolean, remaining: number}>}
 */
async function checkRate(req, userId) {
  const limit = userId ? USER_LIMIT : GUEST_LIMIT;
  const identity = userId ? `user:${userId}` : `ip:${clientIp(req)}`;
  const _id = `${identity}:${hourBucket()}`;
  const expiresAt = new Date(Date.now() + 2 * HOUR_MS);

  const doc = await AssistantRateLimit.findOneAndUpdate(
    { _id },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
    { upsert: true, new: true }
  );

  return { allowed: doc.count <= limit, remaining: Math.max(0, limit - doc.count) };
}

const RATE_LIMITED_MESSAGE =
  "You've sent a lot of messages in a little while, so I'm going to pause here. Please try again on the next hour.";

module.exports = { checkRate, RATE_LIMITED_MESSAGE, GUEST_LIMIT, USER_LIMIT };
