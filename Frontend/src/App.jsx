// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";
import MainHome from "./pages/MainHome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { HomePage, AboutPage, ServicesPage, SecurityPage } from "./pages/HomePage"; // Import named exports

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="text-center mt-20 text-white">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

// Public Route Component (for unauthenticated users)
const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="text-center mt-20 text-white">Loading...</div>;
  }

  return user ? <Navigate to="/home" /> : children;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <HomePage />
                <AboutPage/>
                <ServicesPage/>
                <SecurityPage/> {/* Main homepage for unauthenticated users */}
              </PublicRoute>
            }
          />
  
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/home/*"
            element={
              <ProtectedRoute>
                <MainHome />
              </ProtectedRoute>
            }
          />
          {/* Redirect any unmatched routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;