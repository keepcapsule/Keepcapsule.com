// src/Hero.js
import React from 'react';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Never Lose a Memory Again</h1>
        <p>Secure and preserve your memories forever with KeepCapsule.</p>
        <div className="cta-container">
          <a href="https://forms.gle/G8UD9xjjRcy1C2wF9" className="cta-button">Join the Waitlist</a>
          <a href="https://buy.stripe.com/fZeeWFd3ubxp0iQ3cc" className="cta-button subscribe">Subscribe for £5.99/month</a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
