// src/auth/AuthService.js
const users = [
    {
      email: "jamieevans752@yahoo.co.uk",
      password: "KeepCapsule2025",
      role: "user",
      paid: true,
    },
    {
      email: "admin@keepcapsule.com",
      password: "admin123",
      role: "admin",
      paid: true,
    },
  ];
  
  export function login(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      return user;
    }
    throw new Error("Invalid credentials");
  }
  
  export function logout() {
    localStorage.removeItem("user");
  }
  
  export function getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }
  