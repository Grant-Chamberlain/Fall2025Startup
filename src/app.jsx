import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';

import { Login } from './login/login';
import { Join } from './join/join';
import { Tracker } from './tracker/tracker';
import { About } from './about/about';

import { AuthState, getAuthStatus } from './services/auth';

export default function App() {
  const [userName, setUserName] = useState('');
  const [authState, setAuthState] = useState(AuthState.Unauthenticated);
  const [loading, setLoading] = useState(true);

  const NotFound = () => (
    <main className="container-fluid bg-secondary text-center">
      404: Return to sender. Address unknown.
    </main>
  );

  // Check backend session on first load
  useEffect(() => {
    async function checkSession() {
      try {
        const status = await getAuthStatus();
        if (status.authenticated) {
          setUserName(status.email);
          setAuthState(AuthState.Authenticated);
        } else {
          setUserName('');
          setAuthState(AuthState.Unauthenticated);
        }
      } catch (err) {
        console.error('Failed to check auth status:', err);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  if (loading) {
    return (
      <main className="container-fluid bg-secondary text-center min-vh-100 d-flex justify-content-center align-items-center">
        <h2>Loading...</h2>
      </main>
    );
  }

  return (
    <BrowserRouter>
      <div className="body bg-dark text-light">
        <header className="container-fluid">
          <nav className="navbar navbar-dark">
            <div className="navbar-brand">Table Top Tracker</div>
            <menu className="navbar-nav">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">Login</NavLink>
              </li>

              {authState === AuthState.Authenticated && (
                <>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/join">Join</NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/tracker">Tracker</NavLink>
                  </li>
                </>
              )}

              <li className="nav-item">
                <NavLink className="nav-link" to="/about">About</NavLink>
              </li>
            </menu>
          </nav>
        </header>

        <Routes>
          <Route
            path="/"
            element={
              <Login
                userName={userName}
                authState={authState}
                onAuthChange={(newUserName, newAuthState) => {
                  setUserName(newUserName);
                  setAuthState(newAuthState);
                }}
              />
            }
          />
          <Route path="/join" element={<Join authState={authState} />} />
          <Route path="/tracker" element={<Tracker authState={authState} />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <footer className="bg-dark text-white-50 mt-auto">
          <div className="container-fluid d-flex justify-content-between">
            <span className="text-reset">Grant Chamberlain</span>
            <a
              className="text-reset"
              href="https://github.com/Grant-Chamberlain/Fall2025Startup"
            >
              Source
            </a>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}