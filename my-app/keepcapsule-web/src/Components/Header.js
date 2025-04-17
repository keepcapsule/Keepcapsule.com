// src/components/Header.js
import React from "react";

const Header = ({ onLoginClick }) => {
  return (
    <header>
      <nav>
        <div className="logo">KeepCapsule</div>
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#join">Join Us</a></li>
        </ul>
        <button className="login-btn" onClick={onLoginClick}>Login</button>
      </nav>
    </header>
  );
};

export default Header; 