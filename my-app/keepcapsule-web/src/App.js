import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Features from "./components/Features";
import Join from "./components/Join";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import AuthModal from "./components/auth/AuthModal";
import SetPassword from "./pages/setPassword";
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/ResetPassword";

const App = () => {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setLoggedInUser(JSON.parse(user));
  }, []);

  const handleAuth = (e) => {
    e.preventDefault();

    const adminEmail = "admin@keepcapsule.com";
    const adminPassword = "admin123";

    if (!isLogin) {
      if (password.length < 6) {
        alert("Password must be at least 6 characters");
        return;
      }

      const newUser = { email, password };
      localStorage.setItem("user_" + email, JSON.stringify(newUser));
      alert("Signup successful! You can now log in.");
      setIsLogin(true); // ✅ Switch back to login after signup
      setEmail("");
      setPassword("");
    } else {
      const stored = JSON.parse(localStorage.getItem("user_" + email));
      const isAdmin = email === adminEmail && password === adminPassword;

      if ((stored && stored.password === password) || isAdmin) {
        setLoggedInUser({ email });
        setShowModal(false);
        navigate("/dashboard");
      } else {
        alert("Invalid credentials");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setLoggedInUser(null);
    navigate("/");
  };

  return (
    <>
      <Header
        onLoginClick={() => {
          setEmail("");
          setPassword("");
          setIsLogin(true);
          setShowModal(true);
        }}
        user={loggedInUser}
        onLogout={handleLogout}
      />
      <AuthModal
        showModal={showModal}
        setShowModal={setShowModal}
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        handleAuth={handleAuth}
      />

      <Routes>
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/"
          element={
            <>
              <Hero />
              <About />
              <Features />
              <Join />
              <Footer />
            </>
          }
        />
        <Route
          path="/dashboard"
          element={
            loggedInUser ? (
              <Dashboard user={loggedInUser} onLogout={handleLogout} />
            ) : (
              <p style={{ padding: 20 }}>You are not logged in.</p>
            )
          }
        />
      </Routes>
    </>
  );
};

export default App;
