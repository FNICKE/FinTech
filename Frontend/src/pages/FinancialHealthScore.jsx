import React, { useState, useEffect } from "react";
import axios from "axios";

const FinancialHealthScore = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState("");
  const [financialData, setFinancialData] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch bank accounts
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

  // Fetch financial data (income, expenses, totalDebt) from the backend
  const fetchFinancialData = async () => {
    if (!selectedBankAccountId) return;

    setLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/insights/spending?bankAccountId=${selectedBankAccountId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setFinancialData({
        income: data.totalIncome || 0,
        expenses: data.totalSpending || 0,
        totalDebt: data.totalDebt || 0, // Assuming backend provides this; adjust as needed
      });
      setError(null);
    } catch (err) {
      setError("Failed to fetch financial data: " + (err.response?.data?.error || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate financial health score
  const calculateScore = async () => {
    if (!financialData) return;

    const { income, expenses, totalDebt } = financialData;
    const dti = income > 0 ? totalDebt / income : 0; // Calculate DTI dynamically

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/financial-health/financial-health",
        { income, expenses, totalDebt, dti },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setScore(data.score);
      setError(null);
    } catch (error) {
      setError("Error calculating financial health score: " + (error.response?.data?.error || error.message));
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  useEffect(() => {
    fetchFinancialData();
  }, [selectedBankAccountId]);

  return (
    <div className="min-h-screen bg-black text-white font-sans p-6">
      <h2 className="text-4xl font-extrabold text-blue-500 mb-8 text-center">
        Financial Health Score
      </h2>

      {/* Bank Account Selector */}
      <div className="max-w-4xl mx-auto mb-8">
        <label className="block text-gray-300 font-medium mb-2">Select Bank Account</label>
        <select
          value={selectedBankAccountId}
          onChange={(e) => setSelectedBankAccountId(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" className="text-gray-400">-- Select a bank account --</option>
          {bankAccounts.map((account) => (
            <option key={account._id} value={account._id} className="text-white">
              {account.name} (₹{account.balance?.toFixed(2) || "0.00"})
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-center text-gray-400 text-lg">Loading...</p>}
      {error && <p className="text-center text-red-500 text-lg font-medium">{error}</p>}

      {/* Two-Column Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Data */}
        {financialData && (
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-blue-500 mb-4">Your Financial Data</h3>
            <div className="space-y-3 text-gray-300">
              <p><strong>Income:</strong> ₹{(financialData.income || 0).toFixed(2)}</p>
              <p><strong>Expenses:</strong> ₹{(financialData.expenses || 0).toFixed(2)}</p>
              <p><strong>Total Debt:</strong> ₹{(financialData.totalDebt || 0).toFixed(2)}</p>
              <p><strong>Debt-to-Income Ratio (DTI):</strong> {((financialData.totalDebt / financialData.income) || 0).toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Score and Button */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-blue-500 mb-4">Calculate Your Score</h3>
          <button
            onClick={calculateScore}
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-600"
            disabled={!financialData}
          >
            Calculate Score
          </button>
          {score !== null && (
            <p className="mt-4 text-gray-300">
              <strong>Your Financial Health Score:</strong> {score}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialHealthScore;