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
            Top-tier encryption and trusted cloud tech protect your memories.
          </p>
        </div>
        <div className="feature-card">
          <i className="fas fa-infinity"></i>
          <h3>Forever Access</h3>
          <p>Your memories are always available, no expiry dates, ever.</p>
        </div>
        <div className="feature-card">
          <i className="fas fa-smile"></i>
          <h3>Easy to Use</h3>
          <p>Simple and intuitive interface for stress-free memory storage.</p>
        </div>
      </div>

      <div className="features-info">
        <h3>What is KeepCapsule?</h3>
        <p>
          KeepCapsule is your secure digital vault for life’s most important
          photos, videos, and documents. Upload cherished memories via our clean
          and easy-to-use web app, and they’ll be stored securely forever.
        </p>

        <p>
          You can log in at any time to view, download, or add new content —
          even if you haven’t visited your capsule in years. This is your
          timeless personal archive.
        </p>

        <h3>Key Benefits</h3>
        <ul>
          <li>
            <strong>Secure Storage:</strong> Your files are encrypted and backed
            by trusted AWS cloud infrastructure.
          </li>
          <li>
            <strong>Forever Access:</strong> You’ll never lose access to your
            capsule. What you upload stays with you for life.
          </li>
          <li>
            <strong>Simple Experience:</strong> Upload from any device with no
            complicated steps — just create your capsule and start adding
            memories.
          </li>
        </ul>

        <h3>How Much Does It Cost?</h3>
        <p>
          For just <strong>£5.99 per month</strong>, you get 5GB of encrypted
          storage. That’s enough for thousands of photos or important documents
          — and we'll offer upgrade plans soon for larger memory needs.
        </p>

        <p>
          Want to be one of the first to try KeepCapsule?{" "}
          <strong>Join the waitlist</strong> today and you’ll be notified as
          soon as we launch.
        </p>
      </div>
    </section>
  );
};

export default Features;
