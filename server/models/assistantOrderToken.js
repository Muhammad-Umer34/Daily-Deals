// Records every order-confirmation token that has been spent.
//
// This is what stops a double click (or a replayed request) from creating two
// orders: the token's id is inserted here inside a unique index, so the second
// attempt loses the race and is refused. Rows expire an hour after the token
// itself does, which is long enough to keep refusing replays and short enough
// that the collection never grows.
const mongoose = require("mongoose");

const usedOrderTokenSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },   // the token's jti
    userId: { type: String, required: true },
    orderId: { type: String, default: "" },
    usedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

usedOrderTokenSchema.index({ usedAt: 1 }, { expireAfterSeconds: 60 * 60 });

module.exports = mongoose.model("AssistantUsedOrderToken", usedOrderTokenSchema);
