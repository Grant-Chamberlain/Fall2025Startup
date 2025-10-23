import React from 'react';

export function Join() {
  return (
    <main className="container-fluid bg-secondary text-center">
      <br />

      <div>
        <label htmlFor="code">Room Code</label>
        <input
          type="text"
          id="code"
          className="form-control"
          placeholder="Your Code Here"
        />
        <button type="submit" className="btn btn-success">
          Join
        </button>
      </div>

      <br />

      <div className="friends">
        <span className="fs-3">Join a Friend:</span>
      </div>

      <div className="container mt-4 d-flex justify-content-center">
        <div
          className="card bg-dark text-light shadow rounded"
          style={{ width: "400px" }}
        >
          <div className="card-header text-center">Friends Online</div>
          <div className="card-body p-0">
            <table className="table table-dark table-hover table-striped table-bordered mb-0 text-center">
              <thead>
                <tr>
                  <th scope="col">Friend</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Alice</td>
                  <td>
                    <span className="badge bg-success">Online</span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary">Join</button>
                  </td>
                </tr>
                <tr>
                  <td>Bob</td>
                  <td>
                    <span className="badge bg-danger">Offline</span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-secondary" disabled>
                      Join
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Charlie</td>
                  <td>
                    <span className="badge bg-warning text-dark">Away</span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary">Join</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <br />
    </main>
  );
}