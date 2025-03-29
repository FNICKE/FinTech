const axios = require("axios");

const API_KEY = "your-exchangerate-api-key"; // Replace with your API key
const BASE_URL = "https://v6.exchangerate-api.com/v6";

// Cache exchange rates to avoid repeated API calls (valid for 24 hours)
let exchangeRatesCache = {};
let lastFetchDate = null;

const fetchExchangeRates = async (baseCurrency = "INR") => {
  const today = new Date().toISOString().split("T")[0];

  // Use cached rates if they were fetched today
  if (lastFetchDate === today && exchangeRatesCache[baseCurrency]) {
    return exchangeRatesCache[baseCurrency];
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/${API_KEY}/latest/${baseCurrency}`
    );
    if (response.data.result !== "success") {
      throw new Error("Failed to fetch exchange rates");
    }

    exchangeRatesCache[baseCurrency] = response.data.conversion_rates;
    lastFetchDate = today;
    return exchangeRatesCache[baseCurrency];
  } catch (error) {
    console.error("Error fetching exchange rates:", error.message);
    throw error;
  }
};

const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount;

  try {
    const rates = await fetchExchangeRates(fromCurrency);
    const rate = rates[toCurrency];
    if (!rate) {
      throw new Error(`Exchange rate for ${toCurrency} not found`);
    }
    return amount * rate;
  } catch (error) {
    console.error(
      `Error converting ${amount} from ${fromCurrency} to ${toCurrency}:`,
      error.message
    );
    throw error;
  }
};

module.exports = { convertCurrency };
