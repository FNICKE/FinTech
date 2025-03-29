import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MutualFunds = () => {
  const [schemeCode, setSchemeCode] = useState("");
  const [fundData, setFundData] = useState(null);
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchFundData = async (code) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://api.mfapi.in/mf/${code}`);
      const data = response.data;
      setFundData(data);

      const latestNav = parseFloat(data.data[0].nav);
      const mockBudget = 100000;
      const unitsAffordable = mockBudget / latestNav;
      const suggestionText = `
        Scheme: ${data.meta.scheme_name}
        Latest NAV: ₹${latestNav.toFixed(2)} (as of ${data.data[0].date})
        Budget: ₹${mockBudget.toLocaleString()}
        Units Affordable: ${unitsAffordable.toFixed(2)}
        Category: ${data.meta.scheme_category}
        Type: ${data.meta.scheme_type}
      `;
      setSuggestion(suggestionText);
    } catch (error) {
      setSuggestion("Invalid scheme code or data unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!schemeCode) return;
    fetchFundData(schemeCode);
    setSchemeCode("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black p-8">
      <h2 className="text-5xl font-extrabold text-white mb-6 text-center bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
        Mutual Funds
      </h2>
      <p className="text-purple-200 mb-10 text-center text-xl max-w-2xl mx-auto">
        Discover mutual fund investment options with real-time NAV insights.
      </p>

      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
        {/* Sidebar with Investment Tips */}
        <div className="lg:w-1/3 bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30">
          <h3 className="text-2xl font-semibold text-white mb-4">
            Mutual Fund Tips
          </h3>
          <ul className="text-purple-100 space-y-4">
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span> Choose funds based on your risk appetite.
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span> Diversify across equity, debt, and hybrid funds.
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span> Check past performance and fund manager track record.
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span> Consider SIPs for disciplined investing.
            </li>
          </ul>
          <div className="mt-6">
            <h4 className="text-xl font-semibold text-white mb-2">
              Why Mutual Funds?
            </h4>
            <p className="text-purple-200 text-sm">
              Mutual funds offer professional management, diversification, and liquidity, making them ideal for both new and seasoned investors.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-2/3">
          {/* Fund Input Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-gradient-to-br from-gray-900 to-purple-950 p-8 rounded-2xl shadow-xl border border-purple-500/30 mb-8"
          >
            <div className="mb-6">
              <label className="block text-purple-100 font-medium mb-2">
                Scheme Code (e.g., 120594)
              </label>
              <input
                type="text"
                value={schemeCode}
                onChange={(e) => setSchemeCode(e.target.value)}
                className="w-full border border-purple-500/50 p-3 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-400"
                placeholder="Enter scheme code"
                required
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-full hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
                disabled={loading}
              >
                {loading ? "Loading..." : "Check Fund"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/investments")}
                className="bg-gray-700 text-white px-6 py-3 rounded-full hover:bg-gray-600 transition-all duration-200 shadow-lg"
              >
                Back to Investments
              </button>
            </div>
          </form>

          {/* Fund Suggestion */}
          {suggestion && (
            <div className="bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30 mb-8 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-2xl font-semibold text-white mb-4 text-center">
                Investment Suggestion
              </h3>
              <p className="text-purple-100 whitespace-pre-line">
                {suggestion.includes("Invalid") ? (
                  <span className="text-red-400">{suggestion}</span>
                ) : (
                  suggestion
                )}
              </p>
            </div>
          )}

          {/* Additional Content: Popular Mutual Funds */}
          <div className="bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30">
            <h3 className="text-2xl font-semibold text-white mb-4">
              Popular Mutual Funds
            </h3>
            <p className="text-purple-200 mb-4">
              Explore some top-performing mutual funds in India:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: "SBI Bluechip Fund", code: "103504", category: "Large Cap" },
                { name: "HDFC Mid-Cap Opportunities", code: "118933", category: "Mid Cap" },
                { name: "Mirae Asset Large Cap", code: "118825", category: "Large Cap" },
                { name: "Axis Long Term Equity", code: "112277", category: "ELSS" },
              ].map((fund) => (
                <div
                  key={fund.code}
                  className="bg-gray-800 p-4 rounded-lg border border-purple-500/20 hover:bg-gray-700 transition-all duration-200"
                >
                  <h4 className="text-lg font-semibold text-white">{fund.name}</h4>
                  <p className="text-purple-100 text-sm">Code: {fund.code}</p>
                  <p className="text-purple-200 text-sm">Category: {fund.category}</p>
                  <button
                    onClick={() => {
                      setSchemeCode(fund.code);
                      fetchFundData(fund.code);
                    }}
                    className="mt-2 text-sm text-purple-400 hover:text-purple-300 underline"
                  >
                    Check Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MutualFunds;