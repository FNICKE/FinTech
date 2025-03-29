import { useState } from "react";
import { useNavigate } from "react-router-dom";

const fdRates = {
  SBI: { "1 Year": 6.8, "3 Years": 6.9, "5 Years": 6.5 },
  "HDFC Bank": { "1 Year": 6.6, "3 Years": 7.0, "5 Years": 6.8 },
  "ICICI Bank": { "1 Year": 6.7, "3 Years": 7.0, "5 Years": 6.9 },
  "Post Office": { "1 Year": 6.9, "3 Years": 7.1, "5 Years": 7.0 },
};

const FixedDeposits = () => {
  const [principal, setPrincipal] = useState("");
  const [tenure, setTenure] = useState("1 Year");
  const [bank, setBank] = useState("SBI");
  const [suggestion, setSuggestion] = useState("");
  const navigate = useNavigate();

  const calculateFD = () => {
    const principalAmount = parseFloat(principal);
    if (!principalAmount || principalAmount <= 0) return;

    const rate = fdRates[bank][tenure] / 100;
    const tenureYears = parseInt(tenure.split(" ")[0]);
    const maturityAmount = principalAmount * Math.pow(1 + rate, tenureYears);
    const interestEarned = maturityAmount - principalAmount;

    const suggestionText = `
      Bank: ${bank}
      Principal Amount: ₹${principalAmount.toLocaleString()}
      Tenure: ${tenure}
      Interest Rate: ${fdRates[bank][tenure]}% p.a.
      Maturity Amount: ₹${maturityAmount.toFixed(2)}
      Interest Earned: ₹${interestEarned.toFixed(2)}
    `;
    setSuggestion(suggestionText);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateFD();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black p-8">
      <h2 className="text-5xl font-extrabold text-white mb-6 text-center bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
        Fixed Deposits
      </h2>
      <p className="text-purple-200 mb-10 text-center text-xl max-w-2xl mx-auto">
        Calculate your FD returns and plan your investments wisely.
      </p>

      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
        {/* Sidebar with FD Tips */}
        <div className="lg:w-1/3 bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30">
          <h3 className="text-2xl font-semibold text-white mb-4">
            Fixed Deposit Tips
          </h3>
          <ul className="text-purple-100 space-y-4">
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span> Compare interest rates across banks.
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span> Opt for longer tenures for higher returns.
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span> Check for premature withdrawal penalties.
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span> Consider tax-saving FDs for dual benefits.
            </li>
          </ul>
          <div className="mt-6">
            <h4 className="text-xl font-semibold text-white mb-2">
              Why Fixed Deposits?
            </h4>
            <p className="text-purple-200 text-sm">
              FDs offer guaranteed returns and capital safety, making them a low-risk investment option for conservative investors.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-2/3">
          {/* FD Input Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-gradient-to-br from-gray-900 to-purple-950 p-8 rounded-2xl shadow-xl border border-purple-500/30 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-purple-100 font-medium mb-2">
                  Principal Amount (₹)
                </label>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="w-full border border-purple-500/50 p-3 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-400"
                  placeholder="e.g., 100000"
                  min="1000"
                  required
                />
              </div>
              <div>
                <label className="block text-purple-100 font-medium mb-2">
                  Tenure
                </label>
                <select
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value)}
                  className="w-full border border-purple-500/50 p-3 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="1 Year">1 Year</option>
                  <option value="3 Years">3 Years</option>
                  <option value="5 Years">5 Years</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-purple-100 font-medium mb-2">
                  Bank
                </label>
                <select
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="w-full border border-purple-500/50 p-3 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="SBI">SBI</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Post Office">Post Office</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-full hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
              >
                Calculate
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

          {/* FD Suggestion */}
          {suggestion && (
            <div className="bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30 mb-8 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-2xl font-semibold text-white mb-4 text-center">
                FD Investment Details
              </h3>
              <p className="text-purple-100 whitespace-pre-line">{suggestion}</p>
            </div>
          )}

          {/* Additional Content: FD Rates Comparison */}
          <div className="bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30">
            <h3 className="text-2xl font-semibold text-white mb-4">
              FD Rates Comparison
            </h3>
            <p className="text-purple-200 mb-4">
              Current interest rates across popular institutions:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(fdRates).map(([bankName, rates]) => (
                <div
                  key={bankName}
                  className="bg-gray-800 p-4 rounded-lg border border-purple-500/20 hover:bg-gray-700 transition-all duration-200"
                >
                  <h4 className="text-lg font-semibold text-white">{bankName}</h4>
                  <p className="text-purple-100 text-sm">
                    1 Year: {rates["1 Year"]}%
                  </p>
                  <p className="text-purple-100 text-sm">
                    3 Years: {rates["3 Years"]}%
                  </p>
                  <p className="text-purple-100 text-sm">
                    5 Years: {rates["5 Years"]}%
                  </p>
                  <button
                    onClick={() => {
                      setBank(bankName);
                      calculateFD();
                    }}
                    className="mt-2 text-sm text-purple-400 hover:text-purple-300 underline"
                  >
                    Use This Bank
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

export default FixedDeposits;