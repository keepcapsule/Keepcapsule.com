import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [customerId, setCustomerId] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulate a lookup (we assume you somehow map customerId to email)
    for (let key in localStorage) {
      if (key.startsWith("user_")) {
        const user = JSON.parse(localStorage.getItem(key));
        if (user.email === email) {
          const id = key.replace("user_", "");
          setCustomerId(id);

          // Simulate sending a reset link
          alert(`Reset link sent! (Simulated)\nClick OK to proceed to reset.`);

          // Simulate redirecting to the reset-password page
          navigate(
            `/reset-password?customerId=${id}&email=${encodeURIComponent(
              email
            )}`
          );
          return;
        }
      }
    }

    alert("Email not found.");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Forgot Password?</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "10px", width: "300px", marginBottom: "10px" }}
        />
        <br />
        <button type="submit" style={{ padding: "10px 30px" }}>
          Send Reset Link
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
