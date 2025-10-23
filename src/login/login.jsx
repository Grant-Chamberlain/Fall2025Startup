import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthState } from './authState';

export function Login({ userName, authState, onAuthChange }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handle login
  function handleLogin() {
    if (!email.trim()) {
      alert('Please enter a username');
      return;
    }
    onAuthChange(email, AuthState.Authenticated);
    navigate('/tracker');
  }

  // Handle logout
  function handleLogout() {
    onAuthChange('', AuthState.Unauthenticated);
    localStorage.removeItem('userName');
    navigate('/');
  }

  // Handle create user
  const handleCreateUser = () => {
    const newUserName = prompt('Enter your username:');
    if (!newUserName) {
      alert('Username is required!');
      return;
    }

    onAuthChange(newUserName, AuthState.Authenticated);
    localStorage.setItem('userName', newUserName);
    navigate('/tracker');
  };

  return (
    <main className="container-fluid bg-secondary text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
      <h1 className="mb-4">Welcome to Table Top Tracker!</h1>

      {authState === AuthState.Authenticated ? (
        <div>
          <p>Logged in as: <strong>{userName}</strong></p>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <form
          className="bg-dark p-4 rounded shadow text-light"
          style={{ width: '320px' }}
          onSubmit={(e) => e.preventDefault()} // prevent form submission
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
      )}
    </main>
  );
}

