// App.jsx
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Join } from './join/join';
import { Tracker } from './tracker/tracker';
import { About } from './about/about';
import { AuthState } from './login/authState';
import { getAuthStatus } from './services/auth'; 

export default function App() {
  const [userName, setUserName] = React.useState(localStorage.getItem('userName') || '');
  const [authState, setAuthState] = React.useState(
    userName ? AuthState.Authenticated : AuthState.Unauthenticated
  );
  const [loading, setLoading] = React.useState(true);

  // Check cookie-based login on first load
  React.useEffect(() => {
    async function checkLogin() {
      try {
        const data = await getAuthStatus();
        if (data.authenticated) {
          setUserName(data.email);
          setAuthState(AuthState.Authenticated);
          localStorage.setItem('userName', data.email);
        } else {
          setUserName('');
          setAuthState(AuthState.Unauthenticated);
          localStorage.removeItem('userName');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setLoading(false);
      }
    }
    checkLogin();
  }, []);

  if (loading) {
    return <div className="text-center text-light p-5">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <div className="body bg-dark text-light">
        <header className="container-fluid">
          <nav className="navbar navbar-dark">
            <div className="navbar-brand">Table Top Tracker</div>
            <menu className="navbar-nav">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">
                  Login
                </NavLink>
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
                  if (newAuthState === AuthState.Authenticated) {
                    localStorage.setItem('userName', newUserName);
                  } else {
                    localStorage.removeItem('userName');
                  }
                }}
              />
            }
          />
          <Route path="/join" element={<Join authState={authState} />} />
          <Route path="/tracker" element={<Tracker authState={authState} />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <footer className="bg-dark text-white-50">
          <div className="container-fluid">
            <span className="text-reset">Grant Chamberlain</span>
            <a className="text-reset" href="https://github.com/Grant-Chamberlain/Fall2025Startup">
              Source
            </a>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <main className="container-fluid bg-secondary text-center">
      404: Return to sender. Address unknown.
    </main>
  );
}
