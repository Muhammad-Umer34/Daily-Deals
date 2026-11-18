import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { FiShoppingBag } from "react-icons/fi";
import CartItem from "./cartCard";
import { deleteCartItem, getCardItems, updateCartQuantity } from "../../features/customer/customerApi";
import { cartActions } from "../../features/customer/cartSlice";
import { formatPrice, FREE_DELIVERY_FROM } from "@/lib/utils";

const CartPage = () => {
  const dispatch = useDispatch();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const accessToken = useSelector((state) => state.auth.accessToken);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user?.id || !accessToken) return;
    getCardItems(user.id, accessToken)
      .then((items) => {
        const list = items || [];
        setCartItems(list);
        dispatch(cartActions.setItems(list.map((i) => ({ ...i, id: i._id }))));
      })
      .catch(() => setError("Couldn't load your cart."))
      .finally(() => setLoading(false));
  }, [user?.id, accessToken, dispatch]);

  const onRemove = async (itemId) => {
    try {
      await deleteCartItem(itemId, accessToken, user.id);
      setCartItems((items) => {
        const next = items.filter((item) => item._id !== itemId);
        dispatch(cartActions.setItems(next.map((i) => ({ ...i, id: i._id }))));
        return next;
      });
    } catch {
      setError("Couldn't remove that item. Please try again.");
    }
  };

  const onQuantityChange = async (item, quantity) => {
    if (quantity < 1) return;
    const previous = item.quantity;
    const update = (q) => {
      setCartItems((items) => {
        const next = items.map((i) => (i._id === item._id ? { ...i, quantity: q } : i));
        dispatch(cartActions.setItems(next.map((i) => ({ ...i, id: i._id }))));
        return next;
      });
    };
    update(quantity);
    try {
      await updateCartQuantity(item._id, accessToken, quantity);
    } catch {
      update(previous);
      setError("Couldn't update the quantity. Please try again.");
    }
  };

  const units = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="bg-paper py-12 px-4">
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <p className="note mb-2">Your Selection</p>
        <h1 className="display-2 text-ink mb-8">Your Cart</h1>
        {error && <p role="alert" className="mb-4 font-meta text-xs text-oxblood">{error}</p>}

        {loading ? (
          <p className="text-bark py-12 text-center font-meta text-sm">Loading your cart…</p>
        ) : cartItems.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1 divide-y divide-hairline border-t border-hairline">
              {cartItems.map((item) => (
                <CartItem key={item._id} item={item} onRemove={onRemove} onQuantityChange={onQuantityChange} />
              ))}
            </div>

            <aside className="w-full lg:w-80 h-fit bg-parchment border-t-2 border-ink p-6 flex flex-col gap-4">
              <h2 className="font-display font-semibold tracking-[-0.02em] text-2xl text-ink">Order Summary</h2>
              <div className="flex justify-between text-bark font-meta text-xs">
                <span>Items</span>
                <span className="text-ink">{units}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-hairline pt-4">
                <span className="font-meta text-xs text-bark">Subtotal</span>
                <span className="font-display font-semibold tracking-[-0.02em] text-2xl text-ink">{formatPrice(total)}</span>
              </div>
              <p className="font-meta text-xs text-bark/70">Delivery is calculated at checkout (free from {formatPrice(FREE_DELIVERY_FROM)}).</p>
              <Link
                to="/home/cart/checkout"
                className="btn-ink mt-2 w-full text-center"
              >
                Proceed to Checkout
              </Link>
            </aside>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FiShoppingBag size={56} className="text-hairline mb-4" aria-hidden="true" />
            <p className="font-display font-semibold tracking-[-0.02em] text-2xl text-ink mb-2">Your cart is empty.</p>
            <Link to="/home/all" className="btn-ink mt-4">
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
