import React, { useState } from "react";
import { Auth } from "aws-amplify";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await Auth.signIn(email, password);
      const token = user.signInUserSession.idToken.jwtToken;
      localStorage.setItem("authToken", token); // Store token in localStorage
      onLogin(token);
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    }
  };
  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
