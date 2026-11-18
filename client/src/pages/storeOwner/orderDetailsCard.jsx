import { useNavigate } from "react-router-dom";
import { formatPrice } from "@/lib/utils";

const OrderDetailCard = ({ order }) => {
  const navigate = useNavigate();
  const unitPrice = order.quantity > 0 ? (order.price / order.quantity).toFixed(2) : "0.00";

  return (
    <div className="grid grid-cols-6 gap-4 px-6 py-4 items-center hover:bg-parchment transition-colors">
      <div className="flex justify-center">
        {order.image ? (
          <img 
            src={order.image} 
            alt={order.name || "Product"} 
            className="w-12 h-12 object-cover border border-hairline"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="w-12 h-12 bg-parchment border border-hairline flex items-center justify-center text-bark note"
          style={{ display: order.image ? 'none' : 'flex' }}
        >
          No Image
        </div>
      </div>

      <div className="text-sm text-ink">
        <div className="font-medium line-clamp-2">{order.name || "Unnamed Product"}</div>
      </div>

      <div className="font-meta text-sm text-ink text-center">
        {order.quantity || 0}
      </div>
      <div className="font-meta text-sm text-ink">
        {formatPrice(unitPrice)}
      </div>
      <div className="text-sm text-bark">
        {order.color || "N/A"}
      </div>
      <div className="font-meta text-sm text-ink">
        {formatPrice(order.price)}
      </div>
    </div>
  );
};

export default OrderDetailCard;