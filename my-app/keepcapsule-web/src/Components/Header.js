// src/components/Header.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/KeepCapsuleLogo.png";

const Header = ({ onLoginClick, user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <header>
      <nav>
        <div className="nav-left">
          <Link to="/">
            <img src={Logo} alt="KeepCapsule Logo" className="logo-image" />
          </Link>
        </div>

        <div className="nav-center">
          <ul className="nav-links">
            <li>
              <Link to="/">Home</Link>
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
        </div>

        <div className="nav-right">
          {user ? (
            <>
              <span style={{ marginRight: "10px" }}>{user.email}</span>
              <button className="login-btn" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <button className="login-btn" onClick={onLoginClick}>
              Login
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
