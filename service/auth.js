const API_BASE_URL = '/api'; // same origin

export async function login(email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, { // <- remove extra /api
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.msg || 'Login failed');
  }

  return res.json();
}

export async function register(email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/create`, { // <- remove extra /api
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.msg || 'Registration failed');
  }

  return res.json();
}

export async function logout() {
  const res = await fetch(`${API_BASE_URL}/auth/logout`, { // <- remove extra /api
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.msg || 'Logout failed');
  }

  return true;
}

export async function getAuthStatus() {
  const res = await fetch(`${API_BASE_URL}/auth/status`, { // <- remove extra /api
    credentials: 'include',
  });

  if (!res.ok) return { authenticated: false };
  return res.json();
}
