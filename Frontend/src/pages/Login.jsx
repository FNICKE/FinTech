import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      toast.success("Login successful!");
      navigate("/Home");
    } catch (error) {
      toast.error("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black p-8 flex flex-col md:flex-row items-center justify-center text-white">
      {/* Left Section - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 md:p-12">
        <h2 className="text-5xl font-extrabold text-white mb-6 text-center bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
          Login
        </h2>
        <p className="text-purple-200 mb-8 text-center text-xl max-w-md mx-auto">
          Sign in to access your personalized financial dashboard.
        </p>
        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-gray-900 to-purple-950 p-8 rounded-2xl shadow-xl border border-purple-500/30 w-full max-w-md"
        >
          {/* Email Input */}
          <div className="mb-6">
            <label className="block text-purple-100 font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              onChange={handleChange}
              className="w-full border border-purple-500/50 p-3 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-400"
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label className="block text-purple-100 font-medium mb-2">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              onChange={handleChange}
              className="w-full border border-purple-500/50 p-3 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-400"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-indigo-600 w-full py-3 rounded-full text-white font-semibold hover:from-purple-600 hover:to-indigo-700 transition duration-300 shadow-lg"
          >
            Login
          </button>

          {/* Register Link */}
          <p className="mt-4 text-center text-purple-100">
            Don’t have an account?{" "}
            <a
              href="/register"
              className="text-purple-400 hover:text-purple-300 font-semibold transition duration-200"
            >
              Register
            </a>
          </p>
        </form>
      </div>

      {/* Right Section - Information and Features */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 md:p-12 text-center">
        <div className="bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30 w-full max-w-md">
          <h3 className="text-2xl font-semibold text-white mb-4">
            Why Login?
          </h3>
          <p className="text-purple-200 mb-6 text-sm">
            Unlock the full potential of your financial management with these premium features:
          </p>
          <ul className="text-purple-100 space-y-4 text-left">
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span> AI-powered financial insights tailored to you.
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span> Personalized dashboards for real-time tracking.
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span> Smart investment options and automated bookkeeping.
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span> Real-time fraud detection and secure account integration.
            </li>
          </ul>
        </div>

        {/* Additional Content: Quick Tips */}
        <div className="mt-8 bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30 w-full max-w-md">
          <h3 className="text-2xl font-semibold text-white mb-4">
            Quick Login Tips
          </h3>
          <ul className="text-purple-100 space-y-3 text-sm text-left">
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">✓</span> Use a strong, unique password.
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">✓</span> Enable two-factor authentication for added security.
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">✓</span> Keep your email and password confidential.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;