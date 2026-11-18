// One row per assistant turn — the raw material for the cost report and the
// "searches that found nothing" report. Never contains message text beyond the
// search query, and never any token or credential.
const mongoose = require("mongoose");

const THIRTY_DAYS = 30 * 24 * 60 * 60;

const assistantTurnLogSchema = new mongoose.Schema(
  {
    conversationId: { type: String, index: true },
    userId: { type: String, default: "" },
    ip: { type: String, default: "" },

    model: { type: String, default: "" },
    rounds: { type: Number, default: 0 },
    tools: { type: [String], default: [] },

    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },

    durationMs: { type: Number, default: 0 },
    error: { type: String, default: "" },          // "unavailable", "rate_limited", "server", or ""
    zeroResultQuery: { type: String, default: "" }, // a search that found nothing, for the report
  },
  { timestamps: true, versionKey: false }
);

assistantTurnLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: THIRTY_DAYS });

module.exports = mongoose.model("AssistantTurnLog", assistantTurnLogSchema);
