import NewHeader from "../../components/ui/admin/newHeader";
import { BiSearch } from "react-icons/bi";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { storeOwnerProductsActions } from "../../features/admin/myProductsSlice";
import { getOrders } from "../../features/admin/adminApi";
import SortDropdown from "./dropdown";
import OrderCard from "./orderCard";

const Order = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.storeOwnerProducts.orders || []);
  const filteredProducts = useSelector((state) => state.storeOwnerProducts.filteredOrders || []);
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    
    if (value === "") {
      dispatch(storeOwnerProductsActions.filterOrders(products));
    } else {
      const searchValue = value.toLowerCase();
      const filtered = products.filter((order) =>
        order._id?.toLowerCase().includes(searchValue) ||
        order.customerName?.toLowerCase().includes(searchValue) ||
        order.productName?.toLowerCase().includes(searchValue) ||
        order.status?.toLowerCase().includes(searchValue)
      );
      dispatch(storeOwnerProductsActions.filterOrders(filtered));
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await getOrders(user, accessToken);
      dispatch(storeOwnerProductsActions.setOrders(data));
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user, accessToken]);

  return (
    <div className="min-h-screen bg-gray-50">
      <NewHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-10 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
          
          <div className="flex gap-3 items-center">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Search orders..."
                className="border border-gray-300 rounded-full pl-4 pr-10 py-2 text-sm
                focus:outline-none focus:border-blue-500 focus:shadow-md
                transition-all duration-300 w-64"
              />
              <BiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
            <SortDropdown />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700 uppercase tracking-wide">
            <div>Order ID</div>
            <div>Product Name</div>
            <div>Total Amount</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                <div className="text-lg font-medium">No orders found</div>
                <div className="text-sm mt-1">
                  {search ? "Try adjusting your search criteria" : "Orders will appear here when available"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
