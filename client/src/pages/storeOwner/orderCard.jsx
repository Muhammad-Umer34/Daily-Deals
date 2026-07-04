import { IoEyeOutline } from "react-icons/io5";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const OrderCard = ({ order }) => {
  const navigate = useNavigate();
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${(amount || 0).toLocaleString('en-PK')}`;
  };

  const formatOrderId = (id) => {
    return id ? `#${id.slice(-8).toUpperCase()}` : 'N/A';
  };

  return (
    <div className="grid grid-cols-5 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
      <div className="text-sm font-medium text-gray-900">
        {formatOrderId(order._id)}
      </div>

      <div className="text-sm text-gray-900">
        <div className="font-medium">{order.productName || order.customer?.name || 'Unknown Customer'}</div>
        {order.customer?.email && (
          <div className="text-xs text-gray-500 mt-1">{order.customer.email}</div>
        )}
      </div>

      <div className="text-sm font-medium text-gray-900">
        {formatCurrency(order.totalAmount || order.total || order.price)}
      </div>
      <div>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
          {order.status || 'Pending'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button 
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors cursor-pointer"
          onClick={() => {
            console.log(navigate(`/store/order/${order.parentOrderId}`));
          }}
        >
          <IoEyeOutline className="w-3 h-3 " />
          View
        </button>
      </div>
    </div>
  );
};

export default OrderCard;