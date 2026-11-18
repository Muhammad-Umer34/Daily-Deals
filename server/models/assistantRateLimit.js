// MongoDB-backed rate limiting for the assistant.
//
// In-memory counters don't work on Vercel — each request may land on a
// different server — so the counter lives in a collection. One document per
// (scope, hour bucket); the hourly bucket rolls over by itself and the TTL
// index cleans up.
const mongoose = require("mongoose");

const assistantRateLimitSchema = new mongoose.Schema({
  // e.g. "user:63af…:2026-11-12T14" or "ip:1.2.3.4:2026-11-12T14"
  _id: { type: String, required: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});

// Kept ~2 hours past the window so a rolled-over counter can never be reused
// by clock skew, and the collection stays small.
assistantRateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 2 * 60 * 60 });

module.exports = mongoose.model("AssistantRateLimit", assistantRateLimitSchema);
