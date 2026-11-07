import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { BiSearch } from "react-icons/bi";
import { getAllOrders } from "../../features/customer/customerApi";
import HistoryCard from "./orderHistoryCard";

// Filters match the statuses the server actually sets.
const FILTERS = ["All", "Pending", "Partially Dispatched", "Dispatched"];

const OrderHistory = () => {
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllOrders(accessToken, user.id)
      .then((r) => setOrders(r || []))
      .catch(() => setOrders([]));
  }, [user.id, accessToken]);

  const q = search.trim().toLowerCase();
  const shown = (orders || []).filter(
    (o) =>
      (filter === "All" || o.orderStatus === filter) &&
      (!q || o._id.includes(q) || o.items?.some((i) => i.name?.toLowerCase().includes(q)))
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
      <div className="mt-4 mb-6 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`px-3 py-1 border rounded-full text-sm font-semibold cursor-pointer ${filter === f ? "bg-black text-white border-black" : "bg-white text-black border-gray-300"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            aria-label="Search orders"
            className="border border-gray-300 rounded-full pl-4 pr-8 py-1.5 text-sm focus:outline-none focus:border-black w-52"
          />
          <BiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
        </div>
      </div>

      {orders === null ? (
        <p className="text-gray-500 py-12 text-center">Loading your orders…</p>
      ) : shown.length ? (
        <div className="space-y-4">
          {shown.map((order) => (
            <HistoryCard key={order._id} order={order} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-600 mb-4">{orders.length ? "No orders match this filter." : "You haven't placed any orders yet."}</p>
          {!orders.length && (
            <Link to="/home/all" className="px-6 py-2.5 bg-black text-white rounded-lg font-medium">Start Shopping</Link>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
