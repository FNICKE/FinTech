import React, { useState, useEffect } from "react";
import axios from "axios";

const DebtTracker = () => {
  const [debtData, setDebtData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [displayCurrency, setDisplayCurrency] = useState("INR");
  const [expandedDebt, setExpandedDebt] = useState(null); // Track which debt's schedule is expanded
  const [showAddDebtModal, setShowAddDebtModal] = useState(false); // Control modal visibility
  const [newDebt, setNewDebt] = useState({
    lender: "",
    originalAmount: "",
    outstandingBalance: "",
    interestRate: "",
    monthlyPayment: "",
    startDate: "",
    dueDate: "",
    currency: "INR",
  });
  const [payoffCalc, setPayoffCalc] = useState({
    debtId: null,
    newMonthlyPayment: "",
    result: null,
  }); // Debt payoff calculator state

  useEffect(() => {
    fetchDebtData();
  }, []);

  const fetchDebtData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("http://localhost:5000/api/debts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDebtData(data);
      setError(null);
    } catch (err) {
      setError(
        "Failed to fetch debt data: " +
          (err.response?.data?.error || err.message)
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  // Toggle repayment schedule visibility
  const toggleRepaymentSchedule = (debtId) => {
    console.log(
      "Toggling schedule for debtId:",
      debtId,
      "Current expandedDebt:",
      expandedDebt
    );
    setExpandedDebt(expandedDebt === debtId ? null : debtId);
  };

  // Handle form input changes for adding a new debt
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDebt({ ...newDebt, [name]: value });
  };

  // Handle form submission for adding a new debt
  const handleAddDebt = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/debts",
        {
          ...newDebt,
          originalAmount: parseFloat(newDebt.originalAmount),
          outstandingBalance: parseFloat(newDebt.outstandingBalance),
          interestRate: parseFloat(newDebt.interestRate),
          monthlyPayment: parseFloat(newDebt.monthlyPayment),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setShowAddDebtModal(false);
      setNewDebt({
        lender: "",
        originalAmount: "",
        outstandingBalance: "",
        interestRate: "",
        monthlyPayment: "",
        startDate: "",
        dueDate: "",
        currency: "INR",
      });
      fetchDebtData(); // Refresh debt data
    } catch (err) {
      setError(
        "Failed to add debt: " + (err.response?.data?.error || err.message)
      );
      console.error(err);
    }
  };

  // Debt Payoff Calculator
  const calculatePayoff = (debt) => {
    const newMonthlyPayment = parseFloat(payoffCalc.newMonthlyPayment);
    if (!newMonthlyPayment || newMonthlyPayment <= debt.monthlyPayment) {
      setPayoffCalc({
        ...payoffCalc,
        result: "Please enter a monthly payment higher than the current one.",
      });
      return;
    }

    let remainingBalance = debt.outstandingBalance;
    let months = 0;
    const monthlyInterestRate = debt.interestRate / 100 / 12;

    while (remainingBalance > 0) {
      const interestForMonth = remainingBalance * monthlyInterestRate;
      const principalPayment = newMonthlyPayment - interestForMonth;
      remainingBalance -= principalPayment;
      months++;
      if (months > 1200) break; // Prevent infinite loop
    }

    setPayoffCalc({
      ...payoffCalc,
      result: `With a monthly payment of ${
        currencySymbols[displayCurrency]
      }${convertAmount(
        newMonthlyPayment
      )}, you can pay off this debt in ${months} months.`,
    });
  };

  return (
    <div className="p-6 min-h-screen font-sans bg-gradient-to-br from-black via-purple-900 to-black text-white">
      <h2 className="text-4xl font-extrabold text-purple-300 mb-8 text-center">
        Debt Tracker
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

      {debtData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Total Outstanding Debt */}
            <div className="bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-lg border border-purple-500">
              <h3 className="text-lg font-semibold text-gray-300">
                Total Outstanding Debt
              </h3>
              <p className="text-2xl font-bold text-white">
                {currencySymbols[displayCurrency]}
                {convertAmount(debtData.totalOutstanding)}
              </p>
            </div>

            {/* Monthly Repayment */}
            <div className="bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-lg border border-purple-500">
              <h3 className="text-lg font-semibold text-gray-300">
                Monthly Repayment
              </h3>
              <p className="text-2xl font-bold text-white">
                {currencySymbols[displayCurrency]}
                {convertAmount(debtData.monthlyRepayment)}
              </p>
            </div>
          </div>

          {/* Add Debt Button */}
          <div className="mb-8 text-center">
            <button
              onClick={() => setShowAddDebtModal(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-200"
            >
              Add New Debt
            </button>
          </div>

          {/* Add Debt Modal */}
          {showAddDebtModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg shadow-lg border border-purple-500 w-full max-w-lg flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-2xl font-semibold text-purple-300 text-center">
                    Add New Debt
                  </h3>
                </div>

                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <form onSubmit={handleAddDebt} className="space-y-5">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">
                          Lender
                        </label>
                        <input
                          type="text"
                          name="lender"
                          value={newDebt.lender}
                          onChange={handleInputChange}
                          className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">
                          Original Amount
                        </label>
                        <input
                          type="number"
                          name="originalAmount"
                          value={newDebt.originalAmount}
                          onChange={handleInputChange}
                          className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">
                          Outstanding Balance
                        </label>
                        <input
                          type="number"
                          name="outstandingBalance"
                          value={newDebt.outstandingBalance}
                          onChange={handleInputChange}
                          className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">
                          Interest Rate (% per year)
                        </label>
                        <input
                          type="number"
                          name="interestRate"
                          value={newDebt.interestRate}
                          onChange={handleInputChange}
                          className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">
                          Monthly Payment
                        </label>
                        <input
                          type="number"
                          name="monthlyPayment"
                          value={newDebt.monthlyPayment}
                          onChange={handleInputChange}
                          className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={newDebt.startDate}
                          onChange={handleInputChange}
                          className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">
                          Due Date
                        </label>
                        <input
                          type="date"
                          name="dueDate"
                          value={newDebt.dueDate}
                          onChange={handleInputChange}
                          className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 font-medium mb-2">
                          Currency
                        </label>
                        <select
                          name="currency"
                          value={newDebt.currency}
                          onChange={handleInputChange}
                          className="w-full bg-gray-700 border border-gray-600 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Modal Footer with Buttons */}
                <div className="p-6 border-t border-gray-700 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddDebtModal(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddDebt}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200"
                  >
                    Add Debt
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Debt List */}
          <div className="bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-lg border border-purple-500">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">
              Your Debts
            </h3>
            {debtData.debts.length === 0 ? (
              <p className="text-gray-400">No debts found. You're debt-free!</p>
            ) : (
              <div className="space-y-6">
                {debtData.debts.map((debt) => (
                  <div key={debt._id} className="border-b border-gray-700 pb-4">
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <p className="text-gray-300 mb-2">
                        Progress:{" "}
                        {(
                          ((debt.originalAmount - debt.outstandingBalance) /
                            debt.originalAmount) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                      <div className="w-full bg-gray-700 rounded-full h-4">
                        <div
                          className="bg-purple-600 h-4 rounded-full"
                          style={{
                            width: `${
                              ((debt.originalAmount - debt.outstandingBalance) /
                                debt.originalAmount) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xl font-semibold text-white">
                          {debt.lender}
                        </h4>
                        <p className="text-gray-400">
                          Outstanding Balance:{" "}
                          {currencySymbols[displayCurrency]}
                          {convertAmount(debt.outstandingBalanceInBaseCurrency)}
                        </p>
                        <p className="text-gray-400">
                          Interest Rate: {debt.interestRate}% per year
                        </p>
                        <p className="text-gray-400">
                          Monthly Payment: {currencySymbols[displayCurrency]}
                          {convertAmount(debt.monthlyPaymentInBaseCurrency)}
                        </p>
                        <p className="text-gray-400">
                          Due Date:{" "}
                          {new Date(debt.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          toggleRepaymentSchedule(debt._id.toString())
                        } // Ensure debt._id is a string
                        className="text-purple-400 hover:text-purple-300 transition duration-200"
                      >
                        {expandedDebt === debt._id.toString()
                          ? "Hide Schedule"
                          : "View Schedule"}
                      </button>
                    </div>

                    {/* Repayment Schedule */}
                    {expandedDebt === debt._id.toString() && (
                      <div className="mt-4">
                        <h5 className="text-gray-300 mb-2">
                          Repayment Schedule
                        </h5>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-gray-400">
                                <th className="py-2 px-4">Date</th>
                                <th className="py-2 px-4">Payment Amount</th>
                                <th className="py-2 px-4">Interest</th>
                                <th className="py-2 px-4">Principal</th>
                                <th className="py-2 px-4">Remaining Balance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {debt.repaymentSchedule &&
                              debt.repaymentSchedule.length > 0 ? (
                                debt.repaymentSchedule.map((payment, index) => (
                                  <tr
                                    key={index}
                                    className="border-t border-gray-700"
                                  >
                                    <td className="py-2 px-4 text-gray-300">
                                      {
                                        new Date(payment.date)
                                          .toISOString()
                                          .split("T")[0]
                                      }
                                    </td>
                                    <td className="py-2 px-4 text-gray-300">
                                      {currencySymbols[displayCurrency]}
                                      {convertAmount(payment.paymentAmount)}
                                    </td>
                                    <td className="py-2 px-4 text-gray-300">
                                      {currencySymbols[displayCurrency]}
                                      {convertAmount(payment.interest)}
                                    </td>
                                    <td className="py-2 px-4 text-gray-300">
                                      {currencySymbols[displayCurrency]}
                                      {convertAmount(payment.principal)}
                                    </td>
                                    <td className="py-2 px-4 text-gray-300">
                                      {currencySymbols[displayCurrency]}
                                      {convertAmount(payment.remainingBalance)}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan="5"
                                    className="py-2 px-4 text-gray-400 text-center"
                                  >
                                    No repayment schedule available.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Debt Payoff Calculator */}
                        <div className="mt-4">
                          <h5 className="text-gray-300 mb-2">
                            Debt Payoff Calculator
                          </h5>
                          <div className="flex space-x-3 items-center">
                            <input
                              type="number"
                              placeholder="New Monthly Payment"
                              value={payoffCalc.newMonthlyPayment}
                              onChange={(e) =>
                                setPayoffCalc({
                                  ...payoffCalc,
                                  debtId: debt._id,
                                  newMonthlyPayment: e.target.value,
                                })
                              }
                              className="bg-gray-700 border border-gray-600 p-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                            <button
                              onClick={() => calculatePayoff(debt)}
                              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200"
                            >
                              Calculate
                            </button>
                          </div>
                          {payoffCalc.debtId === debt._id &&
                            payoffCalc.result && (
                              <p className="mt-2 text-gray-300">
                                {payoffCalc.result}
                              </p>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DebtTracker;
