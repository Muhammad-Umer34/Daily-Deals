import { useParams } from "react-router-dom";
import NewHeader from "../../components/ui/admin/newHeader";
import { uiActions } from "../../features/admin/uiSlice";
import { useSelector, useDispatch } from "react-redux";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getOrderDetails } from "../../features/admin/adminApi";
import { useEffect, useState } from "react";
import OrderDetailCard from "./orderDetailsCard";
import { dispatchOrder } from "../../features/admin/adminApi";
import AdminFooter from "./Footer";

const OrderDetails = () => {
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [date, setDate] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hanldeDispatchOrder = async(orderID)=>{
      await dispatchOrder(orderID,user,accessToken);
      navigate(-1);
  }

  useEffect(() => {
    dispatch(uiActions.changeField(""));

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getOrderDetails(id, user, accessToken);
        if (response) {
          setOrderDetails(response);

          if (response.createdAt) {
            setDate(
              new Date(response.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            );
          }

          if (response.expectedDeliveryDate) {
            setExpectedDelivery(
              new Date(response.expectedDeliveryDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            );
          }
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, user, accessToken, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NewHeader />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NewHeader />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-lg font-medium text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NewHeader />
        <div className="flex justify-center items-center h-64">
          <p className="text-lg font-medium text-gray-700">No order details found</p>
        </div>
      </div>
    );
  }
  const subtotal = orderDetails.totalPrice
    ? Math.max(0, orderDetails.totalPrice - 15).toFixed(2)
    : "0.00";

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <NewHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => {
              dispatch(uiActions.changeField("Order"));
              navigate(-1);
            }}
            className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
          >
            <FaArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Order Details</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">
                  Order Information
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Order ID:</span>
                    <span className="text-sm text-gray-900 font-mono">{orderDetails._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Order Date:</span>
                    <span className="text-sm text-gray-900">{date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Expected Delivery:</span>
                    <span className="text-sm text-gray-900">{expectedDelivery || "Not available"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Order Status:</span>
                    <span className={`text-sm px-2 py-1 rounded-full text-xs font-medium ${
                      orderDetails.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                      orderDetails.orderStatus === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      orderDetails.orderStatus === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {orderDetails.orderStatus || "Pending"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Payment Method:</span>
                    <span className="text-sm text-gray-900">{orderDetails.paymentMethod || "Cash on Delivery"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Payment Status:</span>
                    <span className={`text-sm px-2 py-1 rounded-full text-xs font-medium ${
                      orderDetails.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {orderDetails.paymentStatus || "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">
                  Customer Information
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Name:</span>
                    <span className="text-sm text-gray-900">{orderDetails.userName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <span className="text-sm text-gray-900 break-all">{orderDetails.userEmail || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Phone:</span>
                    <span className="text-sm text-gray-900">{orderDetails.phoneNumber || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 block mb-1">Shipping Address:</span>
                    <span className="text-sm text-gray-900">{orderDetails.shippingAddress || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 block mb-1">Billing Address:</span>
                    <span className="text-sm text-gray-900">{orderDetails.billingAddress || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Subtotal:</span>
                  <span className="text-sm font-medium text-gray-900">Rs. {subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Shipping Cost:</span>
                  <span className="text-sm font-medium text-gray-900">Rs. 15.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Discount:</span>
                  <span className="text-sm font-medium text-gray-900">Rs. 0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">GST:</span>
                  <span className="text-sm font-medium text-gray-900">0%</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900">Total:</span>
                    <span className="text-base font-semibold text-gray-900">
                      Rs. {orderDetails.totalPrice?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
                {orderDetails.orderStatus !== 'Delivered' && orderDetails.orderStatus !== 'Cancelled' && (
                  <button className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  onClick={()=>{hanldeDispatchOrder(orderDetails._id)}}
                  >
                    Dispatch Order
                  </button>
                )}
              </div>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Image</div>
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Product Name</div>
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Quantity</div>
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Unit Price</div>
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Color</div>
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Total</div>
                </div>
                <div className="divide-y divide-gray-200">
                  {orderDetails.items && orderDetails.items.length > 0 ? (
                    orderDetails.items.map((order, index) => (
                      <OrderDetailCard key={order._id || index} order={order} />
                    ))
                  ) : (
                    <div className="px-6 py-12 text-center text-gray-500">
                      <div className="text-lg font-medium">No items found</div>
                      <div className="text-sm mt-1">This order appears to have no items</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AdminFooter />
    </div>
  );
};

export default OrderDetails;