import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const customerId = query.get("customerId");
  const email = query.get("email");

  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleReset = (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    localStorage.setItem(
      "user_" + customerId,
      JSON.stringify({ email, password: newPassword })
    );
    alert("Password reset! You can now log in.");
    navigate("/");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Reset Password</h2>
      <p>
        For: <strong>{email}</strong>
      </p>
      <form onSubmit={handleReset}>
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={{ padding: "10px", width: "300px", marginBottom: "10px" }}
        />
        <br />
        <button type="submit" style={{ padding: "10px 30px" }}>
          Update Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
