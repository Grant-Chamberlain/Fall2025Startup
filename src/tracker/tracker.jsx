import React, { useState, useEffect } from 'react';


export function Tracker() {
  // Initialize players from localStorage or default to 4 separate objects
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('players');
    return saved
      ? JSON.parse(saved)
      : Array.from({ length: 4 }, () => ({
          name: '',
          health: '',
          energy: '',
          poison: '',
          other: '',
        }));
  });

  // Save players to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('players', JSON.stringify(players));
  }, [players]);

  // Update a specific field for a specific player
  function handleInputChange(index, field, value) {
    const updatedPlayers = players.map((player, i) =>
      i === index ? { ...player, [field]: value } : player
    );
    setPlayers(updatedPlayers);
  }

  // Add new player
  function handleAddPlayer() {
    setPlayers([
      ...players,
      { name: '', health: '', energy: '', poison: '', other: '' },
    ]);
  }

  // Remove a player (minimum 2)
  function handleRemovePlayer(index) {
    if (players.length <= 2) {
      alert('Cannot remove player when only 2 are left.');
      return;
    }
    const updatedPlayers = players.filter((_, i) => i !== index);
    setPlayers(updatedPlayers);
  }

  // Reset all fields (keeps same number of players)
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
            <div
              key={i}
              className={`col-12 col-sm-6 col-lg-4 ${
                players.length === 4 ? 'col-lg-6' : ''
              }`}
            >
              <div className="card text-center shadow bg-dark text-light d-flex flex-column h-100">
                {/* Player Name */}
                <div className="card-header p-2">
                  <input
                    type="text"
                    className="form-control form-control-sm text-center fw-bold fs-4"
                    placeholder={`Player ${i + 1}`}
                    value={player.name}
                    onChange={(e) =>
                      handleInputChange(i, 'name', e.target.value)
                    }
                  />
                </div>

                {/* Card Image */}
                <img
                  src="kalia.png"
                  className="card-img-top"
                  alt="Commander"
                  style={{ objectFit: 'cover', height: '250px' }}
                />

                {/* Stats */}
                <div className="card-body flex-grow-1 d-flex flex-column justify-content-center">
                  <div className="row g-2 mb-3">
                    {['health', 'energy', 'poison', 'other'].map((field) => (
                      <div className="col" key={field}>
                        <input
                          type={field === 'other' ? 'text' : 'number'}
                          className="form-control text-center"
                          placeholder={
                            field.charAt(0).toUpperCase() + field.slice(1)
                          }
                          value={player[field]}
                          onChange={(e) =>
                            handleInputChange(i, field, e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Remove Player */}
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
    </main>
  );
}
