import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiShoppingBag } from "react-icons/fi";
import CartItem from "./cartCard";
import { deleteCartItem, getCardItems, updateCartQuantity } from "../../features/customer/customerApi";
import { formatPrice } from "@/lib/utils";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const accessToken = useSelector((state) => state.auth.accessToken);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user?.id || !accessToken) return;
    getCardItems(user.id, accessToken)
      .then((items) => setCartItems(items || []))
      .catch(() => setError("Couldn't load your cart."))
      .finally(() => setLoading(false));
  }, [user?.id, accessToken]);

  const onRemove = async (itemId) => {
    try {
      await deleteCartItem(itemId, accessToken, user.id);
      setCartItems((items) => items.filter((item) => item._id !== itemId));
    } catch {
      setError("Couldn't remove that item. Please try again.");
    }
  };

  const onQuantityChange = async (item, quantity) => {
    if (quantity < 1) return;
    const previous = item.quantity;
    const setQty = (q) => setCartItems((items) => items.map((i) => (i._id === item._id ? { ...i, quantity: q } : i)));
    setQty(quantity);
    try {
      await updateCartQuantity(item._id, accessToken, quantity);
    } catch {
      setQty(previous);
      setError("Couldn't update the quantity. Please try again.");
    }
  };

  const units = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">Your Cart</h1>
        {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-gray-500 py-12 text-center">Loading your cart…</p>
        ) : cartItems.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-4">
              {cartItems.map((item) => (
                <CartItem key={item._id} item={item} onRemove={onRemove} onQuantityChange={onQuantityChange} />
              ))}
            </div>

            <aside className="w-full lg:w-80 h-fit bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-gray-800">Order Summary</h2>
              <div className="flex justify-between text-gray-700">
                <span>Items</span>
                <span>{units}</span>
              </div>
              <div className="flex justify-between text-gray-700 font-medium">
                <span>Subtotal</span>
                <span className="text-black font-bold text-lg">{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-gray-500">Delivery is calculated at checkout (free from Rs 2,000).</p>
              <Link
                to="/home/cart/checkout"
                className="mt-2 w-full text-center bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
              >
                Proceed to Checkout
              </Link>
            </aside>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FiShoppingBag size={56} className="text-gray-300 mb-4" aria-hidden="true" />
            <p className="text-lg text-gray-600 mb-2">Your cart is empty.</p>
            <Link to="/home/all" className="mt-2 px-6 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition">
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
