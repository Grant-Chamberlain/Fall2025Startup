import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthState } from '../login/authState';


export function Tracker({ authState }) {
  const navigate = useNavigate();

   useEffect(() => {
    if (authState !== AuthState.Authenticated) {
      navigate('/');
    }
  }, [authState, navigate]);

  
  // Initialize players from localStorage or default to 4
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('players');
    return saved
      ? JSON.parse(saved)
      : Array(4).fill({
        name: '',
        health: '',
        energy: '',
        poison: '',
        other: '',
      });
  });

  // Save to localStorage whenever players change
  useEffect(() => {
    localStorage.setItem('players', JSON.stringify(players));
  }, [players]);

  // Update a specific player's field
  function handleInputChange(index, field, value) {
    const updatedPlayers = [...players];
    updatedPlayers[index][field] = value;
    setPlayers(updatedPlayers);
  }

  // Add new player
  function handleAddPlayer() {
    setPlayers([
      ...players,
      { name: '', health: '', energy: '', poison: '', other: '' },
    ]);
  }


  // Remove a player
  function handleRemovePlayer(index) {
    if (players.length <= 2) {
      alert(`Cannot remove player ${index + 1} when there are only two players left.`);
      return;
    }
    const updatedPlayers = players.filter((_, i) => i !== index);
    setPlayers(updatedPlayers);
  }


  // Reset all fields (but keep same number of players)
  function handleReset() {
    if (window.confirm('Are you sure you want to reset all stats?')) {
      const resetPlayers = players.map(() => ({
        name: '',
        health: '',
        energy: '',
        poison: '',
        other: '',
      }));
      setPlayers(resetPlayers);
      localStorage.removeItem('players');
    }
  }

  return (
    <main className="bg-secondary text-light min-vh-100 p-4">
      <div className="container">
        {/* Top Controls */}
        <div className="d-flex justify-content-end mb-4 gap-2">
          <button className="btn btn-success" onClick={handleAddPlayer}>
            ➕ Add Player
          </button>
          <button className="btn btn-danger" onClick={handleReset}>
            🔄 Reset All
          </button>
        </div>
        <div className="row g-4 mb-4">
          {players.map((player, i) => (
            <div key={i} className={`col-12 col-sm-6 col-lg-4 ${players.length === 4 ? 'col-lg-6' : 'col-lg-4'} `}>
              <div
              className={`card text-center shadow bg-dark text-light d-flex flex-column ${players.length !== 4 ? 'h-100' : ''
                }`}>

              {/* Card Header: Player Name */}
              <div className="card-header p-2">
                <input
                  type="text"
                  className="form-control form-control-sm text-center fw-bold fs-4"
                  placeholder={`Player ${i + 1}`}
                  value={player.name}
                  onChange={(e) => handleInputChange(i, 'name', e.target.value)}
                />
              </div>

              {/* Card Image */}
              <img
                src="kalia.png"
                className="card-img-top"
                alt="Commander"
                style={{ objectFit: 'cover', height: '250px' }}
              />

              {/* Card Body: Stats */}
              <div className="card-body flex-grow-1 d-flex flex-column justify-content-center">
                <div className="row g-2 mb-3">
                  {['health', 'energy', 'poison', 'other'].map((field) => (
                    <div className="col" key={field}>
                      <input
                        type={field === 'other' ? 'text' : 'number'}
                        className="form-control text-center"
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={player[field]}
                        onChange={(e) => handleInputChange(i, field, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer: Remove Button */}
              <div className="card-footer p-2">
                <button
                  className="btn btn-sm btn-warning w-100"
                  onClick={() => handleRemovePlayer(i)}
                  disabled={players.length <= 2}
                >
                  Remove Player
                </button>
              </div>

            </div>
            </div>
          ))}

      </div>

    </div>
    </main >
  );
}
