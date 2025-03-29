import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Chat from "./Chat";

const Home = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-500">
                {user ? `Welcome, ${user.name}! 🎉` : "AI Accountant"}
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    to="/tax"
                    className="text-gray-700 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md transition duration-200"
                  >
                    Tax Overview
                  </Link>
                  <Link
                    to="/fraud"
                    className="text-gray-700 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md transition duration-200"
                  >
                    Fraud Alerts
                  </Link>
                  <Link
                    to="/investments"
                    className="text-gray-700 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md transition duration-200"
                  >
                    Investments
                  </Link>
                  <Link
                    to="/goals"
                    className="text-gray-700 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md transition duration-200"
                  >
                    Goals
                  </Link>
                  <Link
                    to="/bank-accounts"
                    className="text-gray-700 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md transition duration-200"
                  >
                    Bank Balance
                  </Link>
                  <Link
                    to="/expenditure"
                    className="text-gray-700 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md transition duration-200"
                  >
                    Expenditure
                  </Link>
                  <Link
                    to="/transactions"
                    className="text-gray-700 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md transition duration-200"
                  >
                    Transactions
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition duration-200"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <p className="mb-4">
            {user
              ? "Manage your finances efficiently with AI-powered insights."
              : "Track your expenses, get AI-powered insights, and manage your finances easily."}
          </p>
        </div>
        <Chat />
      </div>
    </div>
  );
};

export default Home;