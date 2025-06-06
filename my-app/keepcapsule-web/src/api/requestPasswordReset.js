export const requestPasswordReset = async (email) => {
  const res = await fetch(
    "https://YOUR_API_ENDPOINT/prod/request-password-reset",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }
  );

  if (!res.ok) {
    throw new Error("Reset request failed");
  }

  return await res.json(); // contains { resetToken }
};
