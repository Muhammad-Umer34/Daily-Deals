// Rich blocks the assistant can attach to a reply: product cards with an
// add-to-cart picker, the live filter chips, quick replies, and the log-in
// prompt shown when a cart action needs an account.
//
// Everything rendered here comes from a server tool result, never from model
// prose.
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "@/lib/utils";

function ProductCard({ product, onAdd, adding }) {
  const [picking, setPicking] = useState(false);
  const [size, setSize] = useState(product.sizes?.[0] || "");
  const [color, setColor] = useState(product.colors?.[0] || "");
  const [quantity, setQuantity] = useState(1);

  const confirm = () => {
    onAdd(product, { size, color, quantity });
    setPicking(false);
  };

  return (
    <li className="snap-start shrink-0 w-[66vw] sm:w-auto border border-hairline bg-paper flex flex-col">
      <a href={product.url} target="_blank" rel="noopener noreferrer" className="group block">
        <div className="aspect-[4/5] bg-parchment overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              width={480}
              height={600}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="h-full w-full grid place-items-center font-display font-semibold tracking-[-0.02em] text-4xl text-bark/30">
              {product.name?.charAt(0) || "·"}
            </div>
          )}
        </div>
      </a>

      <div className="p-3 flex flex-col gap-1.5 flex-1">
        {product.brand && <p className="note text-bark/70">{product.brand}</p>}
        <h3 className="font-display font-semibold tracking-[-0.02em] text-lg leading-tight text-ink line-clamp-2">{product.name}</h3>
        <p className="font-meta text-sm text-ink">{formatPrice(product.price)}</p>

        {!product.inStock && <p className="font-meta text-xs text-oxblood">Out of stock</p>}

        {picking ? (
          <div className="mt-2 space-y-2 border-t border-hairline pt-3">
            {product.sizes?.length > 0 && (
              <label className="block">
                <span className="note text-bark/70">Size</span>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="mt-1 w-full bg-paper border border-hairline px-2 py-2 text-sm focus:border-ink focus:outline-none"
                >
                  {product.sizes.map((s) => (
                    <option key={s} value={s}>
                      {String(s).toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {product.colors?.length > 0 && (
              <label className="block">
                <span className="note text-bark/70">Colour</span>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="mt-1 w-full bg-paper border border-hairline px-2 py-2 text-sm capitalize focus:border-ink focus:outline-none"
                >
                  {product.colors.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="block">
              <span className="note text-bark/70">Quantity</span>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="mt-1 w-full bg-paper border border-hairline px-2 py-2 text-sm focus:border-ink focus:outline-none"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPicking(false)}
                className="flex-1 border border-hairline py-2 font-meta text-xs text-bark hover:text-ink transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={adding}
                className="btn-ink flex-1 !px-2 !py-2 !text-xs disabled:opacity-40"
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-auto pt-3 flex items-center gap-2">
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center border border-hairline hover:border-ink py-2 font-meta text-xs text-ink transition-colors"
            >
              View
            </a>
            <button
              type="button"
              onClick={() => setPicking(true)}
              disabled={adding || !product.inStock}
              className="flex-1 border border-ink bg-ink text-paper py-2 font-meta text-xs hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

export function ComparisonTable({ items = [] }) {
  if (!items || items.length < 2) return null;

  const features = [
    { label: "Price", key: "price" },
    { label: "Material", key: "material" },
    { label: "Fit", key: "fit" },
    { label: "Weight", key: "weight" },
    { label: "Occasions", key: "occasions" },
    { label: "Colors", key: "colors" },
    { label: "Sizes", key: "sizes_available" },
  ];

  return (
    <div className="mt-4 border border-hairline bg-paper overflow-hidden shadow-sm">
      <div className="bg-parchment px-4 py-2.5 border-b border-hairline flex items-center justify-between">
        <span className="note text-ink font-semibold">Side-by-side comparison</span>
        <span className="font-meta text-xs text-bark">{items.length} items</span>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-hairline bg-paper">
              <th className="p-3 font-semibold text-bark/80 w-28 shrink-0">Feature</th>
              {items.map((item) => (
                <th key={item.id} className="p-3 font-display font-semibold text-ink text-sm min-w-[140px]">
                  {item.name}
                  <span className="block font-meta text-xs font-normal text-bark mt-0.5">{item.brand}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline font-meta">
            {features.map((feat) => (
              <tr key={feat.key} className="hover:bg-parchment/40 transition-colors">
                <td className="p-3 font-medium text-bark/70 capitalize">{feat.label}</td>
                {items.map((item) => (
                  <td key={item.id} className="p-3 text-ink">
                    {feat.key === "price" ? (
                      <span className="font-semibold text-ink text-sm">{item.price}</span>
                    ) : (
                      <span className="capitalize">{item[feat.key] || "—"}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ProductCards({ items = [], onAdd, adding }) {
  if (!items.length) return null;
  return (
    <ul className="mt-4 flex gap-4 overflow-x-auto pb-2 snap-x sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible scrollbar-thin">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} onAdd={onAdd} adding={adding} />
      ))}
    </ul>
  );
}

/** Shown when a cart action came back as login_required. */
export function LoginPrompt({ next = "/assistant" }) {
  return (
    <div className="mt-4 border border-hairline bg-parchment p-4">
      <p className="text-[0.9375rem] font-semibold text-ink mb-2">Log in to continue</p>
      <p className="text-sm text-bark mb-3">
        Your chat stays exactly where it is — I'll add the item as soon as you're back.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link to={`/login?next=${encodeURIComponent(next)}`} className="btn-ink !px-5 !py-2.5">
          Log in
        </Link>
        <Link
          to={`/signup?next=${encodeURIComponent(next)}`}
          className="border border-hairline hover:border-ink px-5 py-2.5 font-meta text-xs text-ink transition-colors"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}

export function FilterChips({ items = [], onRemove }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Current search filters">
      <span className="note text-bark/70">Searching</span>
      {items.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 border border-hairline bg-parchment pl-2.5 pr-1.5 py-1 font-meta text-xs text-ink capitalize"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => onRemove(chip)}
            aria-label={`Remove filter ${chip.label}`}
            className="w-5 h-5 grid place-items-center text-bark hover:text-ink transition-colors cursor-pointer"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}

/**
 * The order summary card. Its Confirm button is the ONLY way an order is
 * placed from the chat — the assistant cannot do it, and typing "yes" cannot
 * either. The button disables itself while working so a double click can't
 * fire twice (the server refuses the second attempt regardless).
 */
export function OrderSummaryCard({ draft, token, onConfirm, onChange, busy, error }) {
  if (!draft) return null;
  const spent = !token; // restored from history: the token is stripped on save

  return (
    <div className="mt-4 border border-ink bg-paper">
      <div className="border-b border-hairline px-4 py-3 bg-parchment">
        <p className="note">Check and confirm</p>
        <h3 className="font-display font-semibold tracking-[-0.02em] text-2xl text-ink leading-tight">Your order</h3>
      </div>

      <ul className="px-4 divide-y divide-hairline">
        {draft.items.map((item, index) => (
          <li key={`${item.name}-${index}`} className="flex gap-3 py-3">
            <img
              src={item.image}
              alt=""
              width={48}
              height={60}
              className="w-12 h-[60px] object-cover bg-parchment shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold tracking-[-0.02em] text-base leading-tight text-ink line-clamp-2">{item.name}</p>
              <p className="font-meta text-xs text-bark capitalize mt-0.5">
                {[item.color, item.size && String(item.size).toUpperCase(), `×${item.quantity}`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <span className="font-meta text-sm text-ink whitespace-nowrap">{formatPrice(item.lineTotal)}</span>
          </li>
        ))}
      </ul>

      <dl className="px-4 py-3 border-t border-hairline space-y-1.5 font-meta text-xs text-bark">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatPrice(draft.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Delivery</dt>
          <dd>{draft.delivery ? formatPrice(draft.delivery) : "Free"}</dd>
        </div>
        <div className="flex justify-between font-display font-semibold tracking-[-0.02em] text-xl text-ink pt-2 border-t border-hairline">
          <dt>Total</dt>
          <dd>{formatPrice(draft.total)}</dd>
        </div>
      </dl>

      <div className="px-4 pb-3 space-y-1 font-meta text-xs text-bark">
        <p>
          <span className="text-bark/60">Deliver to </span>
          {draft.shippingAddress}
        </p>
        <p>
          <span className="text-bark/60">Phone </span>
          {draft.phoneNumber}
        </p>
        <p>
          <span className="text-bark/60">Payment </span>
          {draft.paymentMethod}
        </p>
      </div>

      {error && (
        <p role="alert" className="px-4 pb-2 font-meta text-xs text-oxblood">
          {error}
        </p>
      )}

      <div className="px-4 pb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy || spent}
          className="btn-ink flex-1 min-w-[10rem] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? "Placing order…" : spent ? "Summary expired" : "Confirm order"}
        </button>
        <button
          type="button"
          onClick={onChange}
          disabled={busy}
          className="flex-1 min-w-[9rem] border border-hairline hover:border-ink py-3 font-meta text-xs text-ink transition-colors disabled:opacity-40 cursor-pointer"
        >
          Change something
        </button>
      </div>
    </div>
  );
}

/** Shown once the order exists. */
export function OrderPlacedCard({ order }) {
  if (!order) return null;
  const due = order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate) : null;
  return (
    <div className="mt-4 border-t-2 border-ink bg-parchment p-4">
      <p className="note mb-1">Order placed</p>
      <p className="font-display font-semibold tracking-[-0.02em] text-2xl text-ink leading-tight mb-3">Thank you — it's on its way.</p>
      <dl className="space-y-1 font-meta text-xs text-bark">
        <div className="flex justify-between gap-4">
          <dt>Order</dt>
          <dd className="text-ink break-all">{order.orderId}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Total</dt>
          <dd className="text-ink">{formatPrice(order.total)}</dd>
        </div>
        {due && (
          <div className="flex justify-between gap-4">
            <dt>Expected by</dt>
            <dd className="text-ink">
              {due.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
            </dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt>Payment</dt>
          <dd className="text-ink">{order.paymentMethod}</dd>
        </div>
      </dl>
      <Link to="/home/profile" className="btn-ink mt-4 !px-5 !py-2.5 inline-block">
        View my orders
      </Link>
    </div>
  );
}

/** Ghost cards shown while a search is running. */
export function SkeletonCards({ count = 3 }) {
  return (
    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="border border-hairline bg-paper">
          <div className="aspect-[4/5] bg-parchment animate-pulse" />
          <div className="p-3 space-y-2">
            <div className="h-2 w-1/3 bg-parchment animate-pulse" />
            <div className="h-4 w-4/5 bg-parchment animate-pulse" />
            <div className="h-3 w-1/4 bg-parchment animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Suggestions({ items = [], onPick, disabled }) {  if (!items.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((text) => (
        <button
          key={text}
          type="button"
          disabled={disabled}
          onClick={() => onPick(text)}
          className="border border-hairline hover:border-ink disabled:opacity-50 px-3 py-2 font-meta text-xs text-ink transition-colors cursor-pointer"
        >
          {text}
        </button>
      ))}
    </div>
  );
}
