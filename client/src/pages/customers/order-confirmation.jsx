import { useLocation, Link } from "react-router-dom";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";
import { CheckCircle, Package, MapPin, Phone, Calendar, CreditCard, ArrowRight } from "lucide-react";

export default function OrderConfirmation() {
  const location = useLocation();
  // The order only travels in navigation state; after a refresh it is gone, so point to Order History.
  const order = location.state?.order || null;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!order) {
    return (
      <div className="bg-paper flex items-center justify-center py-24 px-4">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-bark" strokeWidth={1} />
          <p className="text-ink text-lg mb-6 font-display font-semibold tracking-[-0.02em] text-2xl">Your orders are listed in your account.</p>
          <Link to="/home/profile" className="btn-ink">
            View Order History
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const fee = order.totalPrice - subtotal;

  return (
    <div className="bg-paper">
      <div className="relative z-10 p-6 py-12">
        <div className={`max-w-4xl mx-auto transition-all duration-1000 ${
 isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
 }`}>
          
          {/* Success Header */}
          <div className="text-center mb-12">
            <p className="note mb-3">Order Confirmed</p>
            <h1 className="display-1 text-ink mb-4">
              Thank You
            </h1>
            <p className="text-bark text-lg max-w-2xl mx-auto">
              Your order has been placed and will be prepared with care. A confirmation email is on its way.
            </p>
          </div>

          {/* Order Panel */}
          <div className="bg-parchment border-t-2 border-ink">
            
            {/* Order Header */}
            <div className="p-8 border-b border-hairline">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-semibold tracking-[-0.02em] text-2xl text-ink mb-2">Order Details</h2>
                  <div className="flex items-center gap-2 font-meta text-xs text-bark">
                    <Package className="w-4 h-4" strokeWidth={1.5} />
                    <span>Order ID: {order._id}</span>
                  </div>
                </div>
                <div className="font-meta text-xs border border-hairline bg-paper px-4 py-2 text-ink">
                  Status: {order.orderStatus || "Pending"}
                </div>
              </div>
            </div>

            <div className="p-8 bg-paper">
              {/* Order Items */}
              <div className="mb-10">
                <h3 className="note text-bark mb-6">Items Ordered</h3>
                <div className="divide-y divide-hairline border-t border-hairline">
                  {order.items.map((item, index) => (
                    <div 
                      key={item._id} 
                      className={`py-6 transition-colors duration-300 ${
 isVisible ? 'animate-fade-in-up' : ''
 }`}
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <div className="flex items-center gap-6">
                        <div className="relative shrink-0">
                          <div className="w-24 h-24 bg-parchment overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute -top-2 -right-2 bg-ink text-paper font-meta text-xs w-7 h-7 flex items-center justify-center">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-display font-semibold tracking-[-0.02em] text-xl text-ink mb-2">{item.name}</h4>
                          <div className="flex items-center gap-4 font-meta text-xs text-bark mb-2">
                            <span>Color: {item.color}</span>
                            <span>Size: {item.size}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-meta text-xs text-bark">Unit price: {formatPrice(item.price)}</span>
                            <span className="font-display font-semibold tracking-[-0.02em] text-xl text-ink">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary & Details */}
              <div className="grid lg:grid-cols-2 gap-8">
                
                {/* Order Summary */}
                <div className="bg-parchment border-t-2 border-ink p-6">
                  <h3 className="font-display font-semibold tracking-[-0.02em] text-2xl text-ink mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-hairline">
                      <span className="font-meta text-xs text-bark">Subtotal</span>
                      <span className="text-ink">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-hairline">
                      <span className="font-meta text-xs text-bark">Shipping</span>
                      <span className="text-ink">{fee ? formatPrice(fee) : "Free"}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="font-meta text-xs text-ink">Total Amount</span>
                      <span className="font-display font-semibold tracking-[-0.02em] text-2xl text-ink">{formatPrice(order.totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-parchment border-t-2 border-ink p-6">
                  <h3 className="font-display font-semibold tracking-[-0.02em] text-2xl text-ink mb-4">Delivery Information</h3>
                  <div className="space-y-4 text-ink">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-oxblood mt-1 shrink-0" strokeWidth={1.5} />
                      <div>
                        <p className="font-medium">Shipping Address</p>
                        <p className="text-sm text-bark">{order.shippingAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-oxblood shrink-0" strokeWidth={1.5} />
                      <div>
                        <p className="font-medium">Phone Number</p>
                        <p className="text-sm text-bark">{order.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-oxblood shrink-0" strokeWidth={1.5} />
                      <div>
                        <p className="font-medium">Expected Delivery</p>
                        <p className="text-sm text-bark">
                          {new Date(order.expectedDeliveryDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-oxblood shrink-0" strokeWidth={1.5} />
                      <div>
                        <p className="font-medium">Payment Method</p>
                        <p className="text-sm text-bark">{order.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/home"
                  className="btn-ink group inline-flex items-center justify-center gap-2"
                >
                  Continue Shopping
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                <button className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-paper text-ink border border-hairline text-sm font-semibold hover:border-ink transition-colors duration-300 cursor-pointer">
                  Track Order
                </button>
              </div>

              {/* Thank You */}
              <div className="mt-8 text-center p-6 border-t border-hairline">
                <p className="font-display font-semibold tracking-[-0.02em] text-xl text-bark max-w-2xl mx-auto">
                  "We appreciate your trust in us. Your order will be carefully packed and delivered with love. 
                  A confirmation email has been sent to your registered email address."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
