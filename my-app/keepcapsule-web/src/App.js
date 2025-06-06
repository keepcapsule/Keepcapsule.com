import React, { useState } from "react";
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
import ResetPassword from "./pages/resetPassword";

const App = () => {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);

  const navigate = useNavigate();

  const handleLogout = () => {
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
        onSignupClick={() => {
          setEmail("");
          setPassword("");
          setIsLogin(false);
          setShowModal(true);
        }}
        setIsLogin={setIsLogin}
        setShowModal={setShowModal}
        user={loggedInUser}
        onLogout={handleLogout}
      />

      {showModal && (
        <AuthModal
          showModal={showModal}
          setShowModal={setShowModal}
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          setLoggedInUser={setLoggedInUser}
          onClose={() => setShowModal(false)}
          onLoginSuccess={(email) => {
            setLoggedInUser({ email });
            navigate("/dashboard");
          }}
        />
      )}

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
