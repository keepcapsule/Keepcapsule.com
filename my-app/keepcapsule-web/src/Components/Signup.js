import React, { useState } from "react";
import { Auth } from "aws-amplify";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await Auth.signUp({ username: email, password, attributes: { email } });
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    try {
      await Auth.confirmSignUp(email, confirmCode);
      alert("Signup successful! Please log in.");
      setStep(1);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {step === 1 ? (
        <form onSubmit={handleSignup}>
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Sign Up</button>
        </form>
      ) : (
        <form onSubmit={handleConfirm}>
          <input type="text" placeholder="Confirmation Code" onChange={(e) => setConfirmCode(e.target.value)} required />
          <button type="submit">Confirm Account</button>
        </form>
      )}
    </div>
  );
};

export default Signup;
