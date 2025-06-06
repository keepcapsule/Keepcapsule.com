export async function loginUser(email, password) {
  const response = await fetch(
    "https://87kwlf9dhj.execute-api.eu-west-1.amazonaws.com/prod/login-v2",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }
  );

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.message || "Login failed");
  }

  return body;
}
