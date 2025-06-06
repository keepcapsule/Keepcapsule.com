// src/components/auth/AuthModal.js
import React, { useState } from "react";
import { loginUser } from "../../api/loginUser";
import "./auth.css";

const AuthModal = ({
  onClose,
  onLoginSuccess,
  isLogin,
  setIsLogin,
  email,
  setEmail,
  password,
  setPassword,
  setLoggedInUser,
}) => {
  const [error, setError] = useState("");

  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (!isLogin) {
        // SIGNUP FLOW
        const priceId = "price_1RWdnjFvZgkjkekwfGfpuvaw";

        const response = await fetch(
          "https://87kwlf9dhj.execute-api.eu-west-1.amazonaws.com/prod/create-checkout-session",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, priceId }),
          }
        );

        const raw = await response.json();
        const data = typeof raw.body === "string" ? JSON.parse(raw.body) : raw;

        if (!data.url) throw new Error("Stripe redirect failed");

        // Redirect to Stripe
        window.location.href = data.url;
      } else {
        // LOGIN FLOW
        const data = await loginUser(email, password);

        localStorage.setItem(
          "keepcapsule_user",
          JSON.stringify({ email, customerId: data.customerId })
        );
        setLoggedInUser({ email });
        onLoginSuccess(email);
        onClose();
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="auth-modal">
      <div className="auth-content">
        <button className="auth-close" onClick={onClose}>
          ×
        </button>
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="auth-button">
            {isLogin ? "Login" : "Continue to Payment"}
          </button>
        </form>
        <p onClick={handleSwitchMode} className="auth-toggle-link">
          {isLogin ? "No account? Sign up" : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
