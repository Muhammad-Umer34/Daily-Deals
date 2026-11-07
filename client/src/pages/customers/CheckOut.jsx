import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BreadcrumbWithCustomSeparator } from "./breadCrumbs";
import { getCardItems, postOrder } from "../../features/customer/customerApi";
import { formatPrice, deliveryFee } from "@/lib/utils";

const PAYMENT_METHODS = ["Cash on Delivery"];
const toList = (v) => (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);

const CheckOut = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [cart, setCart] = useState(null);
  const [submitError, setSubmitError] = useState("");

  const savedAddresses = toList(user?.address);
  const [useNewAddress, setUseNewAddress] = useState(savedAddresses.length === 0);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      phoneNumber: toList(user?.phoneNumber)[0] || "",
      savedAddress: savedAddresses[0] || "",
      paymentMethod: PAYMENT_METHODS[0],
    },
  });

  useEffect(() => {
    if (!user?.id || !accessToken) return;
    getCardItems(user.id, accessToken)
      .then((items) => setCart(items || []))
      .catch(() => setCart([]));
  }, [user?.id, accessToken]);

  const items = cart || [];
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const fee = deliveryFee(subtotal);
  const total = subtotal + fee;

  const onSubmit = async (data) => {
    setSubmitError("");
    try {
      // The server rebuilds items and prices from the saved cart; we only send delivery details.
      const order = await postOrder(accessToken, {
        shippingAddress: useNewAddress ? data.newAddress : data.savedAddress,
        paymentMethod: data.paymentMethod,
        phoneNumber: data.phoneNumber,
        userName: user.name,
      });
      navigate("/home/order-confirmation", { state: { order } });
    } catch (error) {
      setSubmitError(error.response?.data?.message || "We couldn't place your order. Please try again.");
    }
  };

  const fieldClass = "w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:border-black transition-colors";

  if (cart && items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Add something to your cart before checking out.</p>
        <Link to="/home/all" className="px-6 py-3 bg-black text-white rounded-lg font-semibold">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="px-4 sm:px-6 max-w-6xl mx-auto pb-12">
        <BreadcrumbWithCustomSeparator />
        <h1 className="text-3xl font-bold mt-6 mb-8 text-gray-900">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8" noValidate>
          <div className="lg:col-span-2 space-y-6">
            <section className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <label htmlFor="phoneNumber" className="block mb-2 font-medium">Phone number</label>
              <input
                id="phoneNumber"
                type="tel"
                autoComplete="tel"
                className={fieldClass}
                placeholder="+92 300 1234567"
                {...register("phoneNumber", {
                  required: "Phone number is required",
                  pattern: { value: /^\+?[0-9\s\-()]{7,}$/, message: "Please enter a valid phone number" },
                })}
              />
              {errors.phoneNumber && <p className="text-red-600 text-sm mt-1">{errors.phoneNumber.message}</p>}
            </section>

            <section className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              {savedAddresses.length > 0 && (
                <>
                  <label htmlFor="savedAddress" className="block mb-2 font-medium">Saved address</label>
                  <select id="savedAddress" className={`${fieldClass} disabled:bg-gray-100 disabled:text-gray-400`} disabled={useNewAddress} {...register("savedAddress")}>
                    {savedAddresses.map((addr) => (
                      <option key={addr} value={addr}>{addr}</option>
                    ))}
                  </select>
                  <label className="mt-4 flex items-center gap-2 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-black"
                      checked={useNewAddress}
                      onChange={(e) => setUseNewAddress(e.target.checked)}
                    />
                    Ship to a different address
                  </label>
                </>
              )}
              {useNewAddress && (
                <div className={savedAddresses.length ? "mt-4" : ""}>
                  <label htmlFor="newAddress" className="block mb-2 font-medium">
                    {savedAddresses.length ? "New address" : "Address"}
                  </label>
                  <textarea
                    id="newAddress"
                    rows="3"
                    autoComplete="street-address"
                    className={fieldClass}
                    placeholder="House, street, area, city"
                    {...register("newAddress", { validate: (v) => !useNewAddress || !!v?.trim() || "Address is required" })}
                  />
                  {errors.newAddress && <p className="text-red-600 text-sm mt-1">{errors.newAddress.message}</p>}
                </div>
              )}
            </section>

            <section className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Payment</h2>
              {PAYMENT_METHODS.map((method) => (
                <label key={method} className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer">
                  <input type="radio" value={method} className="accent-black" {...register("paymentMethod", { required: true })} />
                  <span className="font-medium">{method}</span>
                </label>
              ))}
              <p className="text-sm text-gray-500 mt-3">Card and wallet payments are coming soon.</p>
            </section>
          </div>

          <aside className="bg-gray-50 border border-gray-200 p-6 rounded-xl h-fit">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <ul className="space-y-3 mb-6">
              {items.map((item) => (
                <li key={item._id} className="flex items-start gap-3">
                  <img src={item.image} alt="" className="w-14 h-16 object-cover rounded-md bg-gray-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-gray-500 text-xs capitalize">
                      {item.color} · {String(item.size).toUpperCase()} · Qty {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-sm whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 text-sm border-t border-gray-200 pt-4">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between">
                <dt>Delivery</dt>
                <dd>{fee ? formatPrice(fee) : <span className="text-green-700 font-medium">Free</span>}</dd>
              </div>
              {fee > 0 && <p className="text-xs text-gray-500">Free delivery on orders from Rs 2,000.</p>}
            </dl>
            <div className="flex justify-between font-bold text-lg border-t border-gray-200 mt-4 pt-4 mb-6">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            {submitError && <p role="alert" className="text-sm text-red-600 mb-3">{submitError}</p>}
            <button
              type="submit"
              disabled={isSubmitting || !cart}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors mb-3 disabled:bg-gray-400 cursor-pointer"
            >
              {isSubmitting ? "Placing order…" : "Place Order"}
            </button>
            <Link to="/customer/cart" className="block text-center text-sm font-semibold text-gray-700 hover:text-black py-2">
              ← Return to Cart
            </Link>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default CheckOut;
