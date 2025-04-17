import React, { useState } from "react";
import AuthModal from "./AuthModal";

const AuthContainer = ({ showModal, setShowModal, setIsLoggedIn }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = (e) => {
    e.preventDefault();

    if (!email || !password) return;

    const user = { email };

    // Simulate login/signup using localStorage
    localStorage.setItem("authUser", JSON.stringify(user));
    setIsLoggedIn(true);
    setShowModal(false);
  };

  return (
    <AuthModal
      showModal={showModal}
      setShowModal={setShowModal}
      isLogin={isLogin}
      setIsLogin={setIsLogin}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleAuth={handleAuth}
    />
  );
};

export default AuthContainer;