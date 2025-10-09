import React from 'react';

export function Login() {
  return (
    <main className="container-fluid bg-secondary text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
      <h1 className="mb-4">Welcome to Table Top Tracker!</h1>

      <form
        method="get"
        action="join"
        className="bg-dark p-4 rounded shadow text-light"
        style={{ width: "320px" }}
      >
        <div className="mb-3">
          <input
            className="form-control"
            type="text"
            placeholder="your@email.com"
          />
        </div>
        <div className="mb-3">
          <input
            className="form-control"
            type="password"
            placeholder="password"
          />
        </div>
        <div className="d-flex justify-content-between">
          <button type="submit" className="btn btn-primary w-50 me-2">
            Login
          </button>
          <button type="submit" className="btn btn-success w-50">
            Create
          </button>
        </div>
      </form>
    </main>
  );
}

