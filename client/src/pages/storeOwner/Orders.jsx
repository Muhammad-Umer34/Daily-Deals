import NewHeader from "../../components/ui/admin/newHeader";
import { BiSearch } from "react-icons/bi";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { storeOwnerProductsActions } from "../../features/admin/myProductsSlice";
import { getOrders } from "../../features/admin/adminApi";
import SortDropdown from "./dropdown";
import OrderCard from "./orderCard";
import AdminFooter from "./Footer";

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
  <div className="flex flex-col min-h-screen bg-paper">
    {/* Header */}
    <NewHeader />

    {/* Main Content */}
    <main className="flex-grow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-10 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="display-2 text-ink">Manage Orders</h1>
          
          <div className="flex gap-3 items-center">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Search orders..."
                className="bg-paper border border-hairline pl-4 pr-10 py-2 text-sm
 focus:outline-none focus:border-ink
 transition-colors w-64"
              />
              <BiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-bark" />
            </div>
       
          </div>
        </div>

        <div className="border-t-2 border-ink">
          {/* Table Header */}
          <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-parchment border-b border-hairline note text-bark">
            <div>Order ID</div>
            <div>Product Name</div>
            <div>Total Amount</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-hairline">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))
            ) : (
              <div className="px-6 py-12 text-center text-bark">
                <div className="font-display font-semibold tracking-[-0.02em] text-2xl">No orders found</div>
                <div className="text-sm mt-1">
                  {search ? "Try adjusting your search criteria" : "Orders will appear here when available"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>

    {/* Footer */}
    <AdminFooter className="w-full"/>
  </div>
);

};

export default Order;
