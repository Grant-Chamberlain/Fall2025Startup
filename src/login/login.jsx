import React from 'react';

export function Login() {
  return (
    <main className="container-fluid bg-secondary text-center pt-3">
      <h1>Welcome to Table Top Tracker</h1>
    
      <form method="get" action="join.html" className="mt-2">
        <div className="input-group mb-1">
          
          <input className= "form-control" type="text" placeholder="your@email.com" />
        </div>
        <div className="input-group mb-3">
          
          <input className="form-control" type="password" placeholder="password" />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
        <button type="submit" className="btn btn-success">Create</button>
      </form>
    </main>

  );
}