// --- Auth state enum-like object ---
export const AuthState = {
  Unknown: 'unknown',
  Authenticated: 'authenticated',
  Unauthenticated: 'unauthenticated',
};

// Base URL for API calls — relative so it works in dev and production
const API_BASE_URL = '/api';

// Helper: safely parse JSON only if there's a body
async function safeJson(res) {
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// --- Authentication API wrappers ---

// Login
export async function login(email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include', // include cookies
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.msg || 'Login failed');
  return data;
}

// Register
export async function register(email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/create`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.msg || 'Registration failed');
  return data;
}

// Logout
export async function logout() {
  const res = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    const data = await safeJson(res);
    throw new Error(data?.msg || 'Logout failed');
  }
  return true;
}

// Auth status
export async function getAuthStatus() {
  const res = await fetch(`${API_BASE_URL}/auth/status`, {
    credentials: 'include',
  });

  const data = await safeJson(res);
  if (!res.ok) return { authenticated: false };
  return data;
}