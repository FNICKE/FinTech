import { useState } from "react";
import { useNavigate } from "react-router-dom";

const landPrices = {
  Mumbai: { avg: 50000, range: "45,000-55,000" },
  Delhi: { avg: 35000, range: "30,000-40,000" },
  Bangalore: { avg: 25000, range: "22,000-28,000" },
  Hyderabad: { avg: 18000, range: "15,000-20,000" },
  Chennai: { avg: 22000, range: "18,000-24,000" },
  Pune: { avg: 20000, range: "18,000-22,000" },
  Kolkata: { avg: 15000, range: "12,000-18,000" },
  Ahmedabad: { avg: 12000, range: "10,000-14,000" },
  Jaipur: { avg: 10000, range: "8,000-12,000" },
  Lucknow: { avg: 9000, range: "7,500-10,000" },
  Gurgaon: { avg: 28000, range: "25,000-32,000" },
  Noida: { avg: 25000, range: "22,000-28,000" },
  Chandigarh: { avg: 14000, range: "12,000-16,000" },
  Indore: { avg: 11000, range: "9,000-12,000" },
  Bhopal: { avg: 9000, range: "8,000-10,000" },
  Nagpur: { avg: 8500, range: "7,500-9,000" },
  Coimbatore: { avg: 12500, range: "10,000-14,000" },
  Visakhapatnam: { avg: 13500, range: "12,000-15,000" },
  Surat: { avg: 11000, range: "9,500-12,500" },
  Patna: { avg: 8000, range: "7,000-9,000" },
  Thane: { avg: 16000, range: "14,000-18,000" },
  "Navi Mumbai": { avg: 18000, range: "16,000-20,000" },
  Vadodara: { avg: 10500, range: "9,000-12,000" },
  Ludhiana: { avg: 8500, range: "7,000-9,500" },
  Kanpur: { avg: 7500, range: "6,500-8,000" },
  Varanasi: { avg: 7000, range: "6,000-7,500" },
  Ranchi: { avg: 6000, range: "5,000-7,000" },
  Bhubaneswar: { avg: 6500, range: "6,000-7,500" },
  Raipur: { avg: 6000, range: "5,500-7,000" },
  Dehradun: { avg: 7000, range: "6,500-8,000" },
  Guwahati: { avg: 5000, range: "4,500-6,000" },
  Mysore: { avg: 9500, range: "8,500-10,500" },
  Jodhpur: { avg: 8500, range: "7,500-9,500" },
  Amritsar: { avg: 9000, range: "8,000-10,000" },
  Meerut: { avg: 8000, range: "7,000-9,000" },
  Agra: { avg: 7500, range: "6,500-8,500" },
  Nashik: { avg: 9200, range: "8,500-9,800" },
  Rajkot: { avg: 8800, range: "8,000-9,500" },
  Aurangabad: { avg: 8600, range: "7,800-9,200" },
  Jabalpur: { avg: 7800, range: "7,000-8,500" },
};

const Land = () => {
  const [landLocation, setLandLocation] = useState("");
  const [landSuggestion, setLandSuggestion] = useState(null);
  const navigate = useNavigate();

  const handleLandSubmit = (e) => {
    e.preventDefault();
    if (!landLocation) return;

    const location =
      landLocation.trim().charAt(0).toUpperCase() +
      landLocation.trim().slice(1).toLowerCase();
    const landData = landPrices[location];
    const sqFtPerAcre = 43560;
    const budget = 1000000;

    if (landData) {
      const pricePerAcre = landData.avg * sqFtPerAcre;
      const remainingBudget = budget - pricePerAcre;
      setLandSuggestion({
        location,
        avgPrice: landData.avg,
        range: landData.range,
        pricePerAcre,
        remainingBudget,
        canAfford: remainingBudget >= 0,
      });
    } else {
      setLandSuggestion("Location not found in the database.");
    }
    setLandLocation("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black p-8">
      <h2 className="text-5xl font-extrabold text-white mb-6 text-center bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
        Invest in Land
      </h2>
      <p className="text-purple-200 mb-10 text-center text-xl max-w-2xl mx-auto">
        Explore land investment opportunities across India with real-time pricing insights.
      </p>

      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
        {/* Sidebar with Investment Tips */}
        <div className="lg:w-1/3 bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30">
          <h3 className="text-2xl font-semibold text-white mb-4">
            Land Investment Tips
          </h3>
          <ul className="text-purple-100 space-y-4">
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span> Research local development plans for future value growth.
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span> Verify land titles and legal clearances before buying.
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span> Consider proximity to urban centers for higher returns.
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span> Diversify by investing in multiple locations.
            </li>
          </ul>
          <div className="mt-6">
            <h4 className="text-xl font-semibold text-white mb-2">Why Invest in Land?</h4>
            <p className="text-purple-200 text-sm">
              Land is a tangible asset with potential for long-term appreciation. Unlike stocks, it’s less volatile and offers opportunities for development or resale.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-2/3">
          {/* Land Input Form */}
          <form
            onSubmit={handleLandSubmit}
            className="bg-gradient-to-br from-gray-900 to-purple-950 p-8 rounded-2xl shadow-xl border border-purple-500/30 mb-8"
          >
            <div className="mb-6">
              <label className="block text-purple-100 font-medium mb-2">
                City Name (e.g., Mumbai)
              </label>
              <input
                type="text"
                value={landLocation}
                onChange={(e) => setLandLocation(e.target.value)}
                className="w-full border border-purple-500/50 p-3 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-400"
                placeholder="Enter city name"
                required
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-full hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
              >
                Check Rates
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

          {/* Land Suggestion */}
          {landSuggestion && (
            <div className="bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30 mb-8 hover:shadow-2xl transition-all duration-300">
              {typeof landSuggestion === "string" ? (
                <p className="text-red-400 text-center font-medium">
                  {landSuggestion}
                </p>
              ) : (
                <>
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    {landSuggestion.location} - Investment Details
                  </h3>
                  <div className="text-purple-100 space-y-3">
                    <p>
                      <span className="font-semibold text-purple-400">Avg Price:</span> ₹
                      {landSuggestion.avgPrice.toLocaleString()}/sq.ft
                    </p>
                    <p>
                      <span className="font-semibold text-purple-400">Price Range:</span>{" "}
                      {landSuggestion.range}
                    </p>
                    <p>
                      <span className="font-semibold text-purple-400">Price per Acre:</span> ₹
                      {landSuggestion.pricePerAcre.toLocaleString()}
                    </p>
                    <p>
                      <span className="font-semibold text-purple-400">Budget:</span> ₹1,000,000
                    </p>
                    <p
                      className={`font-semibold ${
                        landSuggestion.canAfford ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {landSuggestion.canAfford
                        ? `✅ Affordable! Remaining: ₹${landSuggestion.remainingBudget.toLocaleString()}`
                        : `❌ Over Budget by ₹${(-landSuggestion.remainingBudget).toLocaleString()}`}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Additional Content: Top Investment Cities */}
          <div className="bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30">
            <h3 className="text-2xl font-semibold text-white mb-4">
              Top Investment Cities
            </h3>
            <p className="text-purple-200 mb-4">
              Based on growth potential and current market trends:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { city: "Mumbai", avg: 50000, growth: "High" },
                { city: "Bangalore", avg: 25000, growth: "Very High" },
                { city: "Gurgaon", avg: 28000, growth: "High" },
                { city: "Hyderabad", avg: 18000, growth: "Moderate" },
              ].map((item) => (
                <div
                  key={item.city}
                  className="bg-gray-800 p-4 rounded-lg border border-purple-500/20 hover:bg-gray-700 transition-all duration-200"
                >
                  <h4 className="text-lg font-semibold text-white">{item.city}</h4>
                  <p className="text-purple-100 text-sm">
                    Avg: ₹{item.avg.toLocaleString()}/sq.ft
                  </p>
                  <p className="text-purple-200 text-sm">Growth: {item.growth}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Land;