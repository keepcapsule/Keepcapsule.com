import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(
        "https://87kwlf9dhj.execute-api.eu-west-1.amazonaws.com/prod/request-password-reset",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setSuccess(true);
      setTimeout(() => {
        navigate(
          `/reset-password?customerId=${data.customerId}&token=${data.token}&email=${email}`
        );
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Forgot Password</h2>
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
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && (
        <p style={{ color: "green" }}>Reset link sent! Redirecting...</p>
      )}
    </div>
  );
};

export default ForgotPassword;
