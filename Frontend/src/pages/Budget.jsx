import { useState, useEffect } from "react";
import axios from "axios";

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({ category: "", limit: "" });
  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    fetchBudgets();
    fetchExpenses();
  }, []);

  // Fetch Budgets
  const fetchBudgets = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/budgets/${currentMonth}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setBudgets(data);
    } catch (error) {
      console.error("Error fetching budgets", error);
    }
  };

  // Fetch Expenses
  const fetchExpenses = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/expenses", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses", error);
    }
  };

  // Add or Update Budget
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const budgetData = { ...formData, month: currentMonth };
      await axios.post("http://localhost:5000/api/budgets", budgetData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setFormData({ category: "", limit: "" });
      fetchBudgets();
    } catch (error) {
      console.error("Error adding budget", error);
    }
  };

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Calculate Spending per Category
  const getSpendingByCategory = (category) => {
    return expenses
      .filter(
        (exp) =>
          exp.category === category &&
          new Date(exp.date).toLocaleString("default", {
            month: "long",
            year: "numeric",
          }) === currentMonth
      )
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  // Generate Budget Tip
  const getBudgetTip = (category, spent, limit) => {
    const percentage = (spent / limit) * 100;
    if (percentage > 100)
      return `You've exceeded your ${category} budget by ₹${(
        spent - limit
      ).toFixed(2)}!`;
    if (percentage > 75)
      return `You're ${percentage.toFixed(
        0
      )}% through your ${category} budget—slow down!`;
    return `Good job! You're within your ${category} budget.`;
  };

  return (
    <div className="p-6 bg-black min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-white">
        Budget for {currentMonth}
      </h2>

      {/* Budget Form */}
      <form onSubmit={handleSubmit} className="mb-6 flex gap-4 items-center">
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="border border-gray-600 p-2 rounded-lg bg-blue-950 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          required
        >
          <option value="">Select Category</option>
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Shopping">Shopping</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Rent">Rent</option>
          <option value="Others">Others</option>
        </select>
        <input
          type="number"
          name="limit"
          value={formData.limit}
          onChange={handleChange}
          placeholder="Budget Limit (₹)"
          className="border border-gray-600 p-2 rounded-lg bg-blue-950 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          required
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200"
        >
          Set Budget
        </button>
      </form>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.length === 0 ? (
          <p className="text-gray-400">No budgets set for this month yet.</p>
        ) : (
          budgets.map((budget) => {
            const spent = getSpendingByCategory(budget.category);
            const percentage = Math.min((spent / budget.limit) * 100, 100);
            return (
              <div
                key={budget._id}
                className="bg-blue-950 p-4 rounded-lg shadow-md"
              >
                <h3 className="text-lg font-semibold text-white">
                  {budget.category}
                </h3>
                <p className="text-gray-300">
                  Spent: ₹{spent} / ₹{budget.limit}
                </p>
                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                  <div
                    className={`h-2.5 rounded-full ${
                      percentage > 75 ? "bg-red-500" : "bg-green-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-300">
                  {getBudgetTip(budget.category, spent, budget.limit)}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Budget;
