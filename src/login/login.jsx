import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleLogin(e) {
    e.preventDefault();

    // Simple placeholder login logic
    if (email === 'test@example.com' && password === '1234') {
      alert('Login successful!');
      navigate('/join');
    } else {
      alert('Invalid email or password.');
    }
  }

  function handleCreateError(e) {
    e.preventDefault();
    alert('Account creation is currently disabled. Please contact support.');
  }

  return (
    <main className="container-fluid bg-secondary text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
      <h1 className="mb-4">Welcome to Table Top Tracker!</h1>

      <form
        className="bg-dark p-4 rounded shadow text-light"
        style={{ width: '320px' }}
      >
        <div className="mb-3">
          <input
            className="form-control"
            type="text"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <input
            className="form-control"
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="d-flex justify-content-between">
          <button
            type="submit"
            className="btn btn-primary w-50 me-2"
            onClick={handleLogin}
          >
            Login
          </button>
          <button
            type="button"
            className="btn btn-danger w-50"
            onClick={handleCreateError}
          >
            Create
          </button>
        </div>
      </form>
    </main>
  );
}

