// This uses localStorage for now. Replace with real DB/API later.

export const saveUserPassword = (customerId, password) => {
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  users[customerId] = { password };
  localStorage.setItem("users", JSON.stringify(users));
};

export const verifyUserPassword = (customerId, password) => {
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  return users[customerId] && users[customerId].password === password;
};

export const sendPasswordResetEmail = (email) => {
  // In real case you'd map email to customerId and send a reset link via email
  alert(`Mock: Reset link sent to ${email}`);
};
