import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);
      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black p-8 flex flex-col md:flex-row items-center justify-center text-white">
      {/* Left Section - Information and Features */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 md:p-12">
        <div className="bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30 w-full max-w-md">
          <h3 className="text-2xl font-semibold text-white mb-4">
            Why Register?
          </h3>
          <p className="text-purple-200 mb-6 text-sm">
            Join us to unlock a world of financial tools and insights:
          </p>
          <ul className="text-purple-100 space-y-4 text-left">
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span> AI-powered insights for smarter decisions.
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span> Personalized dashboards for your finances.
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span> Automated tools for easy money management.
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">•</span> Real-time fraud detection for peace of mind.
            </li>
          </ul>
        </div>

        {/* Additional Content: Registration Benefits */}
        <div className="mt-8 bg-gradient-to-br from-gray-900 to-purple-950 p-6 rounded-2xl shadow-xl border border-purple-500/30 w-full max-w-md">
          <h3 className="text-2xl font-semibold text-white mb-4">
            Registration Benefits
          </h3>
          <ul className="text-purple-100 space-y-3 text-sm text-left">
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">✓</span> Free access to premium features.
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">✓</span> Secure data encryption for your safety.
            </li>
            <li className="flex items-start">
              <span className="text-purple-400 mr-2">✓</span> 24/7 support for all your queries.
            </li>
          </ul>
        </div>
      </div>

      {/* Right Section - Registration Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 md:p-12">
        <h2 className="text-5xl font-extrabold text-white mb-6 text-center bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
          Register
        </h2>
        <p className="text-purple-200 mb-8 text-center text-xl max-w-md mx-auto">
          Create your account to start managing your finances smarter.
        </p>
        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-gray-900 to-purple-950 p-8 rounded-2xl shadow-xl border border-purple-500/30 w-full max-w-md"
        >
          {/* Name Input */}
          <div className="mb-6">
            <label className="block text-purple-100 font-medium mb-2">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              onChange={handleChange}
              className="w-full border border-purple-500/50 p-3 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-400"
              required
            />
          </div>

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
              placeholder="Create a password"
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
            Register
          </button>

          {/* Login Link */}
          <p className="mt-4 text-center text-purple-100">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-purple-400 hover:text-purple-300 font-semibold transition duration-200"
            >
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;