import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthState } from './authState';

export function Login(props) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Login button handler
  const handleLogin = () => {
    if (!email || !password) {
      alert('Please enter your email and password.');
      return;
    }

    // For now, just accept any email/password
    props.onAuthChange(email, AuthState.Authenticated);

    // Navigate to Tracker page
    navigate('/tracker');
  };

  // Create User button handler
  const handleCreateUser = () => {
    const newUserName = prompt('Enter your username:');
    if (!newUserName) {
      alert('Username is required!');
      return;
    }

    // Set auth state to authenticated
    props.onAuthChange(newUserName, AuthState.Authenticated);

    // Navigate to Tracker page
    navigate('/tracker');
  };

  return (
    <main className="container-fluid bg-secondary text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
      <h1 className="mb-4">Welcome to Table Top Tracker!</h1>

      <form
        className="bg-dark p-4 rounded shadow text-light"
        style={{ width: '320px' }}
        onSubmit={(e) => e.preventDefault()} // Prevent actual form submission
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
            type="button"
            className="btn btn-primary w-50 me-2"
            onClick={handleLogin}
          >
            Login
          </button>

          <button
            type="button"
            className="btn btn-success w-50"
            onClick={handleCreateUser}
          >
            Create
          </button>
        </div>
      </form>
    </main>
  );
}
