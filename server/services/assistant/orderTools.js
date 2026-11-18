// Order tracking and recent order status for the shop assistant.
const Order = require("../../models/order");

const needsLogin = (tool, args) => ({
  result: {
    login_required: true,
    message: "The shopper must be logged in to check their orders. Ask them to log in.",
  },
  pendingAction: { tool, args },
});

/**
 * Look up the shopper's orders. If `query` (product name or order id) is given,
 * find matching orders; otherwise return their most recent orders.
 */
async function getMyOrders(args = {}, ctx = {}) {
  if (!ctx.userId) return needsLogin("get_my_orders", args);

  const query = typeof args.query === "string" ? args.query.trim().toLowerCase() : "";

  try {
    const orders = await Order.find({ userId: ctx.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    if (!orders || orders.length === 0) {
      return {
        result: {
          orders_count: 0,
          message: "You haven't placed any orders yet.",
        },
      };
    }

    let matched = orders;
    if (query) {
      matched = orders.filter((o) => {
        const idMatches = String(o._id).toLowerCase().includes(query);
        const itemMatches = (o.items || []).some((item) =>
          (item.name || "").toLowerCase().includes(query)
        );
        return idMatches || itemMatches;
      });

      if (!matched.length) {
        matched = orders.slice(0, 2); // Fallback to most recent
      }
    }

    const formatted = matched.map((o) => ({
      orderId: String(o._id),
      placedAt: o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently",
      status: o.orderStatus || "pending",
      paymentStatus: o.paymentStatus || "pending",
      paymentMethod: o.paymentMethod || "Cash on Delivery",
      total: o.totalPrice,
      deliveryAddress: o.shippingAddress || "",
      expectedDelivery: o.expectedDeliveryDate ? new Date(o.expectedDeliveryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null,
      items: (o.items || []).map((it) => ({
        name: it.name,
        color: it.color,
        size: it.size,
        quantity: it.quantity,
        price: it.price,
        image: it.image || "",
      })),
    }));

    return {
      result: {
        orders_count: formatted.length,
        recent_order: formatted[0] || null,
        orders: formatted,
      },
    };
  } catch (err) {
    console.error("[assistant] getMyOrders failed:", err.message);
    return { result: { error: "Could not retrieve orders right now." } };
  }
}

const definitions = [
  {
    type: "function",
    function: {
      name: "get_my_orders",
      description:
        "Check status, delivery date, and items of the shopper's recent orders or search for an order by product name or order ID. Call this whenever the shopper asks 'where is my order', 'what is the status of my order', 'my recent order', or asks about an item they bought.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Optional product name (e.g. 'Oxford shirt') or order id to look for.",
          },
        },
        required: [],
      },
    },
  },
];

const handlers = {
  get_my_orders: getMyOrders,
};

module.exports = {
  definitions,
  handlers,
  getMyOrders,
};
