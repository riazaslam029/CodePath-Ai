/**
 * API Client for interacting with CodePath demo backend services.
 */
const BASE_URL = "/api/v1";

export async function loginUser(email, password) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    throw new Error("Authentication failed");
  }
  return response.json();
}

export async function registerUser(email, password, fullName) {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, fullName })
  });
  return response.json();
}

export async function fetchUserProfile(token) {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.json();
}

export async function processPayment(token, amount, currency = "USD") {
  const response = await fetch(`${BASE_URL}/payments/charge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ amount, currency })
  });
  return response.json();
}
