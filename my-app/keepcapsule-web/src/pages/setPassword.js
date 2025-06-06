import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { registerUser } from "../api/registerUser";

const SetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const sessionId = query.get("session_id");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomerId = async () => {
      try {
        const res = await fetch(
          `https://87kwlf9dhj.execute-api.eu-west-1.amazonaws.com/prod/stripe-session/${sessionId}`
        );
        const data = await res.json();
        if (!data.customerId || !data.email) throw new Error("Missing fields");
        setCustomerId(data.customerId);
        setEmail(data.email);
      } catch (err) {
        console.error("Failed to fetch Stripe session:", err);
        setError("Unable to verify payment session.");
      }
    };

    if (sessionId) fetchCustomerId();
  }, [sessionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerId || !email) {
      setError("Missing Stripe customer ID or email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      await registerUser(email, password, customerId);
      localStorage.setItem(
        "keepcapsule_user",
        JSON.stringify({ email, customerId })
      );
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to create account. Please try again.");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Set Your Password</h2>
      <p>
        For: <strong>{email}</strong>
      </p>
      {error && <p style={{ color: "red" }}>{error}</p>}

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
