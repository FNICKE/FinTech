import { useState } from "react";
import axios from "axios";
import {
  FaChartLine,
  FaHome,
  FaGem,
  FaMoneyBillWave,
  FaPiggyBank,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Investments = () => {
  const [goldSuggestion, setGoldSuggestion] = useState("");
  const [goldAmount, setGoldAmount] = useState("");
  const [goldPricePerGram, setGoldPricePerGram] = useState(null);
  const [showGoldModal, setShowGoldModal] = useState(false);
  const navigate = useNavigate();

  const investmentOptions = [
    {
      id: 1,
      name: "Stocks",
      icon: <FaChartLine className="text-green-400 text-4xl" />,
      description: "Invest in company shares for potential high returns.",
      returns: "8-15% annually (avg)",
    },
    {
      id: 2,
      name: "Land",
      icon: <FaHome className="text-red-400 text-4xl" />,
      description: "Buy real estate for long-term value growth.",
      returns: "5-10% annually (avg)",
    },
    {
      id: 3,
      name: "Gold",
      icon: <FaGem className="text-yellow-400 text-4xl" />,
      description: "A safe haven asset with steady value.",
      returns: "3-7% annually (avg)",
    },
    {
      id: 4,
      name: "Mutual Funds",
      icon: <FaMoneyBillWave className="text-blue-400 text-4xl" />,
      description: "Diversified investments managed by experts.",
      returns: "6-12% annually (avg)",
    },
    {
      id: 5,
      name: "Fixed Deposits",
      icon: <FaPiggyBank className="text-pink-400 text-4xl" />,
      description: "Low-risk option with guaranteed returns.",
      returns: "4-6% annually (avg)",
    },
  ];

  const fetchGoldPrice = async () => {
    try {
      const response = await axios.get("https://www.goldapi.io/api/XAU/INR", {
        headers: {
          "x-access-token": "goldapi-4556bj19m8q5gqfn-io",
          "Content-Type": "application/json",
        },
      });
      const pricePerGram =
        response.data.price_gram_24k || response.data.price / 31.1035;
      setGoldPricePerGram(pricePerGram);
      return pricePerGram;
    } catch (error) {
      console.error(
        "Error fetching gold price:",
        error.response ? error.response.data : error.message
      );
      return null;
    }
  };

  const handleInvestClick = async (option) => {
    if (option.name === "Gold") {
      const pricePerGram = await fetchGoldPrice();
      if (pricePerGram) setShowGoldModal(true);
      else {
        setGoldSuggestion("Unable to fetch real-time gold price in INR.");
        alert("Unable to fetch real-time gold price in INR.");
      }
    } else if (option.name === "Land") {
      navigate("/home/land");
    } else if (option.name === "Mutual Funds") {
      navigate("/home/mutual-funds");
    } else if (option.name === "Fixed Deposits") {
      navigate("/home/fixed-deposits");
    } else if (option.name === "Stocks") {
      navigate("/home/stocksinvest");
    } else {
      console.log(`Mock investment action: Investing in ${option.name}`);
      alert(`You’ve chosen to explore ${option.name}! (Mock action)`);
    }
  };

  const handleGoldSubmit = (e) => {
    e.preventDefault();
    if (!goldAmount || !goldPricePerGram) return;
    const amountInGrams = parseFloat(goldAmount);
    const totalCost = amountInGrams * goldPricePerGram;
    const mockBudget = 100000;
    const remainingBudget = mockBudget - totalCost;
    const suggestion = `
      You want to buy ${amountInGrams} grams of gold.
      Current price: ₹${goldPricePerGram.toFixed(2)}/gram
      Total cost: ₹${totalCost.toFixed(2)}
      Budget: ₹${mockBudget.toLocaleString()}
      Remaining budget: ₹${remainingBudget.toFixed(2)}
      ${remainingBudget >= 0 ? "You can afford this!" : "Exceeds your budget!"}
    `;
    setGoldSuggestion(suggestion);
    setShowGoldModal(false);
    alert(suggestion);
    setGoldAmount("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black p-8">
      <h2 className="text-4xl font-extrabold text-white mb-4 text-center bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
        Explore Investment Options
      </h2>
      <p className="text-purple-300 mb-8 text-center text-lg">
        Choose an investment that aligns with your financial dreams.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {investmentOptions.map((option) => (
          <div
            key={option.id}
            className="bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 flex flex-col items-center border border-purple-700"
          >
            <div className="mb-6">{option.icon}</div>
            <h3 className="text-2xl font-semibold text-white mb-3">
              {option.name}
            </h3>
            <p className="text-purple-200 text-center mb-4">
              {option.description}
            </p>
            <p className="text-purple-300 font-medium mb-6">
              Expected Returns: {option.returns}
            </p>
            <button
              onClick={() => handleInvestClick(option)}
              className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-purple-800 transition-all duration-200 shadow-md"
            >
              Invest Now
            </button>
            {option.name === "Gold" && goldSuggestion && (
              <p className="text-sm text-purple-300 mt-4 text-center whitespace-pre-line">
                {goldSuggestion}
              </p>
            )}
          </div>
        ))}
      </div>

      {showGoldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-900 to-purple-950 p-8 rounded-xl shadow-2xl max-w-md w-full border border-purple-600 transform transition-all duration-300 scale-100">
            <h3 className="text-3xl font-bold text-white mb-6 text-center bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Invest in Gold
            </h3>
            <p className="text-purple-300 mb-6 text-center">
              Current Price: ₹
              {goldPricePerGram ? goldPricePerGram.toFixed(2) : "Loading..."}
              /gram
            </p>
            <form onSubmit={handleGoldSubmit}>
              <div className="mb-6">
                <label className="block text-purple-200 font-medium mb-2">
                  Amount to Buy (grams)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={goldAmount}
                  onChange={(e) => setGoldAmount(e.target.value)}
                  className="w-full border border-purple-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-800 text-white placeholder-gray-500"
                  placeholder="e.g., 10"
                  required
                />
              </div>
              {goldPricePerGram && goldAmount && (
                <div className="mb-6 text-purple-200">
                  <p>Total Cost: ₹{(goldAmount * goldPricePerGram).toFixed(2)}</p>
                  <p>Mock Budget: ₹1,00,000</p>
                  <p>
                    Remaining: ₹
                    {(100000 - goldAmount * goldPricePerGram).toFixed(2)}
                  </p>
                </div>
              )}
              <div className="flex justify-end gap-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-purple-800 transition-all duration-200"
                >
                  Confirm Investment
                </button>
                <button
                  type="button"
                  onClick={() => setShowGoldModal(false)}
                  className="bg-gray-700 text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investments;