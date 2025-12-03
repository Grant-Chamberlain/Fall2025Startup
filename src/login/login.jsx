import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthState, login, register, logout } from '../services/auth';

export function Login({ userName, authState, onAuthChange }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Handlers ---
  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await login(email, password);
      onAuthChange(data.email, AuthState.Authenticated);
      navigate('/tracker');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser() {
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await register(email, password);
      onAuthChange(data.email, AuthState.Authenticated);
      navigate('/tracker');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);
    setError('');
    try {
      await logout();
      onAuthChange('', AuthState.Unauthenticated);
      navigate('/');
    } catch (err) {
      setError('Logout failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  // --- Render ---
  return (
    <main className="container-fluid bg-secondary text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
      <h1 className="mb-4">Welcome to Table Top Tracker!</h1>

      {authState === AuthState.Authenticated ? (
        <div>
          <p>Logged in as: <strong>{userName}</strong></p>
          <button
            className="btn btn-danger"
            onClick={handleLogout}
            disabled={loading}
          >
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      ) : (
        <form
          className="bg-dark p-4 rounded shadow text-light"
          style={{ width: '320px' }}
          onSubmit={(e) => e.preventDefault()}
        >
          {error && <div className="alert alert-danger mb-3">{error}</div>}

          <div className="mb-3">
            <input
              className="form-control"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <input
              className="form-control"
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-primary w-50 me-2"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <button
              type="button"
              className="btn btn-success w-50"
              onClick={handleCreateUser}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}