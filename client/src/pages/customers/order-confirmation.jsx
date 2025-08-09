import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { CheckCircle, Package, MapPin, Phone, Calendar, CreditCard, ArrowRight } from "lucide-react";

export default function OrderConfirmation() {
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (location.state?.order) {
      setOrder(location.state.order);
    } else {
      console.error("No order data found. Redirect user or fetch by ID.");
    }
    setTimeout(() => setIsVisible(true), 100);
  }, [location.state]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-800 text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative z-10 p-6 py-12">
        <div className={`max-w-4xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-black rounded-full animate-bounce mb-6">
              <CheckCircle className="w-12 h-12 text-white " />
            </div>
            <h1 className="text-5xl font-bold text-black mb-4">
              Order Confirmed!
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Thank you for choosing us! Your order has been successfully placed and will be processed shortly.
            </p>
          </div>

          {/* Order Card */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
            
            {/* Order Header */}
            <div className="bg-black text-white p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Order Details</h2>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Package className="w-5 h-5" />
                    <span>Order ID: {order._id}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-white/10 px-4 py-2 rounded-full">
                    <span className="text-sm font-semibold">Status: Pending</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Order Items */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
                  <Package className="w-6 h-6 text-black" />
                  Items Ordered
                </h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div 
                      key={item._id} 
                      className={`bg-gray-50 p-6 rounded-2xl border border-gray-200 transition-all duration-300 transform hover:scale-[1.02] ${
                        isVisible ? 'animate-fade-in-up' : ''
                      }`}
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-xl shadow"
                          />
                          <div className="absolute -top-2 -right-2 bg-black text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-bold text-lg text-black mb-2">{item.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <span className="bg-white px-3 py-1 rounded-full border">Color: {item.color}</span>
                            <span className="bg-white px-3 py-1 rounded-full border">Size: {item.size}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Unit Price: Rs {item.price.toLocaleString()}</span>
                            <span className="text-xl font-bold text-black">
                              Rs {(item.price * item.quantity).toLocaleString()}
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
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-black" />
                    Order Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">Rs {(order.totalPrice - 15).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-semibold">Rs 15</span>
                    </div>
                    <div className="flex justify-between items-center py-3 bg-gray-100 px-4 rounded-xl">
                      <span className="font-bold text-lg">Total Amount</span>
                      <span className="font-bold text-2xl text-black">Rs {order.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <h3 className="text-xl font-bold text-black mb-4">Delivery Information</h3>
                  <div className="space-y-4 text-gray-800">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-black mt-1" />
                      <div>
                        <p className="font-medium">Shipping Address</p>
                        <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-black" />
                      <div>
                        <p className="font-medium">Phone Number</p>
                        <p className="text-sm text-gray-600">{order.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-black" />
                      <div>
                        <p className="font-medium">Expected Delivery</p>
                        <p className="text-sm text-gray-600">
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
                      <CreditCard className="w-5 h-5 text-black" />
                      <div>
                        <p className="font-medium">Payment Method</p>
                        <p className="text-sm text-gray-600">{order.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/home"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-black text-white rounded-2xl font-semibold hover:bg-gray-900 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Continue Shopping
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black border-2 border-black rounded-2xl font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200">
                  Track Order
                </button>
              </div>

              {/* Thank You */}
              <div className="mt-8 text-center p-6 border bg-green-100 border-green-300 text-green-700 rounded-2xl border border-gray-200">
                <p className="text-gray-700 italic">
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
