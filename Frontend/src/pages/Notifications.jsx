import { useState, useEffect } from "react";
import axios from "axios";
import { FaBell, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false); // Filter state

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/notifications",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setNotifications(data);
      setError(null);
    } catch (error) {
      setError(
        "Failed to fetch notifications: " +
          (error.response?.data?.error || error.message)
      );
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setNotifications(
        notifications.map((notif) =>
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setError(
        "Failed to mark notification as read: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark all unread notifications as read
      const unreadNotifications = notifications.filter((notif) => !notif.read);
      for (const notif of unreadNotifications) {
        await axios.put(
          `http://localhost:5000/api/notifications/${notif._id}/read`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
      setNotifications(
        notifications.map((notif) => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      setError(
        "Failed to mark all notifications as read: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  // Filter notifications based on the showUnreadOnly state
  const filteredNotifications = showUnreadOnly
    ? notifications.filter((notif) => !notif.read)
    : notifications;

  return (
    <div className="p-6 min-h-screen font-sans bg-gradient-to-br from-black via-purple-900 to-black text-white">
      <h2 className="text-4xl font-extrabold text-purple-300 mb-8 text-center">
        Notifications
      </h2>

      {/* Filter and Clear All Buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <label className="text-gray-300">Show Unread Only</label>
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={() => setShowUnreadOnly(!showUnreadOnly)}
            className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-400"
          />
        </div>
        {notifications.some((notif) => !notif.read) && (
          <button
            onClick={markAllAsRead}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {loading && (
        <p className="text-center text-gray-400 text-lg">Loading...</p>
      )}
      {error && (
        <p className="text-center text-red-400 text-lg font-medium">{error}</p>
      )}

      {filteredNotifications.length === 0 && !loading ? (
        <p className="text-gray-400 text-center">
          No notifications to display.
        </p>
      ) : (
        <div className="bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-lg border border-purple-500">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">
            Your Notifications
          </h3>
          <div className="space-y-4">
            {filteredNotifications.map((notif) => (
              <div
                key={notif._id}
                className={`p-4 rounded-lg flex justify-between items-center ${
                  notif.read ? "bg-gray-700" : "bg-gray-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  {notif.type === "debt-reminder" ? (
                    <FaExclamationTriangle className="text-red-400 w-6 h-6" />
                  ) : (
                    <FaBell
                      className={`w-6 h-6 ${
                        notif.type === "anomaly"
                          ? "text-red-400"
                          : notif.type === "behavior"
                          ? "text-yellow-400"
                          : "text-orange-400" // For budget_exceed
                      }`}
                    />
                  )}
                  <div>
                    <p className="text-gray-300">
                      {notif.type === "budget_exceed" && notif.category
                        ? `${notif.category}: ${notif.message}`
                        : notif.message}
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(notif.date).toLocaleString()}
                    </p>
                  </div>
                </div>
                {!notif.read && (
                  <button
                    onClick={() => markAsRead(notif._id)}
                    className="text-green-400 hover:text-green-300 transition duration-200"
                    title="Mark as read"
                  >
                    <FaCheckCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
