import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const FinancialInsights = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState("");
  const [spendingData, setSpendingData] = useState(null);
  const [budgetRecommendations, setBudgetRecommendations] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [newBudget, setNewBudget] = useState({ category: "", amount: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBankAccounts = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/bank-accounts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBankAccounts(data);
      if (data.length > 0) setSelectedBankAccountId(data[0]._id);
    } catch (error) {
      setError("Failed to fetch bank accounts: " + (error.response?.data?.error || error.message));
      console.error(error);
    }
  };

  const fetchSpendingData = async () => {
    if (!selectedBankAccountId) return;
    setLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/insights/spending?bankAccountId=${selectedBankAccountId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setSpendingData(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch spending data: " + (err.response?.data?.error || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetRecommendations = async () => {
    if (!selectedBankAccountId) return;
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/insights/budget?bankAccountId=${selectedBankAccountId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setBudgetRecommendations(data);
    } catch (err) {
      setError("Failed to fetch budget recommendations: " + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  const fetchBudgets = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/insights/budgets", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBudgets(data);
    } catch (err) {
      setError("Failed to fetch budgets: " + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  const handleSetBudget = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/insights/budgets",
        newBudget,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setBudgets((prev) => {
        const existing = prev.find((b) => b.category === newBudget.category);
        if (existing) return prev.map((b) => (b.category === newBudget.category ? data : b));
        return [...prev, data];
      });
      setNewBudget({ category: "", amount: "" });
      fetchSpendingData();
    } catch (err) {
      setError("Failed to set budget: " + (err.response?.data?.error || err.message));
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
    fetchBudgets();
  }, []);

  useEffect(() => {
    fetchSpendingData();
    fetchBudgetRecommendations();
  }, [selectedBankAccountId]);

  const chartData = spendingData?.spendingByCategory
    ? {
        labels: Object.keys(spendingData.spendingByCategory),
        datasets: [
          {
            label: "Spending (₹)",
            data: Object.values(spendingData.spendingByCategory),
            backgroundColor: [
              "rgba(139, 92, 246, 0.6)", // Purple shades
              "rgba(167, 139, 250, 0.6)",
              "rgba(99, 102, 241, 0.6)",
              "rgba(124, 58, 237, 0.6)",
              "rgba(192, 132, 252, 0.6)",
              "rgba(221, 214, 254, 0.6)",
            ],
            borderColor: [
              "rgba(139, 92, 246, 1)",
              "rgba(167, 139, 250, 1)",
              "rgba(99, 102, 241, 1)",
              "rgba(124, 58, 237, 1)",
              "rgba(192, 132, 252, 1)",
              "rgba(221, 214, 254, 1)",
            ],
            borderWidth: 1,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { color: "#e9d5ff" } },
      title: { display: true, text: "Spending by Category", color: "#e9d5ff" },
      tooltip: { callbacks: { label: (context) => `₹${context.parsed.toLocaleString()}` } },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black p-8">
      <h2 className="text-5xl font-extrabold text-white mb-6 text-center bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
        Personalized Financial Insights
      </h2>
      <p className="text-purple-200 mb-10 text-center text-xl max-w-2xl mx-auto">
        Understand your spending, set budgets, and optimize your finances.
      </p>

      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
        {/* Sidebar with Quick Stats */}
        <div className="lg:w-1/3 bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30">
          <h3 className="text-2xl font-semibold text-white mb-4">Quick Stats</h3>
          <div className="space-y-4 text-purple-100">
            <p><strong>Total Accounts:</strong> {bankAccounts.length}</p>
            <p><strong>Total Balance:</strong> ₹{bankAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0).toLocaleString()}</p>
            {spendingData && (
              <>
                <p><strong>Annual Income:</strong> ₹{(spendingData.totalIncome || 0).toLocaleString()}</p>
                <p><strong>Total Spending:</strong> ₹{(spendingData.totalSpending || 0).toLocaleString()}</p>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-2/3 space-y-8">
          {/* Bank Account Selector */}
          <div className="bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30">
            <label className="block text-purple-100 font-medium mb-2">Select Bank Account</label>
            <select
              value={selectedBankAccountId}
              onChange={(e) => setSelectedBankAccountId(e.target.value)}
              className="w-full bg-gray-800 border border-purple-500/50 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="" className="text-gray-400">-- Select a bank account --</option>
              {bankAccounts.map((account) => (
                <option key={account._id} value={account._id} className="text-white">
                  {account.name} (₹{account.balance?.toFixed(2) || "0.00"})
                </option>
              ))}
            </select>
          </div>

          {loading && <p className="text-center text-purple-200 text-lg">Loading...</p>}
          {error && <p className="text-center text-red-400 text-lg font-medium">{error}</p>}

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Spending Patterns */}
            {spendingData?.spendingByCategory && (
              <div className="bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30 hover:shadow-2xl transition-all duration-300">
                <h3 className="text-2xl font-bold text-purple-400 mb-4">Spending Patterns</h3>
                <div className="h-80 mb-4">
                  <Pie data={chartData} options={chartOptions} />
                </div>
                <div className="space-y-2 text-purple-100">
                  {Object.entries(spendingData.spendingByCategory).map(([category, amount]) => (
                    <p key={category}><strong>{category}:</strong> ₹{(amount || 0).toFixed(2)}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Insights */}
            {spendingData?.insights && (
              <div className="bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30 hover:shadow-2xl transition-all duration-300">
                <h3 className="text-2xl font-bold text-purple-400 mb-4">Financial Insights</h3>
                <div className="space-y-3">
                  {spendingData.insights
                    .filter((insight) => insight.message.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((insight, index) => (
                      <p
                        key={index}
                        className={`text-purple-100 p-3 rounded-lg ${
                          insight.severity === "warning"
                            ? "bg-red-800 text-red-200"
                            : insight.severity === "success"
                            ? "bg-green-800 text-green-200"
                            : "bg-purple-800 text-purple-200"
                        }`}
                      >
                        <strong>{insight.category}:</strong> {insight.message}
                      </p>
                    ))}
                </div>
              </div>
            )}

            {/* Budget Recommendations */}
            {budgetRecommendations && (
              <div className="bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30 hover:shadow-2xl transition-all duration-300">
                <h3 className="text-2xl font-bold text-purple-400 mb-4">Smart Budget Recommendations</h3>
                <div className="space-y-2 text-purple-100">
                  <p><strong>Needs (50%):</strong> ₹{(budgetRecommendations.recommendedNeeds || 0).toFixed(2)}</p>
                  <p><strong>Wants (30%):</strong> ₹{(budgetRecommendations.recommendedWants || 0).toFixed(2)}</p>
                  <p><strong>Savings (20%):</strong> ₹{(budgetRecommendations.recommendedSavings || 0).toFixed(2)}</p>
                  {budgetRecommendations.budgetRecommendations &&
                    Object.entries(budgetRecommendations.budgetRecommendations).map(([category, amount]) => (
                      <p key={category}><strong>{category}:</strong> ₹{(amount || 0).toFixed(2)}</p>
                    ))}
                </div>
              </div>
            )}

            {/* Set Your Budget */}
            <div className="bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">Set Your Budget</h3>
              <form onSubmit={handleSetBudget} className="space-y-4">
                <div>
                  <label className="block text-purple-100 font-medium mb-2">Category</label>
                  <select
                    value={newBudget.category}
                    onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                    className="w-full bg-gray-800 border border-purple-500/50 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    required
                  >
                    <option value="" className="text-gray-400">-- Select a category --</option>
                    {spendingData?.spendingByCategory &&
                      Object.keys(spendingData.spendingByCategory).map((category) => (
                        <option key={category} value={category} className="text-white">
                          {category}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-purple-100 font-medium mb-2">Budget Amount (₹)</label>
                  <input
                    type="number"
                    value={newBudget.amount}
                    onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                    className="w-full bg-gray-800 border border-purple-500/50 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Enter budget amount"
                    required
                    min="0"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-full hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-md"
                >
                  Set Budget
                </button>
              </form>
            </div>

            {/* Your Budgets */}
            {budgets.length > 0 && (
              <div className="bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30 hover:shadow-2xl transition-all duration-300">
                <h3 className="text-2xl font-bold text-purple-400 mb-4">Your Budgets</h3>
                <div className="space-y-2 text-purple-100">
                  {budgets.map((budget) => (
                    <p key={budget._id}><strong>{budget.category}:</strong> ₹{(budget.amount || 0).toFixed(2)}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialInsights;