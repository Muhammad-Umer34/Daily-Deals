import { formatPrice } from "@/lib/utils";
const HistoryCard = ({ order }) => {

  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const statusColors = {
    delivered: "bg-parchment border-ink/40 text-ink",
    processing: "bg-parchment border-hairline text-bark",
    returned: "bg-parchment border-oxblood/40 text-oxblood",
    pending: "bg-parchment border-hairline text-bark"
  };

  const styleClass =
    statusColors[order.orderStatus?.toLowerCase()] || "bg-parchment border-hairline text-ink";

  return (
    <div className="w-full mt-8 border-2 border-hairline rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center bg-parchment px-6 py-3">
        <div className="flex flex-wrap gap-4 font-semibold text-ink">
          <div>Order #: {order._id}</div>
          <div>Date: {date}</div>
          <div>Total: {formatPrice(order.totalPrice)}</div>
        </div>

        <div className="flex gap-4 items-center">
          <span className={`${styleClass} px-3 py-1 border rounded-3xl text-sm font-medium`}>
            {order.orderStatus}
          </span>
          <button className="text-ink font-medium underline underline-offset-4 hover:opacity-70">
            Details &gt;
          </button>
        </div>
      </div>

      {/* Items */}
      <div>
        {order.items.map((item, index) => (
          <div
            key={item._id || index}
            className="flex justify-between items-center px-6 py-3 border-t border-hairline"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-hairline">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="font-semibold text-bark">
                <p>{item.name}</p>
                <p className="text-sm text-bark">
                  {item.color} / {item.size} / {item.quantity}
                </p>
              </div>
            </div>
            <div className="font-semibold text-ink">{formatPrice(item.price)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryCard;
