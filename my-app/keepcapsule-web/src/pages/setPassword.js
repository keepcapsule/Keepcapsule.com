// src/pages/SetPassword.js
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const customerId = query.get("customerId");
  const email = query.get("email");

  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerId || !email) {
      alert("Missing Stripe customer ID or email.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    const user = { email, password };
    localStorage.setItem("user_" + customerId, JSON.stringify(user));
    alert("Password set! You can now log in.");
    navigate("/");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Set Your Password</h2>
      <p>
        For: <strong>{email}</strong>
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "10px", margin: "10px", width: "300px" }}
        />
        <br />
        <button type="submit" style={{ padding: "10px 30px" }}>
          Save Password
        </button>
      </form>
    </div>
  );
};

export default SetPassword;
