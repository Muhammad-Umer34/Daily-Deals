// Server-side store for shop-assistant conversations.
//
// Kept on the server (not in the browser) so a shopper can't edit past tool
// results to fake a price, and so a chat started while logged out can be
// attached to the account after login.
const mongoose = require("mongoose");

const CONVERSATION_TTL_DAYS = 7;

const assistantConversationSchema = new mongoose.Schema(
  {
    // Client-generated id (validated in the controller before it reaches here).
    _id: { type: String, required: true },

    // Empty while anonymous; set to the user id once the shopper logs in.
    userId: { type: String, default: "" },

    // Model-visible transcript: user/assistant/tool messages in OpenAI shape,
    // plus `blocks` on assistant turns so a refresh can re-render the cards.
    messages: { type: Array, default: [] },

    // Current filters, so "cheaper" or "in blue" adjust the search in place.
    searchState: { type: Object, default: {} },

    // Persistent shopper context across turns (e.g., department: 'men'|'women'|'kids', gender, preferred size)
    shopperProfile: { type: Object, default: {} },

    // Something waiting on login, e.g. { tool: "add_to_cart", args: {...} }.
    pendingAction: { type: Object, default: null },
  },
  { timestamps: true, minimize: false }
);

// Housekeeping: conversations disappear a week after their last message.
assistantConversationSchema.index(
  { updatedAt: 1 },
  { expireAfterSeconds: CONVERSATION_TTL_DAYS * 24 * 60 * 60 }
);

module.exports = mongoose.model("AssistantConversation", assistantConversationSchema);
module.exports.CONVERSATION_TTL_DAYS = CONVERSATION_TTL_DAYS;
