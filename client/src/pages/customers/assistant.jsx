import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import CustomerHeader from "../../components/ui/customer/header";
import { assistantActions } from "../../features/customer/assistantSlice";
import { cartActions } from "../../features/customer/cartSlice";
import {
  sendAssistantMessage,
  loadAssistantConversation,
  claimAssistantConversation,
  confirmAssistantOrder,
} from "../../features/customer/assistantApi";
import {
  ProductCards,
  ComparisonTable,
  FilterChips,
  Suggestions,
  LoginPrompt,
  OrderSummaryCard,
  OrderPlacedCard,
  SkeletonCards,
} from "./assistantBlocks";
import AssistantCart from "./assistantCart";

const MAX_CHARS = 500;

const blockOf = (message, type) => message.blocks?.find((b) => b.type === type)?.items || [];
const blockNamed = (message, type) => message.blocks?.find((b) => b.type === type) || null;

const AssistantPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const cartUnits = useSelector((state) => state.cart.units);
  const { conversationId, messages, input, status, error, searchState, loginRequired, lastMessage } = useSelector(
    (state) => state.assistant
  );
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const claimedFor = useRef({ key: "", promise: null });
  const [cartOpen, setCartOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  // { token, message } so the error shows on the card that was pressed, not just the newest.
  const [confirmError, setConfirmError] = useState(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  // True once the stored conversation has been restored; a question handed over
  // from the home page waits for it, or the restore would overwrite it on screen.
  const [restoredFor, setRestoredFor] = useState("");
  // Tokens already exchanged (or refused as spent), so a card can't be pressed twice.
  const [spentTokens, setSpentTokens] = useState(() => new Set());
  const sending = status === "sending";
  const isStoreOwner = user?.userType === "storeOwner";

  // On arrival (and right after logging in): first attach this conversation to
  // the account and replay whatever the shopper was blocked on, THEN restore the
  // thread — in that order, so the restore already contains the replay's reply
  // instead of racing it and wiping it from the screen.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let claim = null;
      const claimKey = `${conversationId}:${user?.id}`;
      if (user?.id && !isStoreOwner) {
        // One claim per conversation and account; a re-run (React StrictMode,
        // re-render) reuses its result instead of replaying the action twice.
        if (claimedFor.current.key !== claimKey) {
          claimedFor.current = { key: claimKey, promise: claimAssistantConversation({ conversationId }) };
        }
        try {
          claim = await claimedFor.current.promise;
        } catch (err) {
          // This chat belongs to another account: start a clean one.
          if (err.response?.status === 409) {
            dispatch(assistantActions.reset());
            return;
          }
        }
      }

      let restored = null;
      try {
        restored = await loadAssistantConversation({ conversationId });
      } catch {
        /* a failed restore is not worth interrupting a fresh chat */
      }
      if (cancelled) return;

      if (restored?.messages?.length) {
        dispatch(assistantActions.hydrate({ messages: restored.messages, searchState: restored.searchState }));
      } else if (claim?.reply) {
        dispatch(assistantActions.addAssistantMessage({ reply: claim.reply, blocks: claim.blocks || [] }));
      }
      // The stored copy of a summary card has no live token; the replay's does.
      const draft = claim?.blocks?.find((b) => b.type === "order_draft");
      if (draft?.token && restored?.messages?.length) dispatch(assistantActions.attachDraftToken(draft.token));

      const cart = claim?.cart || restored?.cart;
      if (cart) dispatch(cartActions.setCart(cart));
      if (claim) dispatch(assistantActions.setLoginRequired(false));
      setRestoredFor(conversationId);
    })();
    return () => {
      cancelled = true;
    };
  }, [conversationId, user?.id, isStoreOwner, dispatch]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  // `retry` resends the last message without adding the shopper's bubble a second time.
  const send = async (text, { retry = false } = {}) => {
    const message = text.trim();
    if (!message || sending) return;

    dispatch(retry ? assistantActions.retrying() : assistantActions.addUserMessage(message));
    try {
      let data;
      try {
        data = await sendAssistantMessage({ conversationId, message });
      } catch (err) {
        // No response at all (server restarting, a network blip): wait a moment and try once more.
        if (err.response) throw err;
        await new Promise((r) => setTimeout(r, 1500));
        data = await sendAssistantMessage({ conversationId, message });
      }
      dispatch(
        assistantActions.addAssistantMessage({
          reply: data.reply,
          blocks: data.blocks,
          searchState: data.searchState,
          action: data.action,
        })
      );
      if (data.cart) dispatch(cartActions.setCart(data.cart));
    } catch (err) {
      // 409: this id belongs to another session — start a clean one.
      if (err.response?.status === 409) {
        dispatch(assistantActions.reset());
        dispatch(assistantActions.setError("Started a new chat for you — please ask again."));
      } else {
        dispatch(
          assistantActions.setError(
            err.response?.data?.message ||
              (err.response
                ? "That message didn't get through. Please try again."
                : "Can't reach the shop right now. Check your connection and press Retry.")
          )
        );
      }
    } finally {
      inputRef.current?.focus();
    }
  };

  // Arriving from the home page with an occasion (/assistant?q=...): ask it once,
  // then clear it from the address so a refresh doesn't ask again.
  const [params, setParams] = useSearchParams();
  const askedFromLink = useRef("");
  useEffect(() => {
    const q = params.get("q")?.trim().slice(0, MAX_CHARS);
    if (!q || askedFromLink.current === q || restoredFor !== conversationId) return;
    askedFromLink.current = q;
    setParams({}, { replace: true });
    send(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, restoredFor, conversationId]);

  // The picker hands back a complete choice; naming the id keeps the model
  // from guessing which product was meant.
  const onAdd = (product, { size, color, quantity }) => {
    const bits = [color, size && `size ${String(size).toUpperCase()}`, quantity > 1 && `quantity ${quantity}`]
      .filter(Boolean)
      .join(", ");
    send(`Add product ${product.id} (${product.name})${bits ? ` in ${bits}` : ""} to my cart.`);
  };

  // The only path from chat to a real order. The button is disabled while this
  // runs, and the server refuses a second attempt with the same token anyway.
  const confirmOrder = async (token) => {
    if (!token || confirming) return;
    setConfirming(true);
    setConfirmError(null);
    try {
      const data = await confirmAssistantOrder({ conversationId, token });
      if (data.cart) dispatch(cartActions.setCart(data.cart));

      if (data.ok) {
        setSpentTokens((prev) => new Set(prev).add(token));
        dispatch(
          assistantActions.addAssistantMessage({
            reply: "Order placed — thank you.",
            blocks: [{ type: "order_placed", order: data.order }],
          })
        );
      } else {
        if (data.action === "login_required") dispatch(assistantActions.setLoginRequired(true));
        setConfirmError({ token, message: data.message || "That didn't go through. Please try again." });
        // Expired, already used or belonging to someone else: the card is dead.
        if (["already_used", "expired", "wrong_user", "bad signature", "malformed"].includes(data.reason)) {
          setSpentTokens((prev) => new Set(prev).add(token));
        }
      }
    } catch {
      setConfirmError({ token, message: "Couldn't reach the shop just now. Your order was not placed — please try again." });
    } finally {
      setConfirming(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const chips = blockOf(messages[messages.length - 1] || {}, "chips");

  return (
    <div className="flex flex-col h-screen bg-paper">
      <CustomerHeader />

      <div className="flex-1 flex min-h-0 pt-16">
        <main className="flex-1 flex flex-col min-h-0">
          <div className="w-full max-w-3xl mx-auto px-5 sm:px-8 pt-6 pb-3 flex items-end justify-between gap-4 border-b border-hairline">
            <div>
              <p className="note">Shop by conversation</p>
              <h1 className="display-2 text-ink">Shop Assistant</h1>
            </div>
            <div className="flex items-center gap-4">
              {user && !isStoreOwner && (
                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  className="lg:hidden link-draw font-meta text-xs text-ink cursor-pointer"
                >
                  Cart ({cartUnits})
                </button>
              )}
              <button
                type="button"
                onClick={() => (messages.length > 1 ? setConfirmingReset(true) : dispatch(assistantActions.reset()))}
                className="link-draw font-meta text-xs text-bark hover:text-ink transition-colors whitespace-nowrap cursor-pointer"
              >
                New chat
              </button>
            </div>
            {confirmingReset && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <span className="font-meta text-xs text-bark">Start a new chat? This clears the conversation.</span>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmingReset(false);
                    dispatch(assistantActions.reset());
                  }}
                  className="text-sm font-semibold text-ink cursor-pointer"
                >
                  Yes, clear it
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingReset(false)}
                  className="font-meta text-xs text-bark hover:text-ink cursor-pointer"
                >
                  Keep chatting
                </button>
              </div>
            )}
          </div>

          {isStoreOwner && (
            <p className="w-full max-w-3xl mx-auto px-5 sm:px-8 pt-4 font-meta text-xs text-oxblood">
              The shopping assistant is for customer accounts — you can search here, but the cart belongs to a
              customer account.
            </p>
          )}

          {/* Conversation */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div
              className="w-full max-w-3xl mx-auto px-5 sm:px-8 py-6 space-y-6"
              role="log"
              aria-live="polite"
              aria-label="Conversation with the shop assistant"
            >
              {messages.map((message, index) => {
                const isLast = index === messages.length - 1;
                return (
                  <div key={message.id} className={message.role === "user" ? "flex justify-end" : ""}>
                    {message.role === "user" ? (
                      <p className="max-w-[85%] bg-ink text-paper px-4 py-2.5 text-sm whitespace-pre-line">
                        {message.text}
                      </p>
                    ) : (
                      <div className="max-w-full">
                        <p className="text-ink leading-relaxed whitespace-pre-line">{message.text}</p>
                        <ComparisonTable items={blockOf(message, "comparison")} />
                        <ProductCards
                          items={blockOf(message, "products")}
                          onAdd={onAdd}
                          adding={sending || isStoreOwner}
                        />
                        {isLast && loginRequired && <LoginPrompt next="/assistant" />}

                        {(() => {
                          const draftBlock = blockNamed(message, "order_draft");
                          if (!draftBlock) return null;
                          const live = draftBlock.token && !spentTokens.has(draftBlock.token);
                          return (
                            <OrderSummaryCard
                              draft={draftBlock.draft}
                              token={live ? draftBlock.token : ""}
                              busy={confirming}
                              error={confirmError?.token === draftBlock.token ? confirmError.message : ""}
                              onConfirm={() => confirmOrder(draftBlock.token)}
                              onChange={() => send("I'd like to change something before I order")}
                            />
                          );
                        })()}

                        <OrderPlacedCard order={blockNamed(message, "order_placed")?.order} />

                        <Suggestions items={blockOf(message, "suggestions")} onPick={send} disabled={sending} />
                      </div>
                    )}
                  </div>
                );
              })}

              {sending && (
                <div>
                  <SkeletonCards count={3} />
                  <p className="font-meta text-xs text-bark animate-pulse mt-3">
                    Looking through the rails…
                  </p>
                </div>
              )}
              {error && (
                <div className="space-y-2">
                  <p role="alert" className="font-meta text-xs text-oxblood">
                    {error}
                  </p>
                  {lastMessage && status === "error" && (
                    <button
                      type="button"
                      onClick={() => send(lastMessage, { retry: true })}
                      className="border border-hairline hover:border-ink px-4 py-2 font-meta text-xs text-ink transition-colors cursor-pointer"
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>

          {/* Composer */}
          <div className="border-t border-hairline bg-paper">
            <div className="w-full max-w-3xl mx-auto px-5 sm:px-8 py-4 space-y-3">
              {chips.length > 0 && (
                <FilterChips items={chips} onRemove={(chip) => send(`Remove the ${chip.label} filter`)} />
              )}

              {/* Quick Action Category/Wizard Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1" aria-label="Quick shopping shortcuts">
                <span className="font-meta text-[11px] text-bark/60 mr-1">Quick:</span>
                {[
                  "Menswear",
                  "Womenswear",
                  "Under $20",
                  "Wedding",
                  "Casual",
                  "Office",
                  "Compare these",
                  ...(user && !isStoreOwner ? ["My recent order"] : []),
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    disabled={sending}
                    onClick={() => send(tag === "My recent order" ? "Where is my recent order?" : tag)}
                    className="border border-hairline hover:border-ink bg-paper disabled:opacity-50 px-2.5 py-1 rounded-full font-meta text-[11px] text-ink transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="flex items-end gap-3">
                <label htmlFor="assistant-input" className="sr-only">
                  Describe what you're looking for
                </label>
                <textarea
                  id="assistant-input"
                  ref={inputRef}
                  rows={1}
                  value={input}
                  maxLength={MAX_CHARS}
                  onChange={(e) => dispatch(assistantActions.setInput(e.target.value))}
                  onKeyDown={onKeyDown}
                  placeholder="A white formal shirt under $40…"
                  disabled={sending}
                  className="flex-1 resize-none bg-paper border border-hairline focus:border-ink focus:outline-none px-4 py-3 text-ink placeholder:text-bark/60 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => send(input)}
                  disabled={sending || !input.trim()}
                  className="btn-ink !px-6 !py-3 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>

              <div className="flex items-center justify-between font-meta text-xs text-bark/70">
                <span>
                  Enter sends · Shift + Enter for a new line
                  {searchState?.query ? ` · searching "${searchState.query}"` : ""}
                </span>
                <span className={input.length > MAX_CHARS - 50 ? "text-oxblood" : ""}>
                  {input.length}/{MAX_CHARS}
                </span>
              </div>

              <p className="font-meta text-xs text-bark/60">
                Prefer to browse?{" "}
                <Link to="/home/all" className="link-draw text-ink">
                  See the full collection
                </Link>
              </p>
            </div>
          </div>
        </main>

        {/* Cart: a column on desktop, a sheet on mobile. Customers only. */}
        {user && !isStoreOwner && <AssistantCart open={cartOpen} onClose={() => setCartOpen(false)} />}
      </div>
    </div>
  );
};

export default AssistantPage;
