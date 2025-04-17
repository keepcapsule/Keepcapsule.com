import React from "react";
import "./auth.css";

const AuthModal = ({
  showModal,
  setShowModal,
  isLogin,
  setIsLogin,
  email,
  setEmail,
  password,
  setPassword,
  handleAuth,
}) => {
  if (!showModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLogin) {
      handleAuth(e);
    } else {
      const encodedEmail = encodeURIComponent(email);
      window.location.href = `https://buy.stripe.com/fZeeWFd3ubxp0iQ3cc?prefilled_email=${encodedEmail}`;
    }
  };

  const goToForgotPassword = () => {
    setShowModal(false);
    window.location.href = "/forgot-password";
  };

  return (
    <div className="auth-modal">
      <div className="auth-content">
        <button className="auth-close" onClick={() => setShowModal(false)}>
          ✖
        </button>
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={isLogin}
          />

          <button type="submit">
            {isLogin ? "Login" : "Continue to Payment"}
          </button>
        </form>

        {isLogin && (
          <p
            style={{
              marginTop: "10px",
              cursor: "pointer",
              color: "#2d89ef",
              fontWeight: "500",
            }}
            onClick={goToForgotPassword}
          >
            Forgot password?
          </p>
        )}

        <div className="auth-controls">
          <p
            onClick={() => setIsLogin((prev) => !prev)}
            style={{ cursor: "pointer", marginTop: "10px" }}
          >
            {isLogin ? "No account? Sign up" : "Already have an account? Login"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
