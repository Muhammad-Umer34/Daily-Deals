import { useParams } from "react-router-dom";
import { formatPrice } from "@/lib/utils";
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
      <div className="min-h-screen bg-paper">
        <NewHeader />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-oxblood mx-auto mb-4"></div>
            <p className="font-display font-semibold tracking-[-0.02em] text-2xl text-bark">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-paper">
        <NewHeader />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="font-display font-semibold tracking-[-0.02em] text-2xl text-oxblood mb-4">Error: {error}</p>
            <button 
              onClick={() => navigate(-1)}
              className="btn-ink"
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
      <div className="min-h-screen bg-paper">
        <NewHeader />
        <div className="flex justify-center items-center h-64">
          <p className="font-display font-semibold tracking-[-0.02em] text-2xl text-bark">No order details found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <NewHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => {
              dispatch(uiActions.changeField("Order"));
              navigate(-1);
            }}
            className="flex items-center justify-center w-10 h-10 bg-paper border border-hairline hover:border-ink/40 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 text-bark" />
          </button>
          <h1 className="display-2 text-ink">Order Details</h1>
        </div>

        <div className="border-t-2 border-ink pt-8">
          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="font-display font-semibold tracking-[-0.02em] text-2xl text-ink border-b border-hairline pb-2">
                  Order Information
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="note text-bark">Order ID:</span>
                    <span className="text-sm text-ink font-meta">{orderDetails._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="note text-bark">Order Date:</span>
                    <span className="text-sm text-ink">{date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="note text-bark">Expected Delivery:</span>
                    <span className="text-sm text-ink">{expectedDelivery || "Not available"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="note text-bark">Order Status:</span>
                    <span className={`text-sm px-2 py-1 note ${
 orderDetails.orderStatus === 'Delivered' ? 'bg-ink text-paper' :
 orderDetails.orderStatus === 'Processing' ? 'border border-ink/40 text-ink' :
 orderDetails.orderStatus === 'Shipped' ? 'border border-ink/40 text-ink' :
 'border border-hairline text-bark'
 }`}>
                      {orderDetails.orderStatus || "Pending"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="note text-bark">Payment Method:</span>
                    <span className="text-sm text-ink">{orderDetails.paymentMethod || "Cash on Delivery"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="note text-bark">Payment Status:</span>
                    <span className={`text-sm px-2 py-1 note ${
 orderDetails.paymentStatus === 'Paid' ? 'bg-ink text-paper' :
 'border border-oxblood/40 text-oxblood'
 }`}>
                      {orderDetails.paymentStatus || "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="font-display font-semibold tracking-[-0.02em] text-2xl text-ink border-b border-hairline pb-2">
                  Customer Information
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="note text-bark">Name:</span>
                    <span className="text-sm text-ink">{orderDetails.userName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="note text-bark">Email:</span>
                    <span className="text-sm text-ink break-all">{orderDetails.userEmail || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="note text-bark">Phone:</span>
                    <span className="text-sm text-ink">{orderDetails.phoneNumber || "N/A"}</span>
                  </div>
                  <div>
                    <span className="note text-bark block mb-1">Shipping Address:</span>
                    <span className="text-sm text-ink">{orderDetails.shippingAddress || "N/A"}</span>
                  </div>
                  <div>
                    <span className="note text-bark block mb-1">Billing Address:</span>
                    <span className="text-sm text-ink">{orderDetails.billingAddress || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-parchment p-6">
              <h2 className="font-display font-semibold tracking-[-0.02em] text-2xl text-ink mb-4">Financial Summary</h2>
              {/* The server sends only this store's lines and their total; delivery is charged to the customer, not the seller. */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-bark">Items from your store</span>
                  <span className="text-sm font-medium text-ink">
                    {orderDetails.items?.reduce((n, i) => n + (i.quantity || 0), 0) || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-bark">Payment</span>
                  <span className="text-sm font-medium text-ink">{orderDetails.paymentMethod || "Cash on Delivery"}</span>
                </div>
                <div className="border-t border-hairline pt-3">
                  <div className="flex justify-between font-display font-semibold tracking-[-0.02em] text-2xl text-ink">
                    <span>Your total</span>
                    <span>{formatPrice(orderDetails.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-display font-semibold tracking-[-0.02em] text-2xl text-ink">Order Items</h2>
                {orderDetails.orderStatus !== 'Delivered' && orderDetails.orderStatus !== 'Cancelled' && (
                  <button className="btn-ink !px-5 !py-2"
                  onClick={()=>{hanldeDispatchOrder(orderDetails._id)}}
                  >
                    Dispatch Order
                  </button>
                )}
              </div>
              <div className="bg-paper border-t-2 border-ink overflow-hidden">
                <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-parchment border-b border-hairline">
                  <div className="note text-bark">Image</div>
                  <div className="note text-bark">Product Name</div>
                  <div className="note text-bark">Quantity</div>
                  <div className="note text-bark">Unit Price</div>
                  <div className="note text-bark">Color</div>
                  <div className="note text-bark">Total</div>
                </div>
                <div className="divide-y divide-hairline">
                  {orderDetails.items && orderDetails.items.length > 0 ? (
                    orderDetails.items.map((order, index) => (
                      <OrderDetailCard key={order._id || index} order={order} />
                    ))
                  ) : (
                    <div className="px-6 py-12 text-center text-bark">
                      <div className="font-display font-semibold tracking-[-0.02em] text-2xl">No items found</div>
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