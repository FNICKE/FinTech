import { Link } from "react-router-dom";
import { Bell } from "lucide-react"; // Notification icon

const Vnavbar = () => {
  return (
    <div>
      {/* Navbar Links */}
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

      {/* Dropdown Content Below Navbar */}
      <div className="pt-6 px-4">
        {activeSection === "tax" && (
          <div className="bg-blue-950 text-white p-4 rounded-lg mt-4">
            <h3 className="text-xl font-bold">Tax Overview Content</h3>
            <p>Here you can display tax-related information or content...</p>
          </div>
        )}
        {activeSection === "fraud" && (
          <div className="bg-blue-950 text-white p-4 rounded-lg mt-4">
            <h3 className="text-xl font-bold">Fraud Alerts Content</h3>
            <p>Here you can display fraud-related alerts or content...</p>
          </div>
        )}
        {activeSection === "investments" && (
          <div className="bg-blue-950 text-white p-4 rounded-lg mt-4">
            <h3 className="text-xl font-bold">Investments Content</h3>
            <p>Here you can display investment-related information or content...</p>
          </div>
        )}
        {activeSection === "goals" && (
          <div className="bg-blue-950 text-white p-4 rounded-lg mt-4">
            <h3 className="text-xl font-bold">Goals Content</h3>
            <p>Here you can display goals-related information or content...</p>
          </div>
        )}
        {activeSection === "bankAccounts" && (
          <div className="bg-blue-950 text-white p-4 rounded-lg mt-4">
            <h3 className="text-xl font-bold">Bank Balance Content</h3>
            <p>Here you can display bank account-related information or content...</p>
          </div>
        )}
        {activeSection === "expenditure" && (
          <div className="bg-blue-950 text-white p-4 rounded-lg mt-4">
            <h3 className="text-xl font-bold">Expenditure Content</h3>
            <p>Here you can display expenditure-related information or content...</p>
          </div>
        )}
        {activeSection === "transactions" && (
          <div className="bg-blue-950 text-white p-4 rounded-lg mt-4">
            <h3 className="text-xl font-bold">Transactions Content</h3>
            <p>Here you can display transaction-related information or content...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vnavbar;
