import React from 'react';


export function Tracker() {
  return (
    <main className="bg-secondary text-light">
      <div className="container mt-4">
        <div className="row g-4 mb-4">

          {[...Array(6)].map((_, i) => (
            <div key={i} className="col-12 col-sm-6 col-lg-4">
              <div className="card text-center shadow bg-dark text-light">
                <div className="card-header p-2">
                  <input
                    type="text"
                    className="form-control form-control-sm text-center fw-bold fs-3"
                    placeholder="Username"
                  />
                </div>

                <img src="kalia.png" className="card-img-top" alt="Commander" />

                <div className="card-body">
                  <div className="row g-2">
                    <div className="col">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Health"
                      />
                    </div>
                    <div className="col">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Energy"
                      />
                    </div>
                    <div className="col">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Poison"
                      />
                    </div>
                    <div className="col">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Other"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </main>
  );
}
