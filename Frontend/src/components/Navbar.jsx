import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-black text-white p-4">
    <div className="flex space-x-6">
      <Link
        to="#"
        className="text-gray-700 hover:text-blue-500"
        onClick={() => handleLinkClick("tax")}
      >
        Tax Overview
      </Link>
      <Link
        to="#"
        className="text-gray-700 hover:text-blue-500"
        onClick={() => handleLinkClick("fraud")}
      >
        Fraud Alerts
      </Link>
      <Link
        to="#"
        className="text-gray-700 hover:text-blue-500"
        onClick={() => handleLinkClick("investments")}
      >
        Investments
      </Link>
      <Link
        to="#"
        className="text-gray-700 hover:text-blue-500"
        onClick={() => handleLinkClick("goals")}
      >
        Goals
      </Link>
      <Link
        to="#"
        className="text-gray-700 hover:text-blue-500"
        onClick={() => handleLinkClick("bankAccounts")}
      >
        Bank Balance
      </Link>
      <Link
        to="#"
        className="text-gray-700 hover:text-blue-500"
        onClick={() => handleLinkClick("expenditure")}
      >
        Expenditure
      </Link>
      <Link
        to="#"
        className="text-gray-700 hover:text-blue-500"
        onClick={() => handleLinkClick("transactions")}
      >
        Transactions
      </Link>
    </div>
  </nav>

  );
};

export default Navbar;
