import React, { useState, useEffect } from "react";
import axios from "axios";

const AISuggestions = ({ stocks, API_KEY }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAISuggestions = async () => {
    setLoading(true);
    try {
      const aiResults = await Promise.all(
        stocks.map(async (stock) => {
          const response = await axios.get(
            `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stock.symbol}&apikey=${API_KEY}`
          );
          const timeSeries = response.data["Time Series (Daily)"];
          if (!timeSeries) return null;

          const prices = Object.values(timeSeries)
            .slice(0, 5)
            .map((day) => parseFloat(day["4. close"]));
          const volumes = Object.values(timeSeries)
            .slice(0, 5)
            .map((day) => parseFloat(day["5. volume"]));

          const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
          const volatility = Math.max(...prices) - Math.min(...prices);
          const trend = prices[0] > prices[prices.length - 1] ? "up" : "down";
          const priceVsAvg = prices[0] > avgPrice ? "above" : "below";
          const volumeChange =
            (volumes[0] - volumes[volumes.length - 1]) / volumes[volumes.length - 1];

          let recommendation, reason, risk;
          if (trend === "up" && volatility < 10 && volumeChange > 0.1) {
            recommendation = "Strong Buy";
            reason =
              "Consistent upward trend with low volatility and increasing trading volume, indicating strong investor interest.";
            risk = "Low";
          } else if (trend === "up" && volatility < 15 && priceVsAvg === "above") {
            recommendation = "Buy";
            reason =
              "Moderate upward trend with prices above the 5-day average, suggesting positive momentum.";
            risk = "Low to Medium";
          } else if (trend === "down" && volatility > 20 && volumeChange < -0.2) {
            recommendation = "Strong Avoid";
            reason =
              "Sharp downward trend with high volatility and declining volume, signaling potential sell-off or lack of support.";
            risk = "High";
          } else if (trend === "down" && priceVsAvg === "below") {
            recommendation = "Avoid";
            reason =
              "Downward trend with prices below the 5-day average, indicating weak performance.";
            risk = "Medium to High";
          } else if (volatility > 25) {
            recommendation = "Hold";
            reason =
              "High volatility detected, making it risky for immediate action; monitor for stabilization.";
            risk = "High";
          } else if (trend === "up" && volatility > 15) {
            recommendation = "Cautious Buy";
            reason =
              "Upward trend but with significant volatility, suggesting potential gains with higher risk.";
            risk = "Medium to High";
          } else {
            recommendation = "Neutral";
            reason =
              "No clear trend or significant movement; further analysis or longer-term data may be needed.";
            risk = "Medium";
          }

          return {
            symbol: stock.symbol,
            name: stock.name,
            recommendation,
            reason,
            risk,
            metrics: {
              currentPrice: prices[0].toFixed(2),
              avgPrice: avgPrice.toFixed(2),
              volatility: volatility.toFixed(2),
              volumeChange: (volumeChange * 100).toFixed(2) + "%",
            },
          };
        })
      );

      setSuggestions(aiResults.filter((result) => result !== null));
      setError(null);
    } catch (err) {
      setError("Failed to fetch AI suggestions.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stocks.length > 0) {
      fetchAISuggestions();
    }
  }, [stocks]);

  return (
    <div className="mb-8">
      <h3 className="text-2xl font-bold text-blue-300 mb-4">
        AI Stock Suggestions
      </h3>
      {loading && (
        <p className="text-gray-400 text-center">Loading AI suggestions...</p>
      )}
      {error && (
        <p className="text-red-500 text-center font-medium">{error}</p>
      )}
      {suggestions.length > 0 ? (
        <ul className="space-y-6">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.symbol}
              className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800 hover:shadow-xl transition duration-300"
            >
              <p className="text-xl font-semibold text-white mb-2">
                {suggestion.symbol}: {suggestion.name}
              </p>
              <p className="text-gray-300">
                <strong className="font-medium text-blue-400">Recommendation:</strong>{" "}
                <span
                  className={
                    suggestion.recommendation.includes("Buy")
                      ? "text-blue-500"
                      : suggestion.recommendation.includes("Avoid")
                      ? "text-red-500"
                      : "text-gray-400"
                  }
                >
                  {suggestion.recommendation}
                </span>
              </p>
              <p className="text-gray-300">
                <strong className="font-medium text-blue-400">Reason:</strong>{" "}
                {suggestion.reason}
              </p>
              <p className="text-gray-300">
                <strong className="font-medium text-blue-400">Risk Level:</strong>{" "}
                <span
                  className={
                    suggestion.risk === "Low"
                      ? "text-blue-500"
                      : suggestion.risk === "High"
                      ? "text-red-500"
                      : "text-yellow-400"
                  }
                >
                  {suggestion.risk}
                </span>
              </p>
              <p className="text-gray-300">
                <strong className="font-medium text-blue-400">Current Price:</strong> $
                {suggestion.metrics.currentPrice}
              </p>
              <p className="text-gray-300">
                <strong className="font-medium text-blue-400">5-Day Avg Price:</strong> $
                {suggestion.metrics.avgPrice}
              </p>
              <p className="text-gray-300">
                <strong className="font-medium text-blue-400">Volatility (5-Day Range):</strong> $
                {suggestion.metrics.volatility}
              </p>
              <p className="text-gray-300">
                <strong className="font-medium text-blue-400">Volume Change (5-Day):</strong>{" "}
                {suggestion.metrics.volumeChange}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 text-center">
          No AI suggestions available yet. Search for stocks to get recommendations.
        </p>
      )}
    </div>
  );
};

export default AISuggestions;