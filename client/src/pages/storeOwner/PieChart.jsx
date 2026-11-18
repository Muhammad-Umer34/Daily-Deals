import * as React from "react";
import { PieChart } from "@mui/x-charts/PieChart";

const settings = {
  margin: { right: 10 },
  width: 300, 
  height: 300,
  hideLegend: true,
};

const statusColors = {
  Pending: "#d4d4d4",
  Dispatched: "#0a0a0a",
  Delivered: "#737373",
  Cancelled: "#8a3033",
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
      color: statusColors[item._id] || "#e6e6e6",
    }));

  const chartData = formatDataForChart(data);

  // Nothing to chart yet: render nothing instead of a large empty block.
  if (chartData.length === 0) return null;

  return (
    <div className="w-[100%] mx-auto bg-paper border-t-2 border-ink p-8">
      {/* Title */}
      <h2 className="font-display font-semibold tracking-[-0.02em] text-2xl text-ink mb-4">
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
          <div className="border border-hairline p-6 text-center">
            <h3 className="note text-bark">Delivered</h3>
            <p className="font-display font-semibold tracking-[-0.02em] text-4xl text-ink">
              {getCount("Delivered")}
            </p>
          </div>

          <div className="border border-hairline p-6 text-center">
            <h3 className="note text-bark">Dispatched</h3>
            <p className="font-display font-semibold tracking-[-0.02em] text-4xl text-ink">
              {getCount("Dispatched")}
            </p>
          </div>

          <div className="border border-hairline p-6 text-center">
            <h3 className="note">Cancelled</h3>
            <p className="font-display font-semibold tracking-[-0.02em] text-4xl text-ink">
              {getCount("Cancelled")}
            </p>
          </div>

          <div className="border border-hairline p-6 text-center">
            <h3 className="note text-bark">Pending</h3>
            <p className="font-display font-semibold tracking-[-0.02em] text-4xl text-ink">
              {getCount("Pending")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
