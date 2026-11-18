import { IoEyeOutline } from "react-icons/io5";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "@/lib/utils";

const OrderCard = ({ order }) => {
  const navigate = useNavigate();
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'border border-hairline text-bark';
      case 'processing':
        return 'border border-ink/40 text-ink';
      case 'shipped':
        return 'border border-ink/40 text-ink';
      case 'delivered':
        return 'bg-ink text-paper';
      case 'cancelled':
        return 'border border-oxblood/40 text-oxblood';
      default:
        return 'border border-hairline text-bark';
    }
  };

  const formatCurrency = formatPrice;

  const formatOrderId = (id) => {
    return id ? `#${id.slice(-8).toUpperCase()}` : 'N/A';
  };

  return (
    <div className="grid grid-cols-5 gap-4 px-6 py-4 items-center hover:bg-parchment transition-colors">
      <div className="font-meta text-sm text-ink">
        {formatOrderId(order._id)}
      </div>

      <div className="text-sm text-ink">
        <div className="font-medium">{order.productName || order.customer?.name || 'Unknown Customer'}</div>
        {order.customer?.email && (
          <div className="text-xs text-bark mt-1">{order.customer.email}</div>
        )}
      </div>

      <div className="font-display font-semibold tracking-[-0.02em] text-lg text-ink">
        {formatCurrency(order.totalAmount || order.total || order.price)}
      </div>
      <div>
        <span className={`inline-flex px-2 py-1 note ${getStatusColor(order.status)}`}>
          {order.status || 'Pending'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button 
          className="inline-flex items-center gap-1 px-3 py-1.5 note link-draw text-ink hover:text-ink transition-colors cursor-pointer"
          onClick={() => {
            console.log(navigate(`/store/order/${order.parentOrderId}`));
          }}
        >
          <IoEyeOutline className="w-3 h-3" />
          View
        </button>
      </div>
    </div>
  );
};

export default OrderCard;