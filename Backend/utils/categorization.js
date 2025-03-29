const categorizeExpense = (description) => {
    const categories = {
      "food|restaurant|dining|groceries": "Food",
      "travel|flight|taxi|bus|train|uber": "Travel",
      "rent|electricity|internet|gas|water": "Bills",
      "shopping|clothing|electronics": "Shopping",
      "salary|freelance|bonus|income": "Income",
    };
  
    for (const pattern in categories) {
      if (new RegExp(pattern, "i").test(description)) {
        return categories[pattern];
      }
    }
    return "Other";
  };
  
  module.exports = { categorizeExpense };
  