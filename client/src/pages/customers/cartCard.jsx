import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { formatPrice } from "@/lib/utils";

// Quantity lives in the parent cart so the order summary stays in step.
const CartItem = ({ item, onRemove, onQuantityChange }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white w-full flex gap-4">
      <img src={item.image} alt={item.name} className="w-24 h-28 sm:w-28 sm:h-32 object-cover rounded-md bg-gray-100 shrink-0" />

      <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
        <div>
          <h3 className="font-medium text-base md:text-lg line-clamp-2">{item.name}</h3>
          <p className="mt-1 text-sm text-gray-500 capitalize">
            {item.color} · Size {String(item.size).toUpperCase()} · {formatPrice(item.price)} each
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-bold text-lg">{formatPrice(item.price * item.quantity)}</p>
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => onQuantityChange(item, item.quantity - 1)}
                disabled={item.quantity <= 1}
                aria-label={`Decrease quantity of ${item.name}`}
                className="px-2.5 py-2 hover:bg-gray-100 disabled:text-gray-300 cursor-pointer"
              >
                <FaMinus size={10} />
              </button>
              <span className="w-8 text-center text-sm font-medium" aria-live="polite">{item.quantity}</span>
              <button
                onClick={() => onQuantityChange(item, item.quantity + 1)}
                aria-label={`Increase quantity of ${item.name}`}
                className="px-2.5 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <FaPlus size={10} />
              </button>
            </div>
            <button
              onClick={() => onRemove(item._id)}
              aria-label={`Remove ${item.name} from cart`}
              title="Remove"
              className="p-2 text-gray-500 hover:text-red-600 cursor-pointer"
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
