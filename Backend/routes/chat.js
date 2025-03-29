const express = require("express");
const Together = require("together-ai");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const router = express.Router();
const together = new Together({ apiKey: process.env.TOGETHER_AI_API_KEY });

// Helper functions updated based on your backend files
const fetchIncomeTotal = async (token) => {
  try {
    const res = await axios.get("http://localhost:5000/api/incomes/total", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.totalIncome || 0;
  } catch (error) {
    console.error("Error fetching total income:", error.message);
    return null;
  }
};

const fetchIncomeRecords = async (token) => {
  try {
    const res = await axios.get("http://localhost:5000/api/incomes", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.income || [];
  } catch (error) {
    console.error("Error fetching income records:", error.message);
    return [];
  }
};

const fetchBankAccounts = async (token) => {
  try {
    const res = await axios.get("http://localhost:5000/api/bank-accounts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data || [];
  } catch (error) {
    console.error("Error fetching bank accounts:", error.message);
    return [];
  }
};

const fetchExpenditures = async (token) => {
  try {
    const res = await axios.get("http://localhost:5000/api/transactions", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.filter(t => t.type === "expense") || []; // Assumes Transaction model has 'type'
  } catch (error) {
    console.error("Error fetching expenditures:", error.message);
    return [];
  }
};

const fetchTaxSummary = async (token) => {
  try {
    const res = await axios.get("http://localhost:5000/api/tax/summary", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // Adjust based on your actual tax summary response
  } catch (error) {
    console.error("Error fetching tax summary:", error.message);
    return null;
  }
};

const fetchFinancialHealth = async (token, income, expenses, totalDebt, dti) => {
  try {
    const res = await axios.post("http://localhost:5000/api/financial-health", 
      { income, expenses, totalDebt, dti }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.score; // Returns { score: number }
  } catch (error) {
    console.error("Error fetching financial health:", error.message);
    return null;
  }
};

const fetchFraudAlerts = async (token) => {
  try {
    const res = await axios.get("http://localhost:5000/api/fraud/alerts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // Returns array of alerts
  } catch (error) {
    console.error("Error fetching fraud alerts:", error.message);
    return [];
  }
};

const fetchLoans = async (token) => {
  try {
    const res = await axios.get("http://localhost:5000/api/loans", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // Returns array of loans
  } catch (error) {
    console.error("Error fetching loans:", error.message);
    return [];
  }
};

const fetchDTI = async (token, income) => {
  try {
    const res = await axios.post("http://localhost:5000/api/loans/dti", 
      { income }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.dti; // Returns { dti: number }
  } catch (error) {
    console.error("Error fetching DTI:", error.message);
    return null;
  }
};

const fetchOptimizedLoans = async (token) => {
  try {
    const res = await axios.post("http://localhost:5000/api/loans/optimize", {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.optimizedLoans; // Returns sorted array of loans
  } catch (error) {
    console.error("Error fetching optimized loans:", error.message);
    return [];
  }
};

const fetchUserProfile = async (token) => {
  try {
    const res = await axios.get("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // Returns { id, name, email }
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    return null;
  }
};

// Updated intents array
const intents = [
  // User Registration and Login
  {
    intent: "user_registration",
    keywords: ["register", "sign up", "create account", "new account", "join", "open account", "get started", "signing up", "make an account"],
    response: "Ready to start? Register at '/auth/register' with your name, email, and password. Need help?"
  },
  {
    intent: "user_login",
    keywords: ["login", "sign in", "access account", "log into", "my profile", "account access", "open my account", "enter account", "log back in"],
    response: "Log in at '/auth/login' with your email and password. Forgot your password? I can help reset it!"
  },

  // Bank Account Related Intents
  {
    intent: "view_bank_account",
    keywords: ["bank account", "balance", "how much", "my funds", "my money", "check balance", "view my savings", "account summary", "my cash"],
    response: async (token) => {
      const accounts = await fetchBankAccounts(token);
      return accounts.length 
        ? `You have ${accounts.length} account(s): ${accounts.map(a => `${a.name} - ₹${a.balance}`).join(", ")}. See details at '/bank-accounts'!`
        : "No bank accounts linked yet. Add one at '/bank-accounts/add'!";
    }
  },
  {
    intent: "add_funds",
    keywords: ["deposit", "add money", "put money", "fund my account", "increase balance", "transfer money", "add savings", "load funds", "money in"],
    response: "Add funds by logging income at '/incomes' (e.g., ₹5000 from 'Salary'). Link it to a bank account!"
  },
  {
    intent: "deduct_funds",
    keywords: ["withdraw", "take out money", "reduce balance", "remove money", "cash out", "transfer out", "spend money", "money out", "decrease balance"],
    response: async (token) => {
      const accounts = await fetchBankAccounts(token);
      return accounts.length 
        ? `Deduct funds at '/bank-accounts/deduct'. Balances: ${accounts.map(a => `${a.name}: ₹${a.balance}`).join(", ")}.`
        : "No accounts to deduct from. Add one at '/bank-accounts/add'!";
    }
  },

  // Income Related Intents
  {
    intent: "view_income",
    keywords: ["income", "earnings", "salary", "my paycheck", "money earned", "view my income", "my wage", "salary details", "payment received"],
    response: async (token) => {
      const totalIncome = await fetchIncomeTotal(token);
      const incomeRecords = await fetchIncomeRecords(token);
      return totalIncome !== null && incomeRecords.length
        ? `Total income: ₹${totalIncome}. Recent: ${incomeRecords.slice(0, 2).map(i => `${i.source}: ₹${i.amount}`).join(", ")}. More at '/incomes'!`
        : "No income yet. Add some at '/incomes'!";
    }
  },
  {
    intent: "reset_income",
    keywords: ["reset income", "clear income", "delete income record", "remove my earnings", "restart earnings", "clear salary data", "reset wage data"],
    response: "Reset your income history at '/incomes/reset'. This clears everything—are you sure?"
  },

  // Expenditure/Transaction Related Intents
  {
    intent: "add_expenditure",
    keywords: ["expense", "track spending", "log expense", "spend money", "record expense", "add purchase", "track payments", "track cost", "expense log"],
    response: "Log an expense at '/bank-accounts/deduct' (e.g., ₹1000 on 'Food'). Select a bank account to deduct from!"
  },
  {
    intent: "view_transactions",
    keywords: ["transactions", "payments", "history", "recent transactions", "bank statement", "transaction log", "account activity", "money spent"],
    response: async (token) => {
      const expenditures = await fetchExpenditures(token);
      return expenditures.length 
        ? `Recent expenses: ${expenditures.slice(0, 3).map(e => `${e.category}: ₹${e.amount}`).join(", ")}. See '/expenses' for full history!`
        : "No expenses logged. Start at '/bank-accounts/deduct'!";
    }
  },
  {
    intent: "delete_transaction",
    keywords: ["delete transaction", "remove payment", "erase record", "clear transaction", "cancel payment", "undo payment", "delete payment", "remove purchase"],
    response: "Delete a transaction with its ID from '/expenses' at '/delete/:id' (e.g., '/delete/123'). Need help finding the ID?"
  },

  // Website-Related Intents (Updated with Your Routes)
  {
    intent: "website_overview",
    keywords: ["what is this website", "about this app", "what can I do here", "tell me about the site", "overview", "what’s this app for"],
    response: "This is your personalized accountant app! Manage income ('/incomes'), expenses ('/expenses'), taxes ('/tax'), loans ('/loans'), and more. Where do you want to start?"
  },
  {
    intent: "website_features",
    keywords: ["features", "what can it do", "functions", "tools", "options", "what’s available", "services"],
    response: "Features: Track income ('/incomes'), manage bank accounts ('/bank-accounts'), monitor fraud ('/fraud/alerts'), analyze financial health ('/financial-health'), and optimize loans ('/loans/optimize'). Pick one to explore!"
  },
  {
    intent: "view_tax_summary",
    keywords: ["tax", "tax summary", "taxes", "income tax", "tax details", "view my taxes", "tax return", "calculate tax", "tax deductions"],
    response: async (token) => {
      const taxData = await fetchTaxSummary(token);
      return taxData 
        ? `Tax summary: Income ₹${taxData.totalIncome}, Deductions ₹${taxData.deductibleTransactions}, Tax Due ₹${taxData.estimatedTax}. More at '/tax/summary'!`
        : "No tax data yet. Add income/expenses and check '/tax/summary'!";
    }
  },
  {
    intent: "financial_health",
    keywords: ["financial health", "money analysis", "check finances", "financial report", "spending habits", "budget check", "analyze money", "my finance"],
    response: async (token) => {
      const income = await fetchIncomeTotal(token);
      const expenses = (await fetchExpenditures(token)).reduce((sum, e) => sum + e.amount, 0);
      const loans = await fetchLoans(token);
      const totalDebt = loans.reduce((sum, l) => sum + l.currentBalance, 0);
      const dti = income ? totalDebt / income : 0;
      const score = await fetchFinancialHealth(token, income, expenses, totalDebt, dti);
      return score !== null 
        ? `Your financial health score is ${score}/100. Check '/financial-health' for details!`
        : "Add income, expenses, and loans to get your financial health score at '/financial-health'!";
    }
  },
  {
    intent: "fraud_alerts",
    keywords: ["fraud alert", "scam detection", "is my account safe", "secure account", "check for fraud", "security check", "unauthorized access", "safe from fraud"],
    response: async (token) => {
      const fraudAlerts = await fetchFraudAlerts(token);
      return fraudAlerts.length 
        ? `Found ${fraudAlerts.length} alert(s): ${fraudAlerts.slice(0, 2).map(a => `${a.reason} (₹${a.amount})`).join(", ")}. See '/fraud/alerts' for more!`
        : "No fraud alerts. Monitor with '/fraud/alerts' for peace of mind!";
    }
  },
  {
    intent: "view_loans",
    keywords: ["loans", "loan status", "borrowed money", "check my loan", "loan amount", "pending loan", "loan details", "loan balance"],
    response: async (token) => {
      const loans = await fetchLoans(token);
      return loans.length 
        ? `You have ${loans.length} loan(s): ${loans.slice(0, 2).map(l => `₹${l.currentBalance} at ${l.interestRate}%`).join(", ")}. More at '/loans'!`
        : "No loans yet. Add or view them at '/loans'!";
    }
  },
  {
    intent: "loan_dti_calculation",
    keywords: ["debt", "income ratio", "DTI", "calculate debt", "debt analysis", "debt-to-income", "loan affordability", "financial ratio"],
    response: async (token) => {
      const income = await fetchIncomeTotal(token);
      const dti = await fetchDTI(token, income);
      return dti !== null 
        ? `Your Debt-to-Income ratio is ${(dti * 100).toFixed(1)}%. Check '/loans/dti' for details!`
        : "Add income and loans to calculate your DTI at '/loans/dti'!";
    }
  },
  {
    intent: "optimize_loans",
    keywords: ["better loan", "optimize loan", "loan options", "compare loan", "lower interest", "improve loan", "loan deals", "refinance loan"],
    response: async (token) => {
      const optimizedLoans = await fetchOptimizedLoans(token);
      return optimizedLoans.length 
        ? `Top loans to tackle: ${optimizedLoans.slice(0, 2).map(l => `₹${l.currentBalance} at ${l.interestRate}%`).join(", ")}. Optimize at '/loans/optimize'!`
        : "No loans to optimize. Add some at '/loans' first!";
    }
  },
  {
    intent: "how_to_navigate",
    keywords: ["how to use", "navigate", "where is", "find", "how do I", "guide me", "show me how"],
    response: "Navigate with ease: '/incomes' for earnings, '/bank-accounts' for balances, '/tax/summary' for taxes, '/loans' for loans. What do you need help with?"
  },
  {
    intent: "website_help",
    keywords: ["help", "support", "assist", "troubleshoot", "problem", "issue", "how do I fix"],
    response: "Need assistance? Try '/incomes' for income, '/bank-accounts/deduct' for expenses, or ask me about any feature!"
  },
  {
    intent: "website_status",
    keywords: ["is it working", "status", "down", "not working", "site ok", "app status"],
    response: "The app is online and ready! If you’re facing issues, tell me what’s wrong, and I’ll assist."
  },
  {
    intent: "account_settings",
    keywords: ["settings", "profile", "update account", "change password", "edit profile", "account details"],
    response: async (token) => {
      const user = await fetchUserProfile(token);
      return user 
        ? `Your profile: ${user.name} (${user.email}). Update it at '/auth/update' or check '/auth/me'!`
        : "Log in to view or edit your profile at '/auth/me'!";
    }
  }
];

// Function to find intent response (unchanged)
const findIntentResponse = async (message, token) => {
  const lowerMessage = message.toLowerCase();

  for (const intent of intents) {
    if (intent.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return typeof intent.response === "function" 
        ? await intent.response(token) 
        : intent.response;
    }
  }
  return null;
};

// Chat endpoint (unchanged)
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const intentResponse = await findIntentResponse(message, token);
    if (intentResponse) {
      return res.json({ reply: intentResponse });
    }

    const response = await together.chat.completions.create({
      messages: [
        { role: "system", content: "Reply in only 1-2 sentences. Keep answers short and concise." },
        { role: "user", content: message }
      ],
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      max_tokens: 50,
      stop: ["\n"],
    });

    const reply = response.choices[0].message.content.trim();
    res.json({ reply });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;