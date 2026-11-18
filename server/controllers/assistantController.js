// HTTP layer for the shop assistant.
//
// Login is optional on /chat on purpose — anyone may search by chat. Failures
// of the model provider come back as a normal 200 with a friendly reply, and
// a cart action attempted while logged out comes back as a 200 carrying
// `action: "login_required"`. Neither is ever a 401/403: the client's axios
// interceptor logs the user out on those, which would wipe the conversation
// mid-sentence.
const AssistantConversation = require("../models/assistantConversation");
const AssistantTurnLog = require("../models/assistantTurnLog");
const UsedOrderToken = require("../models/assistantOrderToken");
const User = require("../models/user");
const { runTurn, AssistantUnavailableError } = require("../services/assistant/agent");
const cartTools = require("../services/assistant/cartTools");
const checkoutTools = require("../services/assistant/checkoutTools");
const { verify, cartFingerprint } = require("../services/assistant/orderToken");
const { placeOrder, buildOrderDraft, OrderError } = require("../services/orders");
const { checkRate, RATE_LIMITED_MESSAGE } = require("../middlewares/assistantRateLimit");

const MAX_MESSAGE_CHARS = 500;
// Tool calls and results count as messages too, so the stored cap is generous and
// "this chat is full" is measured in shopper messages instead.
const MAX_STORED_MESSAGES = 250;
const MAX_SHOPPER_MESSAGES = 50;
const CONVERSATION_ID = /^[A-Za-z0-9_-]{8,64}$/;

/** Best-effort turn logging; a logging failure must never break a chat. */
const logTurn = async (entry) => {
  try {
    await AssistantTurnLog.create(entry);
  } catch (err) {
    console.error("[assistant] turn log failed:", err.message);
  }
};

/** Only the parts of the transcript the page renders. */
const toClientMessages = (messages = []) =>
  messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && m.content && !m.tool_calls)
    .map((m, index) => ({
      id: `${index}-${m.role}`,
      role: m.role,
      text: m.content,
      blocks: m.blocks || [],
      at: m.at || null,
    }));

// Actions that may be waiting on login and can be replayed once the shopper is back.
const REPLAYABLE = { ...cartTools.handlers, ...checkoutTools.handlers };

// Only customer accounts shop. A store owner may search, but gets the guest
// treatment for the cart and checkout tools (with a message saying why).
const shopperId = (req) => (req.user?.userType === "customer" ? req.user.id : "");

// The shopper sent a token that has expired: the page renews it and resends,
// rather than the shopper silently getting the logged-out experience.
const SESSION_EXPIRED = { sessionExpired: true, message: "Your session needs renewing." };

/** One line describing what replaying a pending action actually did. */
const describeOutcome = (tool, result) => {
  if (result?.error) return `I couldn't do that: ${result.error}`;
  if (tool === "prepare_checkout" && result?.ready) {
    return "Welcome back — here's your order summary. Check it and press Confirm order when you're happy.";
  }
  if (result?.needs_choice === "address") {
    return result.saved_addresses?.length
      ? `Welcome back — which address should I deliver to? ${result.saved_addresses.join(" / ")}`
      : "Welcome back — what's the delivery address? House or street, area and city, please.";
  }
  if (result?.needs_choice === "phone") {
    return result.saved_phones?.length
      ? `Welcome back — which number should the courier call? ${result.saved_phones.join(" / ")}`
      : "Welcome back — what's a mobile number the courier can call?";
  }
  if (tool === "save_delivery_details" && result?.saved) return "Welcome back — I've saved your delivery details. Say checkout when you're ready.";
  if (tool === "get_my_details") return "Welcome back — you're logged in. What would you like to do next?";
  if (result?.needs_choice === "size") return `Which size would you like? Available: ${(result.available_sizes || []).join(", ")}.`;
  if (result?.needs_choice === "color") return `Which colour would you like? Available: ${(result.available_colors || []).join(", ")}.`;
  if (tool === "add_to_cart" && result?.added) {
    const { name, color, size, quantity } = result.added;
    const bits = [color, size ? `size ${String(size).toUpperCase()}` : "", quantity > 1 ? `×${quantity}` : ""].filter(Boolean);
    return `Welcome back — I've added ${name}${bits.length ? ` (${bits.join(", ")})` : ""} to your cart.`;
  }
  if (tool === "remove_from_cart" && result?.removed) return `Welcome back — I've removed ${result.removed} from your cart.`;
  if (tool === "update_cart_item" && result?.updated) return `Welcome back — ${result.updated.name} is now ×${result.updated.quantity}.`;
  return "Welcome back — here's your cart.";
};

exports.postChat = async (req, res) => {
  const conversationId = String(req.body?.conversationId || "");
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";

  if (!CONVERSATION_ID.test(conversationId)) {
    return res.status(400).json({ message: "Invalid conversation id" });
  }
  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return res.status(400).json({ message: `Please keep it under ${MAX_MESSAGE_CHARS} characters.` });
  }
  if (req.sessionExpired) return res.status(200).json(SESSION_EXPIRED);

  // Abuse ceiling, before anything expensive happens. A reached limit is a
  // friendly 200, not a 429 — the page just shows the reply.
  try {
    const rate = await checkRate(req, req.user?.id);
    if (!rate.allowed) {
      await logTurn({ conversationId, userId: req.user?.id || "", ip: req.headers["x-forwarded-for"] || "", error: "rate_limited" });
      return res.status(200).json({
        conversationId,
        reply: RATE_LIMITED_MESSAGE,
        blocks: [],
        rateLimited: true,
      });
    }
  } catch (err) {
    console.error("[assistant] rate limit check failed:", err.message);
  }

  try {
    let conversation = await AssistantConversation.findById(conversationId);

    // A conversation that already belongs to someone else is never readable:
    // the page starts a fresh one rather than leaking it.
    if (conversation && conversation.userId && conversation.userId !== (req.user?.id || "")) {
      return res.status(409).json({ message: "Conversation belongs to another session", resetConversation: true });
    }

    // The transcript has a ceiling; past it the model's window would be nothing
    // but the oldest fragments. Ask for a fresh chat rather than failing.
    if (conversation && conversation.messages.filter((m) => m.role === "user").length >= MAX_SHOPPER_MESSAGES) {
      return res.status(200).json({
        conversationId,
        reply: "This chat has grown long, so I'm going to stop here. Press New chat and describe what you'd like — your cart stays as it is.",
        blocks: [],
        conversationFull: true,
      });
    }

    if (!conversation) {
      conversation = new AssistantConversation({ _id: conversationId, userId: req.user?.id || "" });
    }
    // Attach an anonymous chat to the account as soon as the shopper logs in.
    if (!conversation.userId && req.user?.id) conversation.userId = req.user.id;

    const ctx = { userId: shopperId(req), storeOwner: req.user?.userType === "storeOwner" };
    const startedAt = Date.now();

    let turn;
    try {
      turn = await runTurn({
        history: conversation.messages,
        userMessage: message,
        searchState: conversation.searchState,
        shopperProfile: conversation.shopperProfile || {},
        ctx,
      });
    } catch (err) {
      if (err instanceof AssistantUnavailableError) {
        console.error("[assistant] provider unavailable:", err.message);
        // Still record what the shopper asked, so the retry has context.
        conversation.messages = [...conversation.messages, { role: "user", content: message, at: new Date() }].slice(-MAX_STORED_MESSAGES);
        await conversation.save();
        await logTurn({
          conversationId, userId: ctx.userId, ip: "",
          durationMs: Date.now() - startedAt, error: "unavailable",
        });
        return res.status(200).json({
          conversationId,
          reply: err.userMessage,
          blocks: [],
          searchState: conversation.searchState,
          cart: ctx.userId ? await cartTools.cartSummary(ctx.userId) : null,
          unavailable: true,
        });
      }
      throw err;
    }

    conversation.messages = [...conversation.messages, ...turn.newMessages].slice(-MAX_STORED_MESSAGES);
    conversation.searchState = turn.searchState;
    if (turn.shopperProfile) conversation.shopperProfile = turn.shopperProfile;
    // Kept so /claim can replay it after login; cleared once it has run.
    conversation.pendingAction = turn.pendingAction || null;
    conversation.markModified("messages");
    conversation.markModified("searchState");
    conversation.markModified("shopperProfile");
    conversation.markModified("pendingAction");
    await conversation.save();

    await logTurn({
      conversationId,
      userId: ctx.userId,
      model: turn.model,
      rounds: turn.rounds,
      tools: turn.tools,
      promptTokens: turn.usage.prompt_tokens,
      completionTokens: turn.usage.completion_tokens,
      durationMs: Date.now() - startedAt,
      zeroResultQuery: turn.zeroResultQuery,
    });

    console.log(
      `[assistant] ${conversationId} rounds=${turn.rounds} tokens=${turn.usage.prompt_tokens}/${turn.usage.completion_tokens} user=${req.user?.id || "guest"}${turn.action ? ` action=${turn.action}` : ""}`
    );

    return res.status(200).json({
      conversationId,
      reply: turn.reply,
      blocks: turn.blocks,
      searchState: turn.searchState,
      cart: turn.cart,
      action: turn.action,
    });
  } catch (error) {
    console.error("Error in assistant chat:", error);
    await logTurn({ conversationId, userId: req.user?.id || "", error: "server" });
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Called by the page right after login: attaches an anonymous conversation to
 * the account and replays whatever the shopper was trying to do.
 *
 * The replay runs the tool directly rather than going back through the model —
 * the action is already decided, so this is cheaper and cannot drift.
 */
exports.postClaim = async (req, res) => {
  const conversationId = String(req.body?.conversationId || "");
  if (!CONVERSATION_ID.test(conversationId)) {
    return res.status(400).json({ message: "Invalid conversation id" });
  }
  if (req.sessionExpired) return res.status(200).json(SESSION_EXPIRED);
  // Not logged in: nothing to claim, and deliberately not an auth error.
  if (!req.user?.id) {
    return res.status(200).json({ claimed: false, action: "login_required" });
  }
  // A store owner never inherits a shopper's pending cart action.
  if (!shopperId(req)) {
    await AssistantConversation.updateOne({ _id: conversationId, userId: { $in: ["", req.user.id] } }, { $set: { pendingAction: null } }).catch(() => {});
    return res.status(200).json({ claimed: false });
  }

  try {
    const conversation = await AssistantConversation.findById(conversationId);
    if (!conversation) {
      return res.status(200).json({ claimed: false, cart: await cartTools.cartSummary(req.user.id) });
    }

    if (conversation.userId && conversation.userId !== req.user.id) {
      return res.status(409).json({ message: "Conversation belongs to another session", resetConversation: true });
    }
    conversation.userId = req.user.id;

    const pending = conversation.pendingAction;
    if (!pending?.tool || !REPLAYABLE[pending.tool]) {
      conversation.pendingAction = null;
      conversation.markModified("pendingAction");
      await conversation.save();
      return res.status(200).json({ claimed: true, cart: await cartTools.cartSummary(req.user.id) });
    }

    const outcome = await REPLAYABLE[pending.tool](pending.args || {}, { userId: req.user.id });
    const reply = describeOutcome(pending.tool, outcome.result);
    const cart = outcome.cart || (await cartTools.cartSummary(req.user.id));
    // A checkout that was waiting on login comes back as its summary card.
    const blocks = outcome.orderDraft
      ? [{ type: "order_draft", draft: outcome.orderDraft.summary, token: outcome.orderDraft.token }]
      : [];

    // Record it in the transcript so the model's next turn knows it happened.
    // The stored copy of a summary card never carries a live token.
    conversation.messages = [
      ...conversation.messages,
      { role: "assistant", content: reply, blocks: blocks.map((b) => ({ ...b, token: "" })), at: new Date() },
    ].slice(-MAX_STORED_MESSAGES);
    conversation.pendingAction = null;
    conversation.markModified("messages");
    conversation.markModified("pendingAction");
    await conversation.save();

    console.log(`[assistant] ${conversationId} claimed by ${req.user.id}, replayed ${pending.tool}`);

    return res.status(200).json({ claimed: true, replayed: pending.tool, reply, blocks, cart });
  } catch (error) {
    console.error("Error claiming assistant conversation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * The only way an order is placed from the chat.
 *
 * Reached by the shopper pressing "Confirm order" on the summary card. Every
 * refusal is a 200 with `ok: false` and a line the page can show — a 401/403
 * would trip the client's interceptor and log them out mid-checkout.
 */
exports.postConfirmOrder = async (req, res) => {
  const conversationId = String(req.body?.conversationId || "");
  const token = req.body?.token;

  if (req.sessionExpired) return res.status(200).json({ ok: false, reason: "session_expired", ...SESSION_EXPIRED });
  if (!req.user?.id) {
    return res.status(200).json({ ok: false, reason: "login_required", action: "login_required", message: "Please log in to place the order." });
  }
  if (!shopperId(req)) {
    return res.status(200).json({ ok: false, reason: "not_customer", message: "Orders need a customer account." });
  }

  const checked = verify(token);
  if (!checked.ok) {
    return res.status(200).json({
      ok: false,
      reason: checked.reason,
      message:
        checked.reason === "expired"
          ? "That summary has expired. Ask me to check out again and I'll make a fresh one."
          : "That confirmation is not valid any more. Ask me to check out again.",
    });
  }

  const payload = checked.payload;
  // A token is bound to the shopper it was issued to.
  if (payload.userId !== req.user.id) {
    return res.status(200).json({ ok: false, reason: "wrong_user", message: "That confirmation belongs to another session." });
  }

  try {
    // Spent tokens are caught before anything else is inspected: after a
    // successful order the cart is empty, so checking the cart first would
    // answer a replay with "Cart is empty" instead of the truth. The atomic
    // claim further down is what settles two simultaneous clicks.
    const alreadySpent = await UsedOrderToken.findById(payload.jti).lean();
    if (alreadySpent) {
      return res.status(200).json({
        ok: false,
        reason: "already_used",
        message: "That order has already been placed.",
        orderId: alreadySpent.orderId || undefined,
      });
    }

    // Re-price and re-check stock from the live cart, not from the token.
    let draft;
    try {
      draft = await buildOrderDraft(req.user.id);
    } catch (err) {
      if (err instanceof OrderError) {
        return res.status(200).json({ ok: false, reason: "cart_problem", message: err.userMessage });
      }
      throw err;
    }

    // Anything about the cart changed since the summary was made: refuse and
    // let the shopper see a fresh one rather than charging the old total.
    if (cartFingerprint(draft.items) !== payload.cartHash || draft.total !== payload.total) {
      return res.status(200).json({
        ok: false,
        reason: "cart_changed",
        message: "Your cart changed since that summary. Ask me to check out again for an updated one.",
        cart: await cartTools.cartSummary(req.user.id),
      });
    }

    // Single use. Claiming the id BEFORE placing the order is what makes a
    // double click produce one order: the second insert hits the unique index.
    try {
      await UsedOrderToken.create({ _id: payload.jti, userId: req.user.id });
    } catch (err) {
      if (err?.code === 11000) {
        return res.status(200).json({ ok: false, reason: "already_used", message: "That order has already been placed." });
      }
      throw err;
    }

    let order;
    try {
      // The login token carries no name; sellers need one on the order.
      const account = await User.findById(req.user.id).select("name").lean();
      ({ order } = await placeOrder({
        userId: req.user.id,
        userName: account?.name || "",
        userEmail: req.user.email,
        shippingAddress: payload.shippingAddress,
        phoneNumber: payload.phoneNumber,
        paymentMethod: payload.paymentMethod,
        // Checked on the exact cart being ordered, closing the gap after the check above.
        verifyDraft: (d) => cartFingerprint(d.items) === payload.cartHash && d.total === payload.total,
      }));
    } catch (err) {
      // Placing failed, so the token was not really spent — let them retry.
      await UsedOrderToken.deleteOne({ _id: payload.jti }).catch(() => {});
      if (err instanceof OrderError) {
        return res.status(200).json({ ok: false, reason: "cart_problem", message: err.userMessage });
      }
      throw err;
    }

    await UsedOrderToken.updateOne({ _id: payload.jti }, { $set: { orderId: String(order._id) } }).catch(() => {});

    const placed = {
      orderId: String(order._id),
      total: order.totalPrice,
      items: order.items.length,
      expectedDeliveryDate: order.expectedDeliveryDate,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
    };

    // Record it so the model's next turn knows the order exists.
    if (CONVERSATION_ID.test(conversationId)) {
      const conversation = await AssistantConversation.findById(conversationId);
      if (conversation && (!conversation.userId || conversation.userId === req.user.id)) {
        conversation.messages = [
          ...conversation.messages,
          {
            role: "assistant",
            content: `Order placed. Order ${placed.orderId}, total Rs ${placed.total}, cash on delivery.`,
            blocks: [{ type: "order_placed", order: placed }],
            at: new Date(),
          },
        ].slice(-MAX_STORED_MESSAGES);
        conversation.markModified("messages");
        await conversation.save();
      }
    }

    console.log(`[assistant] order ${placed.orderId} placed by ${req.user.id} from chat`);

    return res.status(200).json({
      ok: true,
      order: placed,
      cart: await cartTools.cartSummary(req.user.id),
    });
  } catch (error) {
    console.error("Error confirming assistant order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/** Restores a chat after a page refresh. */
exports.getConversation = async (req, res) => {
  const conversationId = String(req.params.id || "");
  if (!CONVERSATION_ID.test(conversationId)) {
    return res.status(400).json({ message: "Invalid conversation id" });
  }
  if (req.sessionExpired) return res.status(200).json(SESSION_EXPIRED);
  try {
    const conversation = await AssistantConversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    if (conversation.userId && conversation.userId !== (req.user?.id || "")) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    return res.status(200).json({
      conversationId,
      messages: toClientMessages(conversation.messages),
      searchState: conversation.searchState || {},
      cart: shopperId(req) ? await cartTools.cartSummary(req.user.id) : null,
      hasPendingAction: Boolean(conversation.pendingAction),
    });
  } catch (error) {
    console.error("Error loading assistant conversation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
