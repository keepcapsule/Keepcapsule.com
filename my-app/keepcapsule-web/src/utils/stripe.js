// src/utils/stripe.js
import { v4 as uuidv4 } from "uuid";

export const startStripeCheckout = async (email) => {
  try {
    const customerId = uuidv4(); // generate temporary Stripe ref

    localStorage.setItem("pending_user", JSON.stringify({ email, customerId }));

    const res = await fetch(
      "https://87kwlf9dhj.execute-api.eu-west-1.amazonaws.com/prod/create-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          customerId,
          priceId: "price_1RWdnjFvZgkjkekwfGfpuvaw", // ✅ test plan 10p
        }),
      }
    );

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error(data.message || "Checkout URL not received.");
    }
  } catch (err) {
    console.error("Checkout failed:", err);
    alert("Stripe redirect failed");
  }
};
