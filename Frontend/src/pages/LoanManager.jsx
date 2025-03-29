import React, { useState, useEffect } from "react";
import axios from "axios";

const LoanManager = () => {
  const [loans, setLoans] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState("");
  const [income, setIncome] = useState(0); // Fetched from bank account data
  const [dti, setDti] = useState(null);
  const [optimizedLoans, setOptimizedLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch bank accounts to get income
  const fetchBankAccounts = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/bank-accounts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBankAccounts(data);
      if (data.length > 0) {
        setSelectedBankAccountId(data[0]._id);
        // Fetch income from spending insights (assuming it provides totalIncome)
        const { data: spendingData } = await axios.get(
          `http://localhost:5000/api/insights/spending?bankAccountId=${data[0]._id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setIncome(spendingData.totalIncome || 0);
      }
    } catch (error) {
      setError("Failed to fetch bank accounts: " + (error.response?.data?.error || error.message));
      console.error(error);
    }
  };

  // Fetch loans
  const fetchLoans = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:5000/api/loans/loans", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setLoans(data);
      setError(null);
    } catch (error) {
      setError("Failed to fetch loans: " + (error.response?.data?.error || error.message));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate DTI
  const calculateDTI = async () => {
    if (!income) {
      setError("No income data available to calculate DTI.");
      return;
    }
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/loans/dti",
        { income },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setDti(data.dti);
      setError(null);
    } catch (error) {
      setError("Error calculating DTI: " + (error.response?.data?.error || error.message));
      console.error(error);
    }
  };

  // Optimize loans
  const optimizeLoans = async () => {
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/loans/optimize",
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setOptimizedLoans(data.optimizedLoans);
      setError(null);
    } catch (error) {
      setError("Error optimizing loans: " + (error.response?.data?.error || error.message));
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
    fetchLoans();
  }, []);

  useEffect(() => {
    if (selectedBankAccountId) {
      fetchBankAccounts(); // Refresh income when bank account changes
    }
  }, [selectedBankAccountId]);

  return (
    <div className="min-h-screen bg-black text-white font-sans p-6">
      <h2 className="text-4xl font-extrabold text-blue-500 mb-8 text-center">
        Loan Management
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
        {/* Your Loans */}
        {loans.length > 0 && (
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-blue-500 mb-4">Your Loans</h3>
            <ul className="space-y-2 text-gray-300">
              {loans.map((loan) => (
                <li key={loan._id}>
                  {loan.loanType} - ₹{loan.currentBalance.toFixed(2)} remaining
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* DTI Calculator */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-blue-500 mb-4">Debt-to-Income (DTI) Calculator</h3>
          <p className="text-gray-300 mb-4">
            <strong>Income:</strong> ₹{income.toFixed(2)}
          </p>
          <button
            onClick={calculateDTI}
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-600"
            disabled={!income}
          >
            Calculate DTI
          </button>
          {dti !== null && (
            <p className="mt-4 text-gray-300">
              <strong>Your DTI:</strong> {(dti * 100).toFixed(2)}%
            </p>
          )}
        </div>

        {/* Loan Optimization */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-blue-500 mb-4">Loan Optimization</h3>
          <button
            onClick={optimizeLoans}
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-600"
            disabled={loans.length === 0}
          >
            Optimize Loans
          </button>
          {optimizedLoans.length > 0 && (
            <ul className="mt-4 space-y-2 text-gray-300">
              {optimizedLoans.map((loan) => (
                <li key={loan._id}>
                  {loan.loanType} - ₹{loan.currentBalance.toFixed(2)} remaining (Pay off first)
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanManager;