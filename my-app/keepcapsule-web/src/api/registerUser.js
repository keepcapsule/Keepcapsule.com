export async function registerUser(email, password, customerId) {
  const response = await fetch(
    "https://87kwlf9dhj.execute-api.eu-west-1.amazonaws.com/prod/register-v2",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, customerId }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Registration failed: ${error}`);
  }

  return await response.json();
}
