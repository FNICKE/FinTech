import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StocksInvest = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [stocks, setStocks] = useState([]);
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState("");
  const [purchasedStocks, setPurchasedStocks] = useState([]);

  const API_KEY = "V7XGVH9WBWY8A1PE";

  // Fetch the USD to INR exchange rate
  const fetchExchangeRate = async () => {
    try {
      const response = await axios.get(
        "https://api.frankfurter.app/latest?from=USD&to=INR"
      );
      setExchangeRate(response.data.rates.INR);
    } catch (err) {
      console.error("Error fetching exchange rate:", err);
      setExchangeRate(83.5);
      setError("Using fallback exchange rate: 1 USD = 83.5 INR.");
    }
  };

  // Fetch bank accounts
  const fetchBankAccounts = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/bank-accounts",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setBankAccounts(data);
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      setError("Failed to fetch bank accounts.");
    }
  };

  // Fetch purchased stocks
  const fetchPurchasedStocks = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/bank-accounts/stocks",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setPurchasedStocks(data);
    } catch (error) {
      console.error("Error fetching purchased stocks:", error);
      setError("Failed to fetch purchased stocks.");
    }
  };

  useEffect(() => {
    fetchExchangeRate();
    fetchBankAccounts();
    fetchPurchasedStocks();
  }, []);

  const fetchStockSearch = async (query) => {
    if (!query || !exchangeRate) return;
    setLoading(true);
    setChartData({});
    try {
      const searchResponse = await axios.get(
        `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${API_KEY}`
      );
      const searchResults = searchResponse.data.bestMatches || [];
      const formattedStocks = searchResults.map((stock) => ({
        symbol: stock["1. symbol"],
        name: stock["2. name"],
        price: null,
        suggestion: null,
      }));

      const stocksWithData = [];
      for (let i = 0; i < formattedStocks.length; i++) {
        const stock = formattedStocks[i];
        const price = await fetchStockPrice(stock.symbol);
        const suggestion = await fetchAISuggestion(stock.symbol);
        const chart = await fetchChartData(stock.symbol);
        stocksWithData.push({ ...stock, price, suggestion });
        setStocks([...stocksWithData]);
        setChartData((prev) => ({ ...prev, [stock.symbol]: chart }));
        if (i < formattedStocks.length - 1)
          await new Promise((resolve) => setTimeout(resolve, 15000));
      }
      setError(null);
    } catch (err) {
      setError("Failed to fetch stock data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockPrice = async (symbol) => {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
      );
      const priceUSD = response.data["Global Quote"]["05. price"];
      return (parseFloat(priceUSD) * exchangeRate).toFixed(2);
    } catch (err) {
      console.error(`Error fetching price for ${symbol}:`, err);
      return null;
    }
  };

  const fetchAISuggestion = async (symbol) => {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`
      );
      const timeSeries = response.data["Time Series (Daily)"];
      if (!timeSeries) return null;

      const pricesINR = Object.values(timeSeries)
        .slice(0, 5)
        .map((day) => parseFloat(day["4. close"]) * exchangeRate);
      const volumes = Object.values(timeSeries)
        .slice(0, 5)
        .map((day) => parseFloat(day["5. volume"]));

      const avgPrice = pricesINR.reduce((a, b) => a + b, 0) / pricesINR.length;
      const volatility = Math.max(...pricesINR) - Math.min(...pricesINR);
      const trend = pricesINR[0] > pricesINR[pricesINR.length - 1] ? "up" : "down";
      const volumeChange =
        (volumes[0] - volumes[volumes.length - 1]) / volumes[volumes.length - 1];

      let recommendation, reason, risk;
      if (trend === "up" && volatility < 10 * exchangeRate && volumeChange > 0.1) {
        recommendation = "Strong Buy";
        reason = "Upward trend with low volatility and increasing volume.";
        risk = "Low";
      } else if (trend === "down" && volatility > 20 * exchangeRate) {
        recommendation = "Avoid";
        reason = "Downward trend with high volatility.";
        risk = "High";
      } else {
        recommendation = "Hold";
        reason = "No clear trend.";
        risk = "Medium";
      }
      return { recommendation, reason, risk };
    } catch (err) {
      console.error(`Error fetching suggestion for ${symbol}:`, err);
      return null;
    }
  };

  const fetchChartData = async (symbol) => {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`
      );
      const timeSeries = response.data["Time Series (Daily)"];
      if (!timeSeries) return null;

      const labels = Object.keys(timeSeries).slice(0, 7).reverse();
      const pricesINR = labels.map((date) =>
        (parseFloat(timeSeries[date]["4. close"]) * exchangeRate).toFixed(2)
      );

      return {
        labels,
        datasets: [
          {
            label: `${symbol} Price (₹)`,
            data: pricesINR,
            borderColor: "#9333ea", // purple-600
            backgroundColor: "rgba(147, 51, 234, 0.2)", // purple-600 with opacity
            fill: false,
          },
        ],
      };
    } catch (err) {
      console.error(`Error fetching chart data for ${symbol}:`, err);
      return null;
    }
  };

  const handleBuyStock = (stock) => {
    setSelectedStock(stock);
    setShowBuyModal(true);
  };

  const confirmBuyStock = async (e) => {
    e.preventDefault();
    if (!selectedBankAccountId) {
      alert("Please select a bank account.");
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/bank-accounts/buy-stock",
        {
          bankAccountId: selectedBankAccountId,
          stockSymbol: selectedStock.symbol,
          stockName: selectedStock.name,
          amount: parseFloat(selectedStock.price),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setBankAccounts(
        bankAccounts.map((account) =>
          account._id === selectedBankAccountId
            ? { ...account, balance: data.updatedAccount.balance }
            : account
        )
      );
      await fetchPurchasedStocks();
      setShowBuyModal(false);
      setSelectedBankAccountId("");
      setSelectedStock(null);
      alert(`Successfully purchased ${selectedStock.name}!`);
    } catch (error) {
      alert("Error purchasing stock: " + error.response?.data?.error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStockSearch(searchQuery);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { color: "#e9d5ff" } }, // purple-200
      title: {
        display: true,
        text: "Stock Price (Last 7 Days) in ₹",
        color: "#e9d5ff", // purple-200
        font: { size: 16 },
      },
      tooltip: { backgroundColor: "#6b21a8" }, // purple-800
    },
    scales: {
      x: { ticks: { color: "#d8b4fe" } }, // purple-200
      y: { ticks: { color: "#d8b4fe" } }, // purple-200
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black p-6 text-white font-sans">
      <h2 className="text-4xl font-extrabold text-transparent bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text mb-8 text-center tracking-tight drop-shadow-md">
        Stocks Invest Dashboard
      </h2>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a stock (e.g., AAPL, TSLA)"
            className="w-full px-4 py-3 bg-gray-900 border border-purple-500/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-gray-400 transition duration-200"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-purple-600 hover:to-indigo-700 transition duration-200"
          >
            Search
          </button>
        </div>
      </form>

      {loading && (
        <p className="text-center text-purple-200 text-lg animate-pulse">Loading...</p>
      )}
      {error && (
        <p className="text-center text-red-400 text-lg font-medium">{error}</p>
      )}

      {/* Purchased Stocks */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-sm">
          Your Portfolio
        </h3>
        {purchasedStocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {purchasedStocks.map((stock) => (
              <div
                key={stock._id}
                className="bg-gradient-to-br from-gray-900 to-purple-950 rounded-2xl shadow-lg border border-purple-500/30 p-4 hover:shadow-2xl transition-all duration-300"
              >
                <h4 className="text-lg font-semibold text-white">{stock.name}</h4>
                <p className="text-purple-100">Symbol: {stock.symbol}</p>
                <p className="text-purple-100">Quantity: {stock.quantity}</p>
                <p className="text-purple-100">
                  Purchase Price: ₹{stock.purchasePrice.toFixed(2)}
                </p>
                <p className="text-purple-100">
                  Date: {new Date(stock.purchaseDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-purple-200 text-center">
            You haven't purchased any stocks yet.
          </p>
        )}
      </div>

      {/* Stock Search Results */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-sm">
          Search Results
        </h3>
        {stocks.length > 0 ? (
          <div className="space-y-6">
            {stocks.map((stock, index) => (
              <div
                key={stock.symbol}
                className="bg-gradient-to-br from-gray-900 to-purple-950 rounded-2xl shadow-lg border border-purple-500/30 h-[40vh] flex flex-col md:flex-row overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                {index % 2 === 0 ? (
                  <>
                    {/* Left: Info */}
                    <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h4 className="text-xl font-semibold text-white">{stock.name}</h4>
                        <p className="text-purple-100">Symbol: {stock.symbol}</p>
                        <p className="text-purple-400 font-medium">
                          Price: ₹{stock.price || "Fetching..."}
                        </p>
                        {stock.suggestion ? (
                          <div className="text-sm text-purple-100">
                            <p>
                              <strong className="text-purple-400">Recommendation:</strong>{" "}
                              <span
                                className={
                                  stock.suggestion.recommendation.includes("Buy")
                                    ? "text-green-400"
                                    : stock.suggestion.recommendation.includes("Avoid")
                                    ? "text-red-400"
                                    : "text-yellow-400"
                                }
                              >
                                {stock.suggestion.recommendation}
                              </span>
                            </p>
                            <p>
                              <strong className="text-purple-400">Reason:</strong>{" "}
                              {stock.suggestion.reason}
                            </p>
                            <p>
                              <strong className="text-purple-400">Risk:</strong>{" "}
                              <span
                                className={
                                  stock.suggestion.risk === "Low"
                                    ? "text-green-400"
                                    : stock.suggestion.risk === "High"
                                    ? "text-red-400"
                                    : "text-yellow-400"
                                }
                              >
                                {stock.suggestion.risk}
                              </span>
                            </p>
                          </div>
                        ) : (
                          <p className="text-purple-200 text-sm">Loading suggestion...</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleBuyStock(stock)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full hover:from-purple-600 hover:to-indigo-700 transition duration-200 text-sm font-medium shadow-md"
                        disabled={!stock.price}
                      >
                        Buy
                      </button>
                    </div>
                    {/* Right: Graph */}
                    <div className="w-full md:w-1/2 p-4">
                      {chartData[stock.symbol] ? (
                        <Line data={chartData[stock.symbol]} options={chartOptions} />
                      ) : (
                        <p className="text-purple-200 text-center">Loading chart...</p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Left: Graph */}
                    <div className="w-full md:w-1/2 p-4">
                      {chartData[stock.symbol] ? (
                        <Line data={chartData[stock.symbol]} options={chartOptions} />
                      ) : (
                        <p className="text-purple-200 text-center">Loading chart...</p>
                      )}
                    </div>
                    {/* Right: Info */}
                    <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h4 className="text-xl font-semibold text-white">{stock.name}</h4>
                        <p className="text-purple-100">Symbol: {stock.symbol}</p>
                        <p className="text-purple-400 font-medium">
                          Price: ₹{stock.price || "Fetching..."}
                        </p>
                        {stock.suggestion ? (
                          <div className="text-sm text-purple-100">
                            <p>
                              <strong className="text-purple-400">Recommendation:</strong>{" "}
                              <span
                                className={
                                  stock.suggestion.recommendation.includes("Buy")
                                    ? "text-green-400"
                                    : stock.suggestion.recommendation.includes("Avoid")
                                    ? "text-red-400"
                                    : "text-yellow-400"
                                }
                              >
                                {stock.suggestion.recommendation}
                              </span>
                            </p>
                            <p>
                              <strong className="text-purple-400">Reason:</strong>{" "}
                              {stock.suggestion.reason}
                            </p>
                            <p>
                              <strong className="text-purple-400">Risk:</strong>{" "}
                              <span
                                className={
                                  stock.suggestion.risk === "Low"
                                    ? "text-green-400"
                                    : stock.suggestion.risk === "High"
                                    ? "text-red-400"
                                    : "text-yellow-400"
                                }
                              >
                                {stock.suggestion.risk}
                              </span>
                            </p>
                          </div>
                        ) : (
                          <p className="text-purple-200 text-sm">Loading suggestion...</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleBuyStock(stock)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full hover:from-purple-600 hover:to-indigo-700 transition duration-200 text-sm font-medium shadow-md"
                        disabled={!stock.price}
                      >
                        Buy
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-purple-200 text-center">
            No stocks found. Try searching for a stock symbol.
          </p>
        )}
      </div>

      {/* Buy Stock Modal */}
      {showBuyModal && selectedStock && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
          <div className="bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-lg border border-purple-500/30 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4 text-center drop-shadow-sm">
              Buy {selectedStock.name} ({selectedStock.symbol})
            </h3>
            <p className="text-purple-100 mb-4">Price: ₹{selectedStock.price}</p>
            <form onSubmit={confirmBuyStock}>
              <div className="mb-4">
                <label className="block text-purple-100 font-medium mb-2">
                  Select Bank Account
                </label>
                <select
                  value={selectedBankAccountId}
                  onChange={(e) => setSelectedBankAccountId(e.target.value)}
                  className="w-full p-3 bg-gray-900 border border-purple-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-white"
                  required
                >
                  <option value="">-- Select a bank account --</option>
                  {bankAccounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.name} (₹{account.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-indigo-700 transition duration-200 shadow-md"
                >
                  Confirm Purchase
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBuyModal(false);
                    setSelectedBankAccountId("");
                    setSelectedStock(null);
                  }}
                  className="bg-gray-700 text-white px-6 py-2 rounded-full hover:bg-gray-600 transition duration-200 shadow-md"
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

export default StocksInvest;