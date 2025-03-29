import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "chartjs-adapter-date-fns"; // For date handling in Chart.js
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaLightbulb,
} from "react-icons/fa";
import { Link } from "react-router-dom";

// Register Chart.js components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [displayCurrency, setDisplayCurrency] = useState("INR");
  const [stockData, setStockData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchStockData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:5000/api/dashboard", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError(
        "Failed to fetch dashboard data: " +
          (err.response?.data?.error || err.message)
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Mock function to fetch stock data (replace with real API in production)
  const fetchStockData = async () => {
    // In production, use an API like Alpha Vantage or Finnhub
    // For now, we'll use static data to simulate IBM and AAPL stock prices
    const mockStockData = {
      IBM: {
        price: 6586, // Mock price in INR
        changePercent: -0.45, // Mock percentage change
      },
      AAPL: {
        price: 217, // Mock price in INR
        changePercent: 0.72, // Mock percentage change
      },
    };
    setStockData(mockStockData);
  };

  // Currency symbols mapping
  const currencySymbols = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };

  // Simplified conversion rates (for demo purposes; in production, fetch from API)
  const convertAmount = (amount) => {
    const rates = {
      INR: 1,
      USD: 0.0122, // 1 INR ≈ 0.0122 USD (approx.)
      EUR: 0.011, // 1 INR ≈ 0.011 EUR (approx.)
      GBP: 0.0095, // 1 INR ≈ 0.0095 GBP (approx.)
    };
    return (amount * rates[displayCurrency]).toFixed(2);
  };

  // Prepare chart data with black-purple theme
  const chartData = dashboardData?.monthlyData
    ? {
        labels: dashboardData.monthlyData.map((data) => data.month),
        datasets: [
          {
            label: "Income",
            data: dashboardData.monthlyData.map((data) =>
              convertAmount(data.income)
            ),
            fill: true,
            backgroundColor: "rgba(147, 51, 234, 0.4)", // Purple shade for income
            borderColor: "rgba(147, 51, 234, 1)",
            tension: 0.4,
          },
          {
            label: "Expenses",
            data: dashboardData.monthlyData.map((data) =>
              convertAmount(data.expenses)
            ),
            fill: true,
            backgroundColor: "rgba(255, 107, 107, 0.4)", // Softer red for expenses
            borderColor: "rgba(255, 107, 107, 1)",
            tension: 0.4,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#E5E7EB", // Light gray for legend text
        },
      },
      title: {
        display: true,
        text: "Financial Overview",
        font: { size: 16 },
        color: "#E5E7EB",
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${
              currencySymbols[displayCurrency]
            }${context.parsed.y.toLocaleString()}`,
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#E5E7EB",
        bodyColor: "#E5E7EB",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Month",
          color: "#E5E7EB",
        },
        ticks: {
          color: "#D1D5DB",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        title: {
          display: true,
          text: `Amount (${currencySymbols[displayCurrency]})`,
          color: "#E5E7EB",
        },
        ticks: {
          color: "#D1D5DB",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
    elements: {
      line: {
        borderWidth: 2,
      },
    },
  };

  return (
    <div className="p-6 min-h-screen font-sans bg-gradient-to-br from-black via-purple-900 to-black text-white">
      <h2 className="text-4xl font-extrabold text-purple-300 mb-8 text-center">
        Dashboard
      </h2>

      {/* Currency Selector */}
      <div className="max-w-3xl mx-auto mb-8">
        <label className="block text-gray-300 font-medium mb-2">
          Display Currency
        </label>
        <select
          value={displayCurrency}
          onChange={(e) => setDisplayCurrency(e.target.value)}
          className="w-full bg-gray-800 border border-purple-500 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-white"
        >
          <option value="INR">INR (₹)</option>
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
        </select>
      </div>

      {loading && (
        <p className="text-center text-gray-400 text-lg">Loading...</p>
      )}
      {error && (
        <p className="text-center text-red-400 text-lg font-medium">{error}</p>
      )}

      {dashboardData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Balance */}
            <div className="bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-lg border border-purple-500">
              <h3 className="text-lg font-semibold text-gray-300">
                Total Balance
              </h3>
              <p className="text-2xl font-bold text-white">
                {currencySymbols[displayCurrency]}
                {convertAmount(dashboardData.totalBalance)}
              </p>
              <p
                className={`text-sm ${
                  dashboardData.balanceChange >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {dashboardData.balanceChange >= 0 ? "+" : ""}
                {dashboardData.balanceChange.toFixed(1)}% from last month
              </p>
            </div>

            {/* Monthly Income */}
            <div className="bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-lg border border-purple-500">
              <h3 className="text-lg font-semibold text-gray-300">
                Monthly Income
              </h3>
              <p className="text-2xl font-bold text-white">
                {currencySymbols[displayCurrency]}
                {convertAmount(dashboardData.monthlyIncome)}
              </p>
              <p
                className={`text-sm ${
                  dashboardData.incomeChange >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {dashboardData.incomeChange >= 0 ? "+" : ""}
                {dashboardData.incomeChange.toFixed(1)}% from last month
              </p>
            </div>

            {/* Monthly Expenses */}
            <div className="bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-lg border border-purple-500">
              <h3 className="text-lg font-semibold text-gray-300">
                Monthly Expenses
              </h3>
              <p className="text-2xl font-bold text-white">
                {currencySymbols[displayCurrency]}
                {convertAmount(dashboardData.monthlyExpenses)}
              </p>
              <p
                className={`text-sm ${
                  dashboardData.expensesChange >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {dashboardData.expensesChange >= 0 ? "+" : ""}
                {dashboardData.expensesChange.toFixed(1)}% from last month
              </p>
            </div>

            {/* Stock Market Overview */}
            <div className="bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-lg border border-purple-500">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">
                Stock Market Overview
              </h3>
              {stockData ? (
                <div className="flex justify-between items-center">
                  {/* IBM */}
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-300">IBM</p>
                    <p
                      className={`text-sm font-semibold ${
                        stockData.IBM.changePercent >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {stockData.IBM.changePercent >= 0 ? "+" : ""}
                      {stockData.IBM.changePercent}%
                    </p>
                    <p className="text-lg font-bold text-white">
                      {currencySymbols[displayCurrency]}
                      {convertAmount(stockData.IBM.price)}
                    </p>
                  </div>
                  {/* AAPL */}
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-300">AAPL</p>
                    <p
                      className={`text-sm font-semibold ${
                        stockData.AAPL.changePercent >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {stockData.AAPL.changePercent >= 0 ? "+" : ""}
                      {stockData.AAPL.changePercent}%
                    </p>
                    <p className="text-lg font-bold text-white">
                      {currencySymbols[displayCurrency]}
                      {convertAmount(stockData.AAPL.price)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">Loading stock data...</p>
              )}
              <div className="mt-4 text-center">
                <Link
                  to="/home/stocksinvest"
                  className="text-purple-400 hover:text-purple-300 transition duration-200 text-sm"
                >
                  See more in markets
                </Link>
              </div>
            </div>
          </div>

          {/* Financial Overview Chart */}
          <div className="bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-lg border border-purple-500 mb-8">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">
              Financial Overview: Track your financial performance over time
            </h3>
            <div className="h-96">
              {chartData && <Line data={chartData} options={chartOptions} />}
            </div>
          </div>

          {/* Recent Transactions and AI Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <div className="bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-lg border border-purple-500">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">
                Recent Transactions
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Your latest financial activities across all accounts.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400">
                      <th className="py-2 px-4">Date</th>
                      <th className="py-2 px-4">Description</th>
                      <th className="py-2 px-4">Category</th>
                      <th className="py-2 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentTransactions.map((txn, index) => (
                      <tr key={index} className="border-t border-gray-700">
                        <td className="py-2 px-4 text-gray-300">
                          {new Date(txn.date).toISOString().split("T")[0]}
                        </td>
                        <td className="py-2 px-4 text-gray-300">
                          {txn.description}
                        </td>
                        <td className="py-2 px-4 text-gray-300">
                          {txn.category}
                        </td>
                        <td
                          className={`py-2 px-4 text-right ${
                            txn.category === "Deposit"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {txn.category === "Deposit" ? "+" : "-"}
                          {currencySymbols[displayCurrency]}
                          {convertAmount(txn.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Financial Insights */}
            <div className="bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-lg border border-purple-500">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">
                AI Financial Insights
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Personalized recommendations based on your spending patterns.
              </p>
              <div className="space-y-4">
                {dashboardData.aiInsights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="mt-1">
                      {insight.type === "warning" && (
                        <FaLightbulb className="text-yellow-400 w-5 h-5" />
                      )}
                      {insight.type === "success" && (
                        <FaCheckCircle className="text-green-400 w-5 h-5" />
                      )}
                      {insight.type === "alert" && (
                        <FaExclamationTriangle className="text-red-400 w-5 h-5" />
                      )}
                    </div>
                    <p className="text-gray-300">{insight.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
