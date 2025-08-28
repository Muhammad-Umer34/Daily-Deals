import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";

const ApexChart = ({ data = [], period = "Last 30 Days", loading = false }) => {
  const [chartState, setChartState] = useState({
    series: [],
    options: {}
  });

  // Format data for chart
  const formatDataForChart = (rawData, selectedPeriod) => {
    if (!rawData || rawData.length === 0) {
      return {
        categories: [],
        revenueData: [],
        ordersData: []
      };
    }

    let categories = [];
    const revenueData = rawData.map(item => item.totalRevenue || 0);
    const ordersData = rawData.map(item => item.totalOrders || 0);

    // Format categories based on period
    if (selectedPeriod === "Last 30 Days") {
      categories = rawData.map(item => {
        const date = new Date(item._id);
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      });
    } else {
      // For months (6 months or 1 year)
      categories = rawData.map(item => {
        const [year, month] = item._id.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          year: selectedPeriod === "Last 1 Year" ? 'numeric' : undefined 
        });
      });
    }

    return { categories, revenueData, ordersData };
  };

  // Get chart title based on period
  const getChartTitle = (selectedPeriod) => {
    switch (selectedPeriod) {
      case "Last 30 Days":
        return "Revenue & Orders - Last 30 Days";
      case "Last 6 Months":
        return "Revenue & Orders - Last 6 Months";
      case "Last 1 Year":
        return "Revenue & Orders - Last 12 Months";
      default:
        return "Revenue & Orders Overview";
    }
  };

  // Update chart when data or period changes
  useEffect(() => {
    const { categories, revenueData, ordersData } = formatDataForChart(data, period);
    
    const newState = {
      series: [
        {
          name: "Revenue",
          type: "column",
          data: revenueData,
        },
        {
          name: "Orders",
          type: "line",
          data: ordersData,
        },
      ],
      options: {
        chart: {
          height: 350,
          type: "line",
          zoom: { enabled: false },
          toolbar: {
            show: true,
            tools: {
              download: true,
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true
            }
          }
        },
        colors: ['#008FFB', '#00E396'],
        dataLabels: { 
          enabled: false 
        },
        stroke: { 
          width: [0, 4],
          curve: "smooth" 
        },
        title: {
          text: getChartTitle(period),
          align: "left",
          style: {
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#333'
          }
        },
        grid: {
          row: {
            colors: ["#f3f3f3", "transparent"],
            opacity: 0.5,
          },
        },
        xaxis: {
          categories: categories,
          labels: {
            style: {
              fontSize: '12px'
            }
          }
        },
        yaxis: [
          {
            title: {
              text: "Revenue ($)",
              style: {
                color: '#008FFB',
                fontSize: '14px'
              }
            },
            labels: {
              formatter: function (val) {
                return val ? `$${val.toLocaleString()}` : '$0';
              }
            }
          },
          {
            opposite: true,
            title: {
              text: "Orders",
              style: {
                color: '#00E396',
                fontSize: '14px'
              }
            },
            labels: {
              formatter: function (val) {
                return val ? val.toString() : '0';
              }
            }
          }
        ],
        tooltip: {
          shared: true,
          intersect: false,
          y: [
            {
              formatter: function (y) {
                return y ? `$${y.toLocaleString()}` : '$0';
              }
            },
            {
              formatter: function (y) {
                return y ? `${y} orders` : '0 orders';
              }
            }
          ]
        },
        legend: {
          show: true,
          position: 'top',
          horizontalAlign: 'right'
        },
        plotOptions: {
          bar: {
            borderRadius: 4,
            columnWidth: '50%'
          }
        },
        fill: {
          type: ['solid', 'gradient'],
          gradient: {
            shade: 'light',
            type: "horizontal",
            shadeIntensity: 0.25,
            gradientToColors: undefined,
            inverseColors: true,
            opacityFrom: 0.85,
            opacityTo: 0.85,
          }
        }
      },
    };

    setChartState(newState);
  }, [data, period]);
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-2">No Data Available</div>
          <div className="text-gray-400 text-sm">
            No orders found for the selected time period
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <ReactApexChart
        options={chartState.options}
        series={chartState.series}
        type="line"
        height={350}
      />
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-blue-600 text-sm font-medium">Total Revenue</div>
          <div className="text-2xl font-bold text-blue-800">
            ${data.reduce((sum, item) => sum + (item.totalRevenue || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-green-600 text-sm font-medium">Total Orders</div>
          <div className="text-2xl font-bold text-green-800">
            {data.reduce((sum, item) => sum + (item.totalOrders || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-purple-600 text-sm font-medium">Average Order Value</div>
          <div className="text-2xl font-bold text-purple-800">
            ${(() => {
              const totalRevenue = data.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
              const totalOrders = data.reduce((sum, item) => sum + (item.totalOrders || 0), 0);
              return totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00';
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApexChart;