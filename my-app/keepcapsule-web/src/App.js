import React from "react";
import "./App.css";
import Header from "./Components/Header";
import Hero from "./Components/Hero";
import About from "./Components/About";
import Features from "./Components/Features";
import Join from "./Components/Join";
import Footer from "./Components/Footer";
import AuthComponent from "./Components/Auth"; // ✅ Import Auth Component

function App() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <AuthComponent /> {/* ✅ Ensure it's inside */}
      <About />
      <Features />
      <Join />
      <Footer />
    </div>
  );
}

export default App;
