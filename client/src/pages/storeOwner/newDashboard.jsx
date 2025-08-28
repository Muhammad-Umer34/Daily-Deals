import NewHeader from "../../components/ui/admin/newHeader";
import ApexChart from "./LineChart";
import { useSelector, useDispatch } from "react-redux";
import { uiActions } from "../../features/admin/uiSlice";
import { useEffect, useState } from "react";
import { getDashboardData } from "../../features/admin/adminApi";
import DonutChart from "./PieChart";
import { getOrders } from "../../features/admin/adminApi";
import OrderCard from "./orderCard";
import AdminFooter from "./Footer";
const DashBoard = () => {
  const dispatch = useDispatch();
  const dashboardField = useSelector((state) => state.ui.dashboardField);
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [dashboardData, setDashboardData] = useState({
    last30Days: [],
    last6Months: [],
    last12Months: [],
    last30DaysSummary: [],
    last6MonthsSummary: [],
    last12MonthsSummary: [],
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function getLast30DaysData(arr) {
    const today = new Date();
    const result = [];
    for (let i = 29; i >= 0; i--) {
      let date = new Date();
      date.setDate(today.getDate() - i);
      const formatted = date.toISOString().split("T")[0];
      const found = arr.find((item) => item._id === formatted);
      if (found) {
        result.push(found);
      } else {
        result.push({
          _id: formatted,
          totalRevenue: 0,
          totalOrders: 0,
        });
      }
    }
    return result;
  }

  function getLast6MonthsData(data) {
    const result = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const id = `${year}-${month}`;
      const found = data.find((item) => item._id === id);
      result.push(found || { _id: id, totalRevenue: 0, totalOrders: 0 });
    }
    return result;
  }

  function getLast12MonthsData(existingData) {
    const result = [];
    const today = new Date();
    const dataMap = {};
    existingData.forEach((item) => {
      dataMap[item._id] = item;
    });

    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const key = `${year}-${month.toString().padStart(2, "0")}`;

      result.push(
        dataMap[key] || { _id: key, totalRevenue: 0, totalOrders: 0 }
      );
    }
    return result;
  }

  const getCurrentData = () => {
    switch (dashboardField) {
      case "Last 30 Days":
        return dashboardData.last30Days;
      case "Last 6 Months":
        return dashboardData.last6Months;
      case "Last 1 Year":
        return dashboardData.last12Months;
      default:
        return dashboardData.last30Days;
    }
  };

  const getCurrentSummary = () => {
    switch (dashboardField) {
      case "Last 30 Days":
        return dashboardData.last30DaysSummary;
      case "Last 6 Months":
        return dashboardData.last6MonthsSummary;
      case "Last 1 Year":
        return dashboardData.last12MonthsSummary;
      default:
        return dashboardData.last30Days;
    }
  };
  const getTopFourOrders = (data) => {
     const sortedOrders = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sortedOrders.slice(0, 4);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getDashboardData(user, accessToken);
        const ordersData = await getOrders(user, accessToken);
        setOrders(getTopFourOrders(ordersData || []));
        if (!data) {
          throw new Error("No data received from API");
        }

        const { last6Months, last12Months, last30Days } = data;
        let p1 = getLast30DaysData(last30Days || []);
        let p2 = getLast6MonthsData(last6Months || []);
        let p3 = getLast12MonthsData(last12Months || []);

        setDashboardData({
          last30Days: p1,
          last6Months: p2,
          last12Months: p3,
          last30DaysSummary: data.last30DaysSummary || [],
          last6MonthsSummary: data.last6MonthsSummary || [],
          last12MonthsSummary: data.last12MonthsSummary || [],
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    if (user && accessToken) {
      fetchData();
    }
  }, [user, accessToken]);
  useEffect(() => {
    if (!dashboardField) {
      dispatch(uiActions.changeDashboardField("Last 30 Days"));
    }
  }, [dashboardField, dispatch]);

  if (loading) {
    return (
      <div>
        <NewHeader />
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <NewHeader />
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NewHeader />
      <div className="mt-10 mb-5 ml-70 mr-70 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      <div className="mt-10 mb-5 ml-70 mr-70 flex items-center gap-3">
        <button
          className="bg-gray-200 text-black rounded-sm p-2 font-bold cursor-pointer transition-colors duration-200 hover:bg-gray-300"
          style={
            dashboardField === "Last 30 Days"
              ? { backgroundColor: "black", color: "white" }
              : {}
          }
          onClick={() => {
            dispatch(uiActions.changeDashboardField("Last 30 Days"));
          }}
        >
          Last 30 Days
        </button>
        <button
          className="bg-gray-200 text-black rounded-sm p-2 font-bold cursor-pointer transition-colors duration-200 hover:bg-gray-300"
          style={
            dashboardField === "Last 6 Months"
              ? { backgroundColor: "black", color: "white" }
              : {}
          }
          onClick={() => {
            dispatch(uiActions.changeDashboardField("Last 6 Months"));
          }}
        >
          Last 6 Months
        </button>
        <button
          className="bg-gray-200 text-black rounded-sm p-2 font-bold cursor-pointer transition-colors duration-200 hover:bg-gray-300"
          style={
            dashboardField === "Last 1 Year"
              ? { backgroundColor: "black", color: "white" }
              : {}
          }
          onClick={() => {
            dispatch(uiActions.changeDashboardField("Last 1 Year"));
          }}
        >
          Last 1 Year
        </button>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ApexChart
          data={getCurrentData()}
          period={dashboardField}
          loading={loading}
        />
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DonutChart data={getCurrentSummary()} />
      </div>

      <div className="mt-10 mb-8 ml-70 mr-70 flex flex-col ">
        <h1 className="text-3xl font-bold text-gray-900">Recent Orders</h1> 
         <div className=" mt-10 grid grid-cols-5 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700 uppercase tracking-wide">
            <div>Order ID</div>
            <div>Product Name</div>
            <div>Total Amount</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
           <div className="divide-y divide-gray-200">
            {orders.length > 0 ? (
              orders.map((order) => (
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
      <AdminFooter />
    </div>
  );
};

export default DashBoard;
