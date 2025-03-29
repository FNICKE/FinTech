import { motion } from "framer-motion";
import { FaCheckCircle, FaBookOpen, FaChartPie, FaShieldAlt, FaPiggyBank } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// HomePage Component
const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black text-white flex flex-col items-center justify-center px-6 pt-16 relative">
      {/* Fade effect at top and bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />
      <div className="text-center max-w-4xl mb-12 relative z-10">
        <motion.h1 className="text-7xl font-extrabold mb-4 flex justify-center space-x-1">
          {"Welcome to Finova".split("").map((char, index) => (
            <motion.span
              key={index}
              className="inline-block bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent"
              whileHover={{ y: -10, transition: { type: "spring", stiffness: 200 } }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.h1>
        <h2 className="text-3xl text-purple-200">A fusion of finance and innovation.</h2>
        <p className="text-lg text-purple-100 mt-4 max-w-2xl">
          Take control of your financial future with AI-powered insights, automated tracking, and smart investment strategies.
        </p>
        <motion.button
          className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-full shadow-lg hover:from-purple-600 hover:to-indigo-700 transition duration-300"
          whileHover={{ scale: 1.1 }}
          onClick={() => navigate("/login")}
        >
          Get Started for Free
        </motion.button>
      </div>

      {/* Features Section */}
      <div className="flex flex-wrap justify-center max-w-6xl w-full px-4 gap-6 relative z-10">
        {[
          { title: "AI-Powered Bookkeeping", description: "Categorizes income, tracks expenses, and reconciles accounts automatically." },
          { title: "Smart Tax Optimization", description: "Estimates tax liabilities and suggests deductions to maximize returns." },
          { title: "Personalized Investment Strategies", description: "AI-driven investment planning tailored to your financial goals." },
          { title: "Fraud & Anomaly Detection", description: "AI continuously monitors transactions to detect and prevent fraud." },
        ].map((item, index) => (
          <motion.div
            key={index}
            className="flex-1 min-w-[280px] p-6 bg-gradient-to-br from-gray-900 to-purple-950 rounded-2xl shadow-xl border border-purple-500/30 text-center transition-shadow duration-300"
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(147, 51, 234, 0.8)" }}
          >
            <h2 className="text-xl font-semibold flex items-center justify-center gap-2 text-white">
              <FaCheckCircle className="text-green-400" /> {item.title}
            </h2>
            <p className="text-purple-100 mt-2">{item.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Additional Content: Call to Action */}
      <div className="mt-12 text-center relative z-10">
        <p className="text-purple-200 text-lg max-w-3xl">
          Join thousands of users already managing their finances smarter with Finova. Start today and see the difference!
        </p>
      </div>
    </div>
  );
};

// AboutPage Component
const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black text-white flex flex-col items-center justify-center px-6 md:px-12 py-16 relative">
      {/* Fade effect at top and bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />
      <motion.h1
        className="text-5xl font-extrabold mb-10 text-center bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent relative z-10"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        About Finova
      </motion.h1>
      <div className="flex flex-col lg:flex-row items-center justify-center gap-10 max-w-6xl w-full relative z-10">
        <motion.div
          className="flex-1 text-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-lg text-purple-100 leading-relaxed mb-6">
            Finova is an intelligent financial management solution designed for individuals and businesses. It automates bookkeeping, categorizes income and expenses, and provides real-time budget tracking. Our AI-driven system analyzes spending patterns, optimizes taxes, and recommends personalized investment strategies.
          </p>
          <p className="text-lg text-purple-100 leading-relaxed">
            Connect your bank accounts, digital wallets, and payroll systems for seamless integration. Receive automated financial reports and actionable insights to improve decision-making. Finova acts as your virtual accountant, reducing financial stress and enhancing your financial well-being.
          </p>
        </motion.div>
        <motion.div
          className="flex-1 flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <img
            src="https://static.vecteezy.com/system/resources/thumbnails/022/498/429/small_2x/3d-render-business-infographic-with-stock-diagrams-and-statistic-bars-chart-isolated-on-transparent-background-financial-line-graphs-and-charts-for-presentation-and-finance-report-png.png"
            alt="Finova AI Analysis"
            className="w-80 rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300 border border-purple-500/30"
          />
        </motion.div>
      </div>

      {/* Additional Content: Mission Statement */}
      <div className="mt-12 text-center max-w-3xl relative z-10">
        <h3 className="text-2xl font-semibold text-white mb-4">Our Mission</h3>
        <p className="text-purple-200 text-lg">
          At Finova, we aim to empower everyone with the tools and knowledge to achieve financial freedom through innovative technology and unparalleled support.
        </p>
      </div>
    </div>
  );
};

// SecurityPage Component
const SecurityPage = () => {
  const securityFeatures = [
    {
      title: "End-to-End Encryption",
      description: "We encrypt all financial data to ensure secure transactions, preventing unauthorized access. Our advanced protocols safeguard sensitive information from cyber threats with multiple layers of security.",
    },
    {
      title: "Regulatory Compliance",
      description: "Finova adheres to RBI guidelines and industry best practices. Regular audits and updates ensure compliance with global financial standards, maintaining trust and transparency.",
    },
    {
      title: "AI Fraud Detection",
      description: "Our AI monitors transactions in real-time to detect and prevent fraud. Machine learning identifies suspicious patterns, sending instant alerts to keep your finances secure.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black text-white flex flex-col items-center justify-center px-6 py-16 relative">
      {/* Fade effect at top and bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />
      <h1 className="text-5xl font-extrabold mb-10 text-center bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent relative z-10">
        Security & Compliance
      </h1>
      <p className="text-lg text-purple-100 text-center max-w-3xl mb-12 relative z-10">
        At Finova, your security is our priority. We use cutting-edge measures to protect your financial data.
      </p>

      <div className="flex flex-wrap justify-center gap-8 w-full max-w-6xl relative z-10">
        {securityFeatures.map((feature, index) => (
          <motion.div
            key={index}
            className="w-full sm:w-[30%] min-w-[250px] p-6 bg-gradient-to-br from-gray-900 to-purple-950 rounded-2xl shadow-xl border border-purple-500/30 flex flex-col justify-between transition-shadow duration-300"
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(147, 51, 234, 0.8)" }}
          >
            <h2 className="text-2xl font-semibold text-white mb-4">{feature.title}</h2>
            <p className="text-purple-100">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Additional Content: Security Assurance */}
      <div className="mt-12 text-center max-w-3xl relative z-10">
        <h3 className="text-2xl font-semibold text-white mb-4">Your Trust, Our Commitment</h3>
        <p className="text-purple-200 text-lg">
          We’re dedicated to keeping your data safe with continuous monitoring and industry-leading security practices.
        </p>
      </div>
    </div>
  );
};

// ServicesPage Component
const ServicesPage = () => {
  const services = [
    {
      title: "AI-Based Bookkeeping",
      description: "Automate income categorization, track transactions, and reconcile accounts seamlessly with our AI-driven system. Save time and reduce errors.",
      icon: <FaBookOpen className="text-white text-6xl my-6" />,
    },
    {
      title: "Personalized Budgeting",
      description: "Control your finances with AI-powered budgeting tools. Get real-time alerts on overspending and smart spending limits for a secure future.",
      icon: <FaChartPie className="text-white text-6xl my-6" />,
    },
    {
      title: "Investment & Savings Advisor",
      description: "Identify profitable opportunities with AI-driven advice. Optimize savings and plan for short-term or long-term financial goals.",
      icon: <FaPiggyBank className="text-white text-6xl my-6" />,
    },
    {
      title: "Fraud & Anomaly Detection",
      description: "Protect your transactions with advanced AI security. Monitor in real-time and receive proactive alerts to prevent financial fraud.",
      icon: <FaShieldAlt className="text-white text-6xl my-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black text-white flex flex-col items-center justify-center px-6 py-16 relative">
      {/* Fade effect at top and bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />
      <h1 className="text-5xl font-extrabold mb-10 text-center bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent relative z-10">
        Our Services
      </h1>
      <div className="flex flex-wrap justify-center gap-8 max-w-6xl w-full relative z-10">
        {services.map((service, index) => (
          <motion.div
            key={index}
            className="flex-1 p-6 bg-gradient-to-br from-gray-900 to-purple-950 rounded-2xl shadow-xl border border-purple-500/30 min-w-[250px] flex flex-col items-center justify-between transition-all duration-300"
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(147, 51, 234, 0.8)" }}
          >
            <h2 className="text-2xl font-semibold text-white">{service.title}</h2>
            <div>{service.icon}</div>
            <p className="text-purple-100 text-base leading-relaxed px-4">{service.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Additional Content: Service Promise */}
      <div className="mt-12 text-center max-w-3xl relative z-10">
        <h3 className="text-2xl font-semibold text-white mb-4">Our Promise</h3>
        <p className="text-purple-200 text-lg">
          We deliver innovative, reliable services to help you achieve financial success with ease and confidence.
        </p>
      </div>
    </div>
  );
};

export { HomePage, AboutPage, ServicesPage, SecurityPage };