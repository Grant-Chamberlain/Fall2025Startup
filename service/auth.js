// src/services/auth.js

const API_BASE = 'http://localhost:3000/api'; // your Express server

// Helper: handle JSON and error messages from server
async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.msg || 'Something went wrong';
    throw new Error(msg);
  }
  return data;
}

// Create (register) a new user
export async function register(email, password) {
  const res = await fetch(`${API_BASE}/auth/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // allow cookies to be stored
  });
  return handleResponse(res);
}

// Login existing user
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
  return handleResponse(res);
}

// Logout user
export async function logout() {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok && res.status !== 204) {
    throw new Error('Failed to logout');
  }
}

// Check current auth status (used for auto-login)
export async function getAuthStatus() {
  const res = await fetch(`${API_BASE}/auth/status`, {
    credentials: 'include',
  });
  return handleResponse(res);
}

