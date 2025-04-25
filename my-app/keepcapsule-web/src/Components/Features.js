// src/Features.js
import React from "react";

const Features = () => {
  return (
    <section id="features" className="features">
      <h2>Why Choose KeepCapsule?</h2>
      <div className="feature-cards">
        <div className="feature-card">
          <i className="fas fa-lock"></i>
          <h3>Secure Storage</h3>
          <p>
            We use top-tier encryption and cloud technology to keep your
            memories safe.
          </p>
        </div>
        <div className="feature-card">
          <i className="fas fa-infinity"></i>
          <h3>Forever Access</h3>
          <p>Your memories are stored permanently, retrievable anytime.</p>
        </div>
        <div className="feature-card">
          <i className="fas fa-smile"></i>
          <h3>Easy to Use</h3>
          <p>
            Simple and intuitive interface for hassle-free memory storage in a
            keep capsule.
          </p>
        </div>
        <div className="features-info">
          <h3>How KeepCapsule Works</h3>
          <p>
            KeepCapsule is your secure digital vault for life’s most important
            photos, videos, and documents. Once you’re signed up, you’ll be able
            to upload memories through our easy-to-use web app — and they’ll be
            safely stored in our encrypted cloud system.
          </p>
          <p>
            You can log in at any time to view, download, or add new memories.
            Your capsule is always available — even if you don’t log in for
            years. We're building this to be timeless, private, and dependable.
          </p>

          <h3>Why Choose KeepCapsule?</h3>
          <ul>
            <li>
              <strong>Secure Storage:</strong> We use top-tier encryption and
              trusted cloud technology to keep your memories safe.
            </li>
            <li>
              <strong>Forever Access:</strong> Everything you upload stays
              retrievable for life – no expiry dates, no hidden terms.
            </li>
            <li>
              <strong>Easy to Use:</strong> Our interface is simple, fast, and
              intuitive – no complicated setup, just upload and relax.
            </li>
          </ul>

          <h3>What Does It Cost?</h3>
          <p>
            Our pricing is simple. For just <strong>£5.99 per month</strong>,
            you’ll receive 5GB of secure storage for your memories. This will
            suit most users, and we’ll offer upgrade options soon if you need
            more space.
          </p>

          <p>
            Want to be one of the first to try KeepCapsule? Join the waitlist
            today to get early access when we launch.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;
