import * as React from "react";
import { PieChart } from "@mui/x-charts/PieChart";

const settings = {
  margin: { right: 10 },
  width: 300, 
  height: 300,
  hideLegend: true,
};

const statusColors = {
  Pending: "#FFBB28",
  Dispatched: "#0088FE",
  Delivered: "#00C49F",
  Cancelled: "#FF8042",
};

export default function DonutChart({ data = [] }) {
  const getCount = (field) => {
    const item = data.find((d) => d._id === field);
    return item ? item.totalOrders : 0;
  };

  const formatDataForChart = (orderStatusData) =>
    orderStatusData.map((item) => ({
      label: item._id,
      value: item.totalOrders,
      color: statusColors[item._id] || "#8884d8",
    }));

  const chartData = formatDataForChart(data);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="text-gray-500 text-sm text-center">
          No order data
          <br />
          available
        </div>
      </div>
    );
  }

  return (
    <div className="w-[100%] mx-auto bg-white border rounded-2xl shadow-md p-6">
      {/* Title */}
      <h2 className="text-lg font-semibold mb-4">
        Order Status - Last 30 Days
      </h2>

      <div className="flex items-center gap-10">
        {/* Donut Chart */}
        <PieChart
          series={[
            {
              innerRadius: 70,
              outerRadius: 120,
              data: chartData,
              arcLabel: "value",
            },
          ]}
          {...settings}
        />

        {/* Summary Boxes */}
        <div className="grid grid-cols-2 gap-6 flex-1">
          <div className="bg-green-50 p-6 rounded-xl shadow-sm text-center">
            <h3 className="text-green-600 font-semibold">Delivered</h3>
            <p className="text-3xl font-bold text-green-700">
              {getCount("Delivered")}
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl shadow-sm text-center">
            <h3 className="text-blue-600 font-semibold">Dispatched</h3>
            <p className="text-3xl font-bold text-blue-700">
              {getCount("Dispatched")}
            </p>
          </div>

          <div className="bg-red-50 p-6 rounded-xl shadow-sm text-center">
            <h3 className="text-red-600 font-semibold">Cancelled</h3>
            <p className="text-3xl font-bold text-red-700">
              {getCount("Cancelled")}
            </p>
          </div>

          <div className="bg-yellow-50 p-6 rounded-xl shadow-sm text-center">
            <h3 className="text-yellow-600 font-semibold">Pending</h3>
            <p className="text-3xl font-bold text-yellow-700">
              {getCount("Pending")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
