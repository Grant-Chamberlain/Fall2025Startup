const API_URL = 'http://localhost:3000/api/auth';

export async function login(email, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function register(email, password) {
  const res = await fetch(`${API_URL}/create`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Registration failed');
  return res.json();
}

export async function logout() {
  const res = await fetch(`${API_URL}/logout`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Logout failed');
  return true;
}

export async function getAuthStatus() {
  const res = await fetch(`${API_URL}/status`, {
    method: 'GET',
    credentials: 'include',
  });
  return res.json();
}


