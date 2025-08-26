import { useNavigate } from "react-router-dom";

const OrderDetailCard = ({ order }) => {
  const navigate = useNavigate();
  const unitPrice = order.quantity > 0 ? (order.price / order.quantity).toFixed(2) : "0.00";

  return (
    <div className="grid grid-cols-6 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
      <div className="flex justify-center">
        {order.image ? (
          <img 
            src={order.image} 
            alt={order.name || "Product"} 
            className="w-12 h-12 object-cover rounded-lg border border-gray-200"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 text-xs"
          style={{ display: order.image ? 'none' : 'flex' }}
        >
          No Image
        </div>
      </div>

      <div className="text-sm text-gray-900">
        <div className="font-medium line-clamp-2">{order.name || "Unnamed Product"}</div>
      </div>

      <div className="text-sm font-medium text-gray-900 text-center">
        {order.quantity || 0}
      </div>
      <div className="text-sm font-medium text-gray-900">
        ${unitPrice}
      </div>
      <div className="text-sm text-gray-600">
        {order.color || "N/A"}
      </div>
      <div className="text-sm font-medium text-gray-900">
        ${order.price?.toFixed(2) || "0.00"}
      </div>
    </div>
  );
};

export default OrderDetailCard;