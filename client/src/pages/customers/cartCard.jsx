import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { formatPrice } from "@/lib/utils";

// Quantity lives in the parent cart so the order summary stays in step.
const CartItem = ({ item, onRemove, onQuantityChange }) => {
  return (
    <div className="border-b border-hairline py-6 w-full flex gap-4 sm:gap-6">
      <div className="w-24 h-28 sm:w-28 sm:h-32 bg-parchment overflow-hidden shrink-0">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
        <div>
          <h3 className="font-display font-semibold tracking-[-0.02em] text-xl md:text-2xl leading-snug text-ink line-clamp-2">{item.name}</h3>
          <p className="mt-1 font-meta text-xs text-bark capitalize">
            {item.color} · Size {String(item.size).toUpperCase()} · {formatPrice(item.price)} each
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-display font-semibold tracking-[-0.02em] text-xl text-ink">{formatPrice(item.price * item.quantity)}</p>
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center border border-hairline">
              <button
                onClick={() => onQuantityChange(item, item.quantity - 1)}
                disabled={item.quantity <= 1}
                aria-label={`Decrease quantity of ${item.name}`}
                className="px-2.5 py-2 hover:bg-parchment disabled:text-bark/40 transition-colors duration-300 cursor-pointer"
              >
                <FaMinus size={10} />
              </button>
              <span className="w-8 text-center font-meta text-sm" aria-live="polite">{item.quantity}</span>
              <button
                onClick={() => onQuantityChange(item, item.quantity + 1)}
                aria-label={`Increase quantity of ${item.name}`}
                className="px-2.5 py-2 hover:bg-parchment transition-colors duration-300 cursor-pointer"
              >
                <FaPlus size={10} />
              </button>
            </div>
            <button
              onClick={() => onRemove(item._id)}
              aria-label={`Remove ${item.name} from cart`}
              title="Remove"
              className="p-2 text-bark hover:text-ink transition-colors duration-300 cursor-pointer"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
