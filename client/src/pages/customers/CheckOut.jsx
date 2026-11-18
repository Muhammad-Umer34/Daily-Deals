import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BreadcrumbWithCustomSeparator } from "./breadCrumbs";
import { getCardItems, postOrder } from "../../features/customer/customerApi";
import { cartActions } from "../../features/customer/cartSlice";
import { formatPrice, deliveryFee, FREE_DELIVERY_FROM } from "@/lib/utils";

const PAYMENT_METHODS = ["Cash on Delivery"];
const toList = (v) => (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);

const CheckOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
      .then((items) => {
        const list = items || [];
        setCart(list);
        dispatch(cartActions.setItems(list.map((i) => ({ ...i, id: i._id }))));
      })
      .catch(() => setCart([]));
  }, [user?.id, accessToken, dispatch]);

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
      dispatch(cartActions.clearCart());
      navigate("/home/order-confirmation", { state: { order } });
    } catch (error) {
      setSubmitError(error.response?.data?.message || "We couldn't place your order. Please try again.");
    }
  };

  const fieldClass = "w-full bg-paper border border-hairline p-3 focus:outline-none focus:border-ink transition-colors";

  if (cart && items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <p className="note mb-3">Checkout</p>
        <h1 className="display-2 mb-2">Your cart is empty</h1>
        <p className="text-bark mb-8">Add something to your cart before checking out.</p>
        <Link to="/home/all" className="btn-ink">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="bg-paper">
      <div className="px-4 sm:px-6 max-w-6xl mx-auto pb-16">
        <BreadcrumbWithCustomSeparator />
        <h1 className="display-1 mt-6 mb-10 text-ink">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8" noValidate>
          <div className="lg:col-span-2 space-y-8">
            <section className="border-t-2 border-ink pt-6">
              <p className="note mb-2">01</p>
              <h2 className="font-display font-semibold tracking-[-0.02em] text-2xl mb-5">Contact Information</h2>
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
              {errors.phoneNumber && <p className="text-oxblood text-sm mt-1">{errors.phoneNumber.message}</p>}
            </section>

            <section className="border-t-2 border-ink pt-6">
              <p className="note mb-2">02</p>
              <h2 className="font-display font-semibold tracking-[-0.02em] text-2xl mb-5">Shipping Address</h2>
              {savedAddresses.length > 0 && (
                <>
                  <label htmlFor="savedAddress" className="block mb-2 font-medium">Saved address</label>
                  <select id="savedAddress" className={`${fieldClass} disabled:bg-parchment disabled:text-bark/60`} disabled={useNewAddress} {...register("savedAddress")}>
                    {savedAddresses.map((addr) => (
                      <option key={addr} value={addr}>{addr}</option>
                    ))}
                  </select>
                  <label className="mt-4 flex items-center gap-2 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-oxblood"
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
                  {errors.newAddress && <p className="text-oxblood text-sm mt-1">{errors.newAddress.message}</p>}
                </div>
              )}
            </section>

            <section className="border-t-2 border-ink pt-6">
              <p className="note mb-2">03</p>
              <h2 className="font-display font-semibold tracking-[-0.02em] text-2xl mb-5">Payment</h2>
              {PAYMENT_METHODS.map((method) => (
                <label key={method} className="flex items-center gap-3 p-3 border border-hairline cursor-pointer hover:border-ink/40 transition-colors">
                  <input type="radio" value={method} className="accent-oxblood" {...register("paymentMethod", { required: true })} />
                  <span className="font-medium">{method}</span>
                </label>
              ))}
              <p className="text-sm text-bark mt-3">Card and wallet payments are coming soon.</p>
            </section>
          </div>

          <aside className="bg-parchment border-t-2 border-ink p-6 lg:p-8 h-fit lg:sticky lg:top-24">
            <h2 className="font-display font-semibold tracking-[-0.02em] text-2xl mb-6">Order Summary</h2>
            <ul className="space-y-3 mb-6">
              {items.map((item) => (
                <li key={item._id} className="flex items-start gap-3">
                  <img src={item.image} alt="" width={56} height={64} className="w-14 h-16 object-cover bg-parchment shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-bark font-meta text-xs capitalize">
                      {item.color} · {String(item.size).toUpperCase()} · Qty {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-sm whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 text-sm border-t border-hairline pt-4">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between">
                <dt>Delivery</dt>
                <dd>{fee ? formatPrice(fee) : <span className="text-ink font-semibold">Free</span>}</dd>
              </div>
              {fee > 0 && <p className="text-xs text-bark">Free delivery on orders from {formatPrice(FREE_DELIVERY_FROM)}.</p>}
            </dl>
            <div className="flex justify-between font-display font-semibold tracking-[-0.02em] text-2xl border-t border-hairline mt-4 pt-4 mb-6">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            {submitError && <p role="alert" className="text-sm text-oxblood mb-3">{submitError}</p>}
            <button
              type="submit"
              disabled={isSubmitting || !cart}
              className="btn-ink w-full mb-3 disabled:bg-bark/40 disabled:border-bark/40 cursor-pointer"
            >
              {isSubmitting ? "Placing order…" : "Place Order"}
            </button>
            <Link to="/customer/cart" className="link-draw block text-center font-meta text-xs text-bark hover:text-ink py-2">
              ← Return to Cart
            </Link>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default CheckOut;
