import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const navigate = useNavigate();

  const monthlyIncome = 50000;
  const monthlyExpenses = 30000;
  const monthlySavings = monthlyIncome - monthlyExpenses;

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!goalName || !targetAmount || !timeframe) return;

    const target = parseFloat(targetAmount);
    const current = parseFloat(currentSavings) || 0;
    const months = parseInt(timeframe);

    const progress = (current / target) * 100;
    const remainingAmount = target - current;
    const monthlyRequired = remainingAmount / months;

    let suggestion = "";
    if (monthlyRequired <= monthlySavings) {
      suggestion = `Good news! You can achieve this goal by saving ₹${monthlyRequired.toFixed(
        2
      )} per month.`;
    } else {
      const shortfall = monthlyRequired - monthlySavings;
      suggestion = `You need ₹${monthlyRequired.toFixed(
        2
      )} per month, but your current savings are only ₹${monthlySavings.toLocaleString()}. Consider:\n- Reducing expenses by ₹${shortfall.toFixed(
        2
      )}/month\n- Investing in Fixed Deposits (6-7% p.a.) or Mutual Funds (8-12% p.a.).`;
    }

    const newGoal = {
      id: Date.now(),
      name: goalName,
      targetAmount: target,
      currentSavings: current,
      timeframe: months,
      progress: progress.toFixed(2),
      suggestion,
    };

    setGoals([...goals, newGoal]);
    setGoalName("");
    setTargetAmount("");
    setCurrentSavings("");
    setTimeframe("");
  };

  const handleDeleteGoal = (id) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black p-8">
      <h2 className="text-5xl font-extrabold text-white mb-6 text-center bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
        Plan Your Financial Goals
      </h2>
      <p className="text-purple-200 mb-10 text-center text-xl max-w-2xl mx-auto">
        Set, track, and achieve your dreams with smart planning.
      </p>

      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
        {/* Sidebar with Financial Tips */}
        <div className="lg:w-1/3 bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30">
          <h3 className="text-2xl font-semibold text-white mb-4">
            Financial Tips
          </h3>
          <ul className="text-purple-100 space-y-4">
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span> Start small, but start now—consistency is key!
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span> Diversify investments to reduce risk.
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span> Review goals monthly to stay on track.
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span> Emergency fund: Aim for 3-6 months of expenses.
            </li>
          </ul>
        </div>

        {/* Goal Input Form */}
        <div className="lg:w-2/3">
          <form
            onSubmit={handleAddGoal}
            className="bg-gradient-to-br from-gray-900 to-purple-950 p-8 rounded-2xl shadow-xl border border-purple-500/30"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-purple-100 font-medium mb-2">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full border border-purple-500/50 p-3 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-400"
                  placeholder="e.g., Buy a Car"
                  required
                />
              </div>
              <div>
                <label className="block text-purple-100 font-medium mb-2">
                  Target Amount (₹)
                </label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full border border-purple-500/50 p-3 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-400"
                  placeholder="e.g., 500000"
                  min="1000"
                  required
                />
              </div>
              <div>
                <label className="block text-purple-100 font-medium mb-2">
                  Current Savings (₹)
                </label>
                <input
                  type="number"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(e.target.value)}
                  className="w-full border border-purple-500/50 p-3 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-400"
                  placeholder="e.g., 50000"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-purple-100 font-medium mb-2">
                  Timeframe (Months)
                </label>
                <input
                  type="number"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full border border-purple-500/50 p-3 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-400"
                  placeholder="e.g., 12"
                  min="1"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-full hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
              >
                Add Goal
              </button>
              <button
                type="button"
                onClick={() => navigate("/investments")}
                className="bg-gray-700 text-white px-6 py-3 rounded-full hover:bg-gray-600 transition-all duration-200"
              >
                Back to Investments
              </button>
            </div>
          </form>

          {/* Goals List */}
          {goals.length > 0 && (
            <div className="mt-8">
              <h3 className="text-3xl font-semibold text-white mb-6">
                Your Goals
              </h3>
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl mb-6 border border-purple-500/30 hover:shadow-2xl transition-all duration-300"
                >
                  <h4 className="text-2xl font-semibold text-white mb-2">
                    {goal.name}
                  </h4>
                  <p className="text-purple-100">
                    Target: ₹{goal.targetAmount.toLocaleString()}
                  </p>
                  <p className="text-purple-100">
                    Current Savings: ₹{goal.currentSavings.toLocaleString()}
                  </p>
                  <p className="text-purple-100">
                    Timeframe: {goal.timeframe} months
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-3 mt-4">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full"
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-purple-200 text-sm mt-2">
                    Progress: {goal.progress}%
                  </p>
                  <p className="text-purple-200 mt-3 whitespace-pre-line">
                    <span className="font-semibold">Suggestion:</span>{" "}
                    {goal.suggestion}
                  </p>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-all duration-200 shadow-md"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Goals;