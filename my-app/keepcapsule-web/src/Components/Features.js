// src/Features.js
import React from 'react';

const Features = () => {
  return (
    <section id="features" className="features">
      <h2>Why Choose KeepCapsule?</h2>
      <div className="feature-cards">
        <div className="feature-card">
          <i className="fas fa-lock"></i>
          <h3>Secure Storage</h3>
          <p>We use top-tier encryption and cloud technology to keep your memories safe.</p>
        </div>
        <div className="feature-card">
          <i className="fas fa-infinity"></i>
          <h3>Forever Access</h3>
          <p>Your memories are stored permanently, retrievable anytime.</p>
        </div>
        <div className="feature-card">
          <i className="fas fa-smile"></i>
          <h3>Easy to Use</h3>
          <p>Simple and intuitive interface for hassle-free memory storage.</p>
        </div>
      </div>
    </section>
  );
};

export default Features;
