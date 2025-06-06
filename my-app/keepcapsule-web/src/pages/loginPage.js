import React, { useState } from "react";
import { login } from "../components/auth/AuthService";
import { useNavigate } from "react-router-dom";

// ⚠️ MOCK ONLY — not real backend auth
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setErr("Login failed");
    }
  };

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h2>Login to KeepCapsule</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <br />
        <br />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <br />
        <br />
        <button type="submit">Login</button>
      </form>
      {err && <p style={{ color: "red" }}>{err}</p>}
    </div>
  );
};

export default LoginPage;
