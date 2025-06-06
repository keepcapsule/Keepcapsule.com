import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const customerId = query.get("customerId");
  const token = query.get("token");
  const email = query.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(
        "https://87kwlf9dhj.execute-api.eu-west-1.amazonaws.com/prod/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId, token, password }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");

      alert("Password reset successful! You can now log in.");
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Reset Password</h2>
      <p>
        For: <strong>{email}</strong>
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "10px", margin: "10px", width: "300px" }}
        />
        <br />
        <button type="submit" style={{ padding: "10px 30px" }}>
          Reset Password
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default ResetPassword;
