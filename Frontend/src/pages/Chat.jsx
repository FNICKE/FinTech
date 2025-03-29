import React, { useState } from "react";
import axios from "axios";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const token = localStorage.getItem("token");

  const handleSend = async () => {
    if (!message.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages([...messages, { sender: "user", text: message, timestamp }]);
    setMessage("");
    setIsTyping(true);

    try {
      const res = await axios.post("http://localhost:5000/api/chat", { message }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const aiTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: res.data.reply, timestamp: aiTimestamp },
      ]);
      setIsTyping(false);
    } catch (error) {
      console.error("Error:", error);
      const aiTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Unable to process request", timestamp: aiTimestamp },
      ]);
      setIsTyping(false);
    }
  };

  const handleOptionClick = async (option, displayText) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages([...messages, { sender: "user", text: displayText, timestamp }]);
    setIsTyping(true);

    try {
      const res = await axios.post("http://localhost:5000/api/chat", { message: option }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const aiTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: res.data.reply, timestamp: aiTimestamp },
      ]);
      setIsTyping(false);
    } catch (error) {
      console.error("Error:", error);
      const aiTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Unable to process request", timestamp: aiTimestamp },
      ]);
      setIsTyping(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setMessage("");
    setIsTyping(false);
    setShowHelp(false);
  };

  const options = [
    { intent: "invest land", display: "Land Investment", label: "Land" },
    { intent: "invest gold", display: "Gold Investment", label: "Gold" },
    { intent: "invest stocks", display: "Stock Investment", label: "Stocks" },
    { intent: "invest mutual funds", display: "Mutual Funds", label: "Mutual Funds" },
    { intent: "invest fixed deposit", display: "Fixed Deposit", label: "Fixed Deposit" },
    { intent: "smart investment", display: "Smart Investment Options", label: "Smart Invest" },
    { intent: "saving advice", display: "Saving Tips", label: "Save Smart" },
    { intent: "budget plan", display: "Create Budget Plan", label: "Budget" },
    { intent: "quick tips", display: "Quick Financial Tips", label: "Tips" },
  ];

  const helpCommands = [
    "Tax Summary: 'tax' or '/summary'",
    "Transactions: 'history' or '/'",
    "Smart Investment: Click 'Smart Invest'",
    "Saving Tips: Click 'Save Smart'",
    "Budget: Click 'Budget'",
  ];

  return (
    <div>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300 z-50"
      >
        {isChatOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chatbox */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-6 w-96 max-w-full h-[600px] bg-gradient-to-br from-black to-purple-900 rounded-lg shadow-xl flex flex-col overflow-hidden z-40">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-800 to-black text-white p-4 flex justify-between items-center">
            <span className="text-lg font-semibold">Finance Buddy</span>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="text-white hover:text-purple-300 text-sm transition-all"
              >
                {showHelp ? "Hide" : "Help"}
              </button>
              <button
                onClick={resetChat}
                className="text-white hover:text-purple-300 text-sm transition-all"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-opacity-80 bg-black">
            {messages.length === 0 && !showHelp && (
              <div className="text-purple-300 text-sm">
                <p className="font-medium mb-2">Quick Options:</p>
                <div className="flex flex-wrap gap-2">
                  {options.map((option) => (
                    <button
                      key={option.intent}
                      onClick={() => handleOptionClick(option.intent, option.display)}
                      className="bg-purple-600 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-purple-700 transition-all"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {showHelp && (
              <div className="bg-gray-900 p-2 rounded-lg shadow-sm max-w-[75%] text-purple-300 text-xs">
                <p className="font-medium mb-1">Commands:</p>
                <ul className="list-disc pl-4">
                  {helpCommands.map((cmd, idx) => (
                    <li key={idx}>{cmd}</li>
                  ))}
                </ul>
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[75%] p-2 rounded-lg text-xs shadow-sm ${
                  msg.sender === "user"
                    ? "bg-purple-500 text-white ml-auto rounded-br-none"
                    : "bg-gray-800 text-purple-200 rounded-bl-none"
                }`}
              >
                <p>{msg.text}</p>
                <span className="text-[10px] text-gray-400 block text-right mt-1">{msg.timestamp}</span>
              </div>
            ))}
            {isTyping && (
              <div className="bg-gray-800 p-2 rounded-lg max-w-[75%] text-purple-400 text-xs italic flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-1 animate-bounce"></span>
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-1 animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-1 animate-bounce delay-200"></span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 bg-gray-900 flex items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-3 bg-gray-800 text-white rounded-full text-sm border border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="ml-2 bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;