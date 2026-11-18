// The cart beside the conversation: a side panel on desktop, a bottom sheet on
// mobile. Quantity changes and removals go through the same endpoints as
// /customer/cart, so both views always agree.
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { formatPrice } from "@/lib/utils";
import { cartActions } from "../../features/customer/cartSlice";
import { deleteCartItem, updateCartQuantity } from "../../features/customer/customerApi";

function Line({ item, onChange, onRemove, busy }) {
  return (
    <li className="flex gap-3 py-4 border-b border-hairline last:border-b-0">
      <img
        src={item.image}
        alt=""
        width={56}
        height={70}
        className="w-14 h-[70px] object-cover bg-parchment shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold tracking-[-0.02em] text-base leading-tight text-ink line-clamp-2">{item.name}</p>
        <p className="font-meta text-xs text-bark capitalize mt-0.5">
          {[item.color, item.size && String(item.size).toUpperCase()].filter(Boolean).join(" · ")}
        </p>

        <div className="flex items-center justify-between mt-2 gap-2">
          <div className="flex items-center border border-hairline">
            <button
              type="button"
              aria-label={`Reduce quantity of ${item.name}`}
              disabled={busy || item.quantity <= 1}
              onClick={() => onChange(item, item.quantity - 1)}
              className="w-11 h-11 sm:w-9 sm:h-9 grid place-items-center text-ink disabled:opacity-30 hover:bg-parchment transition-colors cursor-pointer"
            >
              −
            </button>
            <span className="w-8 text-center font-meta text-sm">{item.quantity}</span>
            <button
              type="button"
              aria-label={`Increase quantity of ${item.name}`}
              disabled={busy}
              onClick={() => onChange(item, item.quantity + 1)}
              className="w-11 h-11 sm:w-9 sm:h-9 grid place-items-center text-ink disabled:opacity-30 hover:bg-parchment transition-colors cursor-pointer"
            >
              +
            </button>
          </div>
          <span className="font-meta text-sm text-ink whitespace-nowrap">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>

      <button
        type="button"
        aria-label={`Remove ${item.name}`}
        disabled={busy}
        onClick={() => onRemove(item)}
        className="self-start text-bark hover:text-ink transition-colors disabled:opacity-40 cursor-pointer"
      >
        ×
      </button>
    </li>
  );
}

export default function AssistantCart({ open, onClose }) {
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.auth.accessToken);
  const user = useSelector((state) => state.auth.user);
  const cart = useSelector((state) => state.cart);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Re-price locally after a change; the next assistant reply re-syncs from
  // the server anyway.
  const applyItems = (items) => dispatch(cartActions.setItems(items));

  const onChange = async (item, quantity) => {
    if (quantity < 1 || busy) return;
    setBusy(true);
    setError("");
    const previous = cart.items;
    applyItems(cart.items.map((i) => (i.id === item.id ? { ...i, quantity } : i)));
    try {
      await updateCartQuantity(item.id, accessToken, quantity);
    } catch {
      applyItems(previous);
      setError("Couldn't update that. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const onRemove = async (item) => {
    if (busy) return;
    setBusy(true);
    setError("");
    const previous = cart.items;
    applyItems(cart.items.filter((i) => i.id !== item.id));
    try {
      await deleteCartItem(item.id, accessToken, user?.id);
    } catch {
      applyItems(previous);
      setError("Couldn't remove that. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const body = (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b border-hairline">
        <h2 className="font-display font-semibold tracking-[-0.02em] text-xl text-ink">
          Your cart{cart.units > 0 && <span className="font-meta text-xs text-bark ml-2">{cart.units} item{cart.units === 1 ? "" : "s"}</span>}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close cart"
          className="lg:hidden w-11 h-11 grid place-items-center text-bark hover:text-ink cursor-pointer"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-5">
        {cart.items.length === 0 ? (
          <p className="py-10 text-center font-meta text-xs text-bark">
            Nothing here yet
          </p>
        ) : (
          <ul>
            {cart.items.map((item) => (
              <Line key={item.id} item={item} onChange={onChange} onRemove={onRemove} busy={busy} />
            ))}
          </ul>
        )}
        {error && (
          <p role="alert" className="font-meta text-xs text-oxblood pb-3">
            {error}
          </p>
        )}
      </div>

      {cart.items.length > 0 && (
        <div className="border-t border-hairline px-5 py-4 space-y-2 bg-parchment">
          <div className="flex justify-between font-meta text-xs text-bark">
            <span>Subtotal</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <div className="flex justify-between font-meta text-xs text-bark">
            <span>Delivery</span>
            <span>{cart.delivery ? formatPrice(cart.delivery) : "Free"}</span>
          </div>
          {cart.freeDeliveryShortfall > 0 && (
            <p className="font-meta text-xs text-oxblood">
              Add {formatPrice(cart.freeDeliveryShortfall)} more for free delivery.
            </p>
          )}
          <div className="flex justify-between font-display font-semibold tracking-[-0.02em] text-xl text-ink pt-2 border-t border-hairline">
            <span>Total</span>
            <span>{formatPrice(cart.total)}</span>
          </div>
          <Link to="/home/cart/checkout" className="btn-ink w-full text-center mt-2">
            Checkout
          </Link>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop: a column that lives next to the conversation. */}
      <aside className="hidden lg:flex lg:flex-col w-80 border-l border-hairline bg-paper">{body}</aside>

      {/* Mobile: a bottom sheet. */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true" aria-label="Your cart">
          <button
            type="button"
            aria-label="Close cart"
            onClick={onClose}
            className="absolute inset-0 bg-ink/40 cursor-default"
          />
          <div className="relative w-full max-h-[80vh] bg-paper border-t border-hairline flex flex-col">{body}</div>
        </div>
      )}
    </>
  );
}
