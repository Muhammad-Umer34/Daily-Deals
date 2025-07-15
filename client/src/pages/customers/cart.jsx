import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import CartItem from "./cartCard";
import { deleteCartItem, getCardItems } from "../../features/customer/customerApi";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await getCardItems(user.id, accessToken);
        setCartItems(response);
      } catch (error) {
        console.error("Failed to fetch cart items:", error);
      }
    };

    if (user?.id && accessToken) {
      fetchCartItems();
    }
  }, [user?.id, accessToken]);

  const onRemove = async (itemId) => {
    try {
      await deleteCartItem(itemId, accessToken, user.id);
      setCartItems((prevItems) => prevItems.filter((item) => item._id !== itemId));
    } catch (error) {
      console.error("Failed to remove cart item:", error);
    }
  };

  // Calculate total price
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Your Cart</h1>
        {cartItems.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1 space-y-4">
              {cartItems.map((item) => (
                <CartItem key={item._id} item={item} onRemove={onRemove} 
                  imageClassName="w-32 h-32 md:w-40 md:h-40 object-cover rounded-xl bg-gray-100"
                />
              ))}
            </div>
            {/* Summary */}
            <div className="w-full lg:w-80 bg-gray-100 rounded-xl p-6 flex flex-col gap-4 shadow-md">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">Order Summary</h2>
              <div className="flex justify-between text-gray-700">
                <span>Items:</span>
                <span>{cartItems.length}</span>
              </div>
              <div className="flex justify-between text-gray-700 font-medium">
                <span>Total:</span>
                <span className="text-blue-600 font-bold text-lg">Rs {total.toLocaleString("en-PK")}</span>
              </div>
              <button
                className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <img src="/images/empty_cart.svg" alt="Empty Cart" className="w-40 mb-6 opacity-80" />
            <p className="text-lg text-gray-500 mb-2">Your cart is empty.</p>
            <a
              href="/"
              className="inline-block mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Continue Shopping
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
