import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { BreadcrumbWithCustomSeparator } from "./breadCrumbs";
import { getCardItems } from "../../features/customer/customerApi";
import { postOrder } from "../../features/customer/customerApi";
import { deleteUserCart } from "../../features/customer/customerApi";
import { increasePurcahsedCount } from "../../features/customer/customerApi";
import { postOrders } from "../../features/admin/adminApi";
const CheckOut = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await getCardItems(user.id, accessToken);
        setCart(response);
      } catch (error) {
        console.error("Failed to fetch cart items:", error);
      }
    };

    if (user?.id && accessToken) {
      fetchCartItems();
    }
  }, [user?.id, accessToken]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const savedAddresses = user?.address || [];
  const savedPayments = ["Cash on Delivery", "Mastercard ending in 8514"];

  const cartItems = cart || [];
  const [useNewAddress, setUseNewAddress] = useState(false);

  useEffect(() => {
    if (savedAddresses.length === 0) {
      setUseNewAddress(true);
    }
  }, [savedAddresses.length]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = 15.0;
  const discount = 0;
  const total = subtotal - discount + deliveryFee;

  const onSubmit = async (data) => {
    const orderData = {
      items: cartItems,
      totalPrice: total,
      shippingAddress: data.useNewAddress ? data.newAddress : data.savedAddress,
      paymentMethod: data.paymentMethod,
      phoneNumber: data.phoneNumber,
      orderStatus: "Pending",
      paymentStatus: "Pending",
      expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userId: user.id,
    };

    
    await Promise.all(
      orderData.items.map((item) =>
      {
        console.log(item);
        increasePurcahsedCount(item.productId, item.quantity);
        postOrders(item);
      }
      )
    );
    const order = await postOrder(accessToken, orderData);
    await deleteUserCart(accessToken, user.id);
    setCart([]);
    navigate("/home/order-confirmation", { state: { order: order } });
    reset();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 max-w-6xl mx-auto">
        <BreadcrumbWithCustomSeparator />

        <h2 className="text-3xl font-bold mt-8 mb-8 text-black">CHECKOUT</h2>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="border border-gray-300 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-black">
                Contact Information
              </h3>
              <div>
                <label className="block mb-2 font-medium text-black">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-black transition-colors"
                  placeholder="+92 300 1234567"
                  {...register("phoneNumber", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[\+]?[0-9\s\-\(\)]+$/,
                      message: "Please enter a valid phone number",
                    },
                  })}
                />
                {errors.phoneNumber && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>
            </div>
            <div className="border border-gray-300 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-black">
                Shipping Information
              </h3>

              <div className="mb-4">
                <label className="block mb-2 font-medium text-black">
                  Select Saved Address
                </label>
                <select
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-black transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                  disabled={useNewAddress}
                  {...register("savedAddress")}
                >
                  <option value="">Choose a saved address</option>
                  {savedAddresses.map((addr, idx) => (
                    <option key={idx} value={addr}>
                      {addr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useNewAddress"
                  className="w-4 h-4 accent-black"
                  checked={useNewAddress}
                  onChange={(e) => setUseNewAddress(e.target.checked)}
                  disabled={savedAddresses.length === 0}
                />
                <label
                  htmlFor="useNewAddress"
                  className="text-black font-medium"
                >
                  Use a new address{" "}
                  {savedAddresses.length === 0 &&
                    "(Required - No saved addresses)"}
                </label>
              </div>

              {useNewAddress && (
                <div>
                  <label className="block mb-2 font-medium text-black">
                    New Address *
                  </label>
                  <textarea
                    rows="3"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-black transition-colors"
                    placeholder="Enter your complete address..."
                    {...register("newAddress", {
                      required: useNewAddress
                        ? "New address is required"
                        : false,
                    })}
                  ></textarea>
                  {errors.newAddress && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.newAddress.message}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="border border-gray-300 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-black">
                Payment Method
              </h3>

              <div>
                <label className="block mb-2 font-medium text-black">
                  Select Payment Method *
                </label>
                <select
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-black transition-colors"
                  {...register("paymentMethod", {
                    required: "Payment method is required",
                  })}
                >
                  <option value="">Choose payment method</option>
                  {savedPayments.map((method, idx) => (
                    <option key={idx} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
                {errors.paymentMethod && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.paymentMethod.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg text-black border-2 border-gray-800 p-6 rounded-lg h-fit">
            <h3 className="text-lg font-semibold mb-6">Order Summary</h3>

            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg"
                >
                  <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={
                        item.image || item.imageUrl || "/api/placeholder/64/64"
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/api/placeholder/64/64";
                      }}
                    />
                  </div>

                  <div className="flex-grow min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-gray-600 text-xs">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-gray-600 text-xs">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    <span className="font-semibold text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-gray-300 mb-4" />

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
            </div>

            <hr className="border-gray-300 mb-4" />

            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button
              onClick={handleSubmit(onSubmit)}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors mb-4 cursor-pointer"
            >
              Place Order
            </button>

            <div className="text-center bg-white border-2 border-black p-2 rounded-lg text-black text-2xl flex justify-center cursor-pointer">
              <a
                href="/cart"
                className="text-sm text-black transition-colors font-semibold "
              >
                ← Return to Cart
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;
