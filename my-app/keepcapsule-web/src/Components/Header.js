// src/components/Header.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ onLoginClick, user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <header>
      <nav>
        <div className="logo">KeepCapsule</div>
        <ul className="nav-links">
          <li>
            <Link to="/">About</Link>
          </li>
          <li>
            <Link to="/">Features</Link>
          </li>
          <li>
            <Link to="/">Join Us</Link>
          </li>
          {user && (
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
          )}
        </ul>

        {user ? (
          <div>
            <span style={{ marginRight: "10px" }}>{user.email}</span>
            <button className="login-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        ) : (
          <button className="login-btn" onClick={onLoginClick}>
            Login
          </button>
        )}
      </nav>
    </header>
  );
};

export default Header;
