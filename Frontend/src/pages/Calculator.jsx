import { useState } from "react";

const Calculator = () => {
  const [income, setIncome] = useState("");
  const [taxYear, setTaxYear] = useState("2025");
  const [investments, setInvestments] = useState(""); // Renamed from deductions
  const [taxResult, setTaxResult] = useState(null);

  const taxRules = {
    2025: {
      exemptionLimit: 300000,
      brackets: [
        { min: 300001, max: 600000, rate: 0.05 },
        { min: 600001, max: 900000, rate: 0.1 },
        { min: 900001, max: 1200000, rate: 0.15 },
        { min: 1200001, max: 1500000, rate: 0.2 },
        { min: 1500001, max: Infinity, rate: 0.3 },
      ],
      cess: 0.04,
      surcharge: [
        { min: 5000000, max: 10000000, rate: 0.1 },
        { min: 10000001, max: Infinity, rate: 0.15 },
      ],
    },
    2024: {
      exemptionLimit: 250000,
      brackets: [
        { min: 250001, max: 500000, rate: 0.05 },
        { min: 500001, max: 1000000, rate: 0.2 },
        { min: 1000001, max: Infinity, rate: 0.3 },
      ],
      cess: 0.04,
      surcharge: [
        { min: 5000000, max: 10000000, rate: 0.1 },
        { min: 10000001, max: Infinity, rate: 0.15 },
      ],
    },
    2023: {
      exemptionLimit: 250000,
      brackets: [
        { min: 250001, max: 500000, rate: 0.05 },
        { min: 500001, max: 1000000, rate: 0.2 },
        { min: 1000001, max: Infinity, rate: 0.3 },
      ],
      cess: 0.04,
      surcharge: [
        { min: 5000000, max: 10000000, rate: 0.1 },
        { min: 10000001, max: Infinity, rate: 0.15 },
      ],
    },
  };

  const calculateTaxForIncome = (income, rules) => {
    const taxableIncome = Math.max(0, income - rules.exemptionLimit);
    let baseTax = 0;
    let slabBreakdown = [];
    let remainingIncome = taxableIncome;

    if (taxableIncome > 0) {
      for (const bracket of rules.brackets) {
        if (remainingIncome <= 0) break;
        const taxableInBracket = Math.min(
          remainingIncome,
          bracket.max === Infinity ? remainingIncome : bracket.max - bracket.min
        );
        const slabTax = taxableInBracket * bracket.rate;
        baseTax += slabTax;
        slabBreakdown.push({
          range: `${bracket.min.toLocaleString()} - ${bracket.max === Infinity ? "Above" : bracket.max.toLocaleString()}`,
          rate: bracket.rate * 100,
          tax: slabTax,
        });
        remainingIncome -= taxableInBracket;
      }
    }

    let surcharge = 0;
    for (const sur of rules.surcharge) {
      if (income >= sur.min && income <= (sur.max || Infinity)) {
        surcharge = baseTax * sur.rate;
        break;
      }
    }

    const cess = (baseTax + surcharge) * rules.cess;
    const totalTax = baseTax + surcharge + cess;

    return { totalTax, baseTax, surcharge, cess, slabBreakdown };
  };

  const calculateTax = (e) => {
    e.preventDefault();
    const incomeNum = parseFloat(income) || 0;
    const investmentsNum = parseFloat(investments) || 0;
    const rules = taxRules[taxYear];
    const exemptIncome = Math.min(incomeNum, rules.exemptionLimit);

    // Tax without investments
    const taxWithoutInvestments = calculateTaxForIncome(incomeNum, rules);

    // Tax with investments
    const taxableIncomeWithInvestments = Math.max(0, incomeNum - investmentsNum - rules.exemptionLimit);
    const taxWithInvestments = taxableIncomeWithInvestments > 0 
      ? calculateTaxForIncome(incomeNum - investmentsNum, rules) 
      : { totalTax: 0, baseTax: 0, surcharge: 0, cess: 0, slabBreakdown: [] };

    const taxSaved = (taxWithoutInvestments.totalTax - taxWithInvestments.totalTax).toFixed(2);
    const takeHomeIncome = (incomeNum - taxWithInvestments.totalTax).toFixed(2);

    setTaxResult({
      totalIncome: incomeNum.toFixed(2),
      exemptIncome: exemptIncome.toFixed(2),
      taxableIncome: taxableIncomeWithInvestments.toFixed(2),
      taxWithoutInvestments: taxWithoutInvestments.totalTax.toFixed(2),
      taxWithInvestments: taxWithInvestments.totalTax.toFixed(2),
      baseTax: taxWithInvestments.baseTax.toFixed(2),
      surcharge: taxWithInvestments.surcharge.toFixed(2),
      cess: taxWithInvestments.cess.toFixed(2),
      taxSaved: taxSaved,
      takeHomeIncome: takeHomeIncome,
      effectiveTaxRate: incomeNum > 0 ? ((taxWithInvestments.totalTax / incomeNum) * 100).toFixed(2) : 0,
      slabBreakdown: taxWithInvestments.slabBreakdown,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black px-6 py-8 flex items-center justify-center">
      <div className="flex w-full max-w-5xl gap-6">
        {/* Left Section (Form) */}
        <div className="w-1/2 bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30">
          <h1 className="text-4xl font-extrabold mb-4 text-center bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
            Advanced Tax Calculator
          </h1>
          <p className="text-base text-purple-200 text-center mb-4">
            See your tax deductions and savings.
          </p>

          <form onSubmit={calculateTax} className="space-y-4">
            <div>
              <label htmlFor="income" className="block text-base font-semibold text-purple-100 mb-1">
                Annual Income (₹)
              </label>
              <input
                type="number"
                id="income"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full p-3 bg-gray-800 text-white rounded-lg border border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-400"
                placeholder="Enter income"
                required
              />
            </div>

            <div>
              <label htmlFor="taxYear" className="block text-base font-semibold text-purple-100 mb-1">
                Tax Year
              </label>
              <select
                id="taxYear"
                value={taxYear}
                onChange={(e) => setTaxYear(e.target.value)}
                className="w-full p-3 bg-gray-800 text-white rounded-lg border border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>

            <div>
              <label htmlFor="investments" className="block text-base font-semibold text-purple-100 mb-1">
                Tax-Saving Investments (₹)
              </label>
              <input
                type="number"
                id="investments"
                value={investments}
                onChange={(e) => setInvestments(e.target.value)}
                className="w-full p-3 bg-gray-800 text-white rounded-lg border border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-400"
                placeholder="Enter investments (e.g., 80C)"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-full shadow-md hover:from-purple-600 hover:to-indigo-700 transition-all duration-300"
            >
              Calculate Tax
            </button>
          </form>
        </div>

        {/* Right Section (Results and Tax Details) */}
        <div className="w-1/2 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30">
            {taxResult ? (
              <>
                <h2 className="text-2xl font-semibold mb-3 text-purple-400 text-center">
                  Tax Calculation Results
                </h2>
                <div className="space-y-2 text-base text-purple-100 text-center">
                  <p>
                    <span className="font-semibold">Total Income:</span> ₹{taxResult.totalIncome}
                  </p>
                  <p>
                    <span className="font-semibold">Exempt Income:</span> ₹{taxResult.exemptIncome}
                  </p>
                  <p>
                    <span className="font-semibold">Tax Without Investments:</span> ₹{taxResult.taxWithoutInvestments}
                  </p>
                  <p>
                    <span className="font-semibold">Tax After Investments:</span> ₹{taxResult.taxWithInvestments}
                  </p>
                  <p>
                    <span className="font-semibold">Tax Saved:</span> ₹{taxResult.taxSaved}
                  </p>
                  <p>
                    <span className="font-semibold">Take-Home Income:</span> ₹{taxResult.takeHomeIncome}
                  </p>
                  <p className="text-sm">
                    (Base Tax: ₹{taxResult.baseTax} + Surcharge: ₹{taxResult.surcharge} + Cess: ₹{taxResult.cess})
                  </p>
                  <p>
                    <span className="font-semibold">Taxable Income (After Investments):</span> ₹{taxResult.taxableIncome}
                  </p>
                  <p>
                    <span className="font-semibold">Effective Tax Rate:</span> {taxResult.effectiveTaxRate}%
                  </p>
                  {taxResult.taxWithInvestments === "0.00" && (
                    <p className="text-sm text-purple-200 mt-2">
                      Your income is below the taxable limit of ₹{taxRules[taxYear].exemptionLimit.toLocaleString()} after investments.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-lg text-purple-200 text-center">
                Enter data to calculate tax.
              </p>
            )}
          </div>

          {/* Tax Bracket Breakdown */}
          <div className="bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30">
            <h3 className="text-xl font-semibold text-purple-400 mb-3 text-center">
              Tax Breakdown ({taxYear})
            </h3>
            <div className="text-purple-100 text-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th className="py-2">Income Range (₹)</th>
                    <th className="py-2">Rate</th>
                    <th className="py-2">Tax (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {taxResult && taxResult.taxWithInvestments === "0.00" ? (
                    <tr>
                      <td className="py-2">0 - {taxRules[taxYear].exemptionLimit.toLocaleString()}</td>
                      <td className="py-2">0%</td>
                      <td className="py-2">0.00</td>
                    </tr>
                  ) : taxResult && taxResult.slabBreakdown.length > 0 ? (
                    taxResult.slabBreakdown.map((slab, index) => (
                      <tr key={index} className="border-b border-purple-500/20">
                        <td className="py-2">{slab.range}</td>
                        <td className="py-2">{slab.rate}%</td>
                        <td className="py-2">{slab.tax.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-2 text-center">
                        No tax applicable yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-purple-200">
                *Includes {taxRules[taxYear].cess * 100}% cess and applicable surcharge.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;