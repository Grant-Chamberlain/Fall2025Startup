import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Join } from './join/join';
import { Tracker } from './tracker/tracker';
import { About } from './about/about';


export default function App() {
  return (
    <BrowserRouter>
      <div className="body bg-dark text-light">
        <header className="container-fluid">
          <nav className="navbar fixed-top navbar-dark">
            <div className="navbar-brand">
              Table Top Tracker<sup></sup>
            </div>
            <menu className="navbar-nav">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">
                  Login
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="join">
                  Join
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="tracker">
                  Scores
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="about">
                  About
                </NavLink>
              </li>
            </menu>
          </nav>
        </header>

        <Routes>
            <Route path='/' element={<Login />} exact />
            <Route path='/join' element={<Join />} />
            <Route path='/tracker' element={<Tracker />} />
            <Route path='/about' element={<About />} />
            <Route path='*' element={<NotFound />} />
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
   
  
  function NotFound() {
  return <main className="container-fluid bg-secondary text-center">404: Return to sender. Address unknown.</main>;
}
}