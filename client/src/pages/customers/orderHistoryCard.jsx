const HistoryCard = ({ order }) => {

  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const statusColors = {
    delivered: "bg-green-100 border-green-300 text-green-700",
    processing: "bg-yellow-100 border-yellow-300 text-yellow-700",
    returned: "bg-red-100 border-red-300 text-red-700",
    pending: "bg-yellow-100 border-yellow-300 text-yellow-700"
  };

  const styleClass =
    statusColors[order.orderStatus?.toLowerCase()] || "bg-gray-100 border-gray-300 text-gray-700";

  return (
    <div className="w-full mt-8 border-2 border-gray-300 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-100 px-6 py-3">
        <div className="flex flex-wrap gap-4 font-semibold text-gray-700">
          <div>Order #: {order._id}</div>
          <div>Date: {date}</div>
          <div>Total: Rs. {order.totalPrice}</div>
        </div>

        <div className="flex gap-4 items-center">
          <span className={`${styleClass} px-3 py-1 border rounded-3xl text-sm font-medium`}>
            {order.orderStatus}
          </span>
          <button className="text-blue-600 font-medium hover:underline">
            Details &gt;
          </button>
        </div>
      </div>

      {/* Items */}
      <div>
        {order.items.map((item, index) => (
          <div
            key={item._id || index}
            className="flex justify-between items-center px-6 py-3 border-t border-gray-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-300">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="font-semibold text-gray-600">
                <h1>{item.name}</h1>
                <p className="text-sm text-gray-500">
                  {item.color} / {item.size} / {item.quantity}
                </p>
              </div>
            </div>
            <div className="font-semibold text-black">Rs. {item.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryCard;
