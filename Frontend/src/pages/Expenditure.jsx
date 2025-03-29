import { useState, useEffect } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Link } from "react-router-dom";

ChartJS.register(ArcElement, Tooltip, Legend);

const Expenditure = () => {
  const [expenses, setExpenses] = useState({
    Food: 0,
    Transport: 0,
    Housing: 0,
    Entertainment: 0,
    Others: 0,
  });
  const [totalBalance, setTotalBalance] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [tips, setTips] = useState("");
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/bank-accounts", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setAccounts(data);
        const balance = data.reduce((sum, account) => sum + account.balance, 0);
        setTotalBalance(balance);
        if (data.length > 0) setSelectedAccount(data[0]._id);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (category, value) => {
    setExpenses((prev) => ({
      ...prev,
      [category]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalSpent = Object.values(expenses).reduce((sum, val) => sum + val, 0);

    if (totalSpent <= 0) {
      alert("Please enter some expenses.");
      return;
    }
    if (!selectedAccount) {
      alert("Please select a bank account.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/bank-accounts/deduct",
        { bankAccountId: selectedAccount, expenses },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      const { data } = await axios.get("http://localhost:5000/api/bank-accounts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const newBalance = data.reduce((sum, account) => sum + account.balance, 0);
      setTotalBalance(newBalance);

      // Generate spending tip
      const highestCategory = Object.entries(expenses).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
      const tipsList = {
        Food: "Try cooking at home more often or buying in bulk to save on food costs.",
        Transport: "Consider carpooling, using public transport, or biking to reduce transport expenses.",
        Housing: "Look for ways to save on utilities, like using energy-efficient appliances.",
        Entertainment: "Opt for free community events or streaming services instead of expensive outings.",
        Others: "Review your 'Others' spending—small purchases can add up quickly!",
      };
      setTips(`You spent the most on ${highestCategory} (₹${expenses[highestCategory].toFixed(2)}). ${tipsList[highestCategory]}`);
    } catch (error) {
      alert("Error processing expenditure: " + error.response?.data?.error);
    }
  };

  const chartData = {
    labels: Object.keys(expenses),
    datasets: [
      {
        data: Object.values(expenses),
        backgroundColor: [
          "rgba(139, 92, 246, 0.6)", // Purple shades
          "rgba(167, 139, 250, 0.6)",
          "rgba(99, 102, 241, 0.6)",
          "rgba(124, 58, 237, 0.6)",
          "rgba(192, 132, 252, 0.6)",
        ],
        hoverBackgroundColor: [
          "rgba(139, 92, 246, 0.8)",
          "rgba(167, 139, 250, 0.8)",
          "rgba(99, 102, 241, 0.8)",
          "rgba(124, 58, 237, 0.8)",
          "rgba(192, 132, 252, 0.8)",
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { color: "#e9d5ff" } },
      tooltip: { callbacks: { label: (context) => `₹${context.parsed.toLocaleString()}` } },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black p-8">
      <h2 className="text-5xl font-extrabold text-white mb-6 text-center bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
        Track Your Expenditure
      </h2>
      <p className="text-purple-200 mb-8 text-center text-xl">
        Current Total Balance: <span className="font-semibold text-purple-100">₹{totalBalance.toFixed(2)}</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Expense Input Section */}
        <div className="bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30 hover:shadow-2xl transition-all duration-300">
          <h3 className="text-2xl font-semibold text-purple-400 mb-4">Enter Your Expenses</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-purple-100 font-medium mb-2">Select Bank Account</label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full border border-purple-500/50 p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {accounts.length === 0 ? (
                  <option value="">No accounts available</option>
                ) : (
                  accounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.name} (₹{account.balance.toFixed(2)})
                    </option>
                  ))
                )}
              </select>
            </div>

            {Object.keys(expenses).map((category) => (
              <div key={category} className="mb-4">
                <label className="block text-purple-100 font-medium mb-2">{category} (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={expenses[category] || ""}
                  onChange={(e) => handleInputChange(category, e.target.value)}
                  className="w-full border border-purple-500/50 p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-400"
                  placeholder={`Enter ${category} expense`}
                />
              </div>
            ))}

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-md"
              >
                Submit Expenses
              </button>
              <Link
                to="/transactions"
                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-md"
              >
                View Transactions
              </Link>
            </div>
          </form>
        </div>

        {/* Chart Section */}
        <div className="bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30 hover:shadow-2xl transition-all duration-300">
          <h3 className="text-2xl font-semibold text-purple-400 mb-4">Spending Breakdown</h3>
          {Object.values(expenses).some((val) => val > 0) ? (
            <div className="w-full h-64">
              <Pie data={chartData} options={chartOptions} />
            </div>
          ) : (
            <p className="text-purple-200">Enter expenses to see the chart.</p>
          )}
          {tips && (
            <div className="mt-6">
              <h4 className="text-lg font-medium text-purple-300">Money-Saving Tip</h4>
              <p className="text-purple-100">{tips}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Expenditure;