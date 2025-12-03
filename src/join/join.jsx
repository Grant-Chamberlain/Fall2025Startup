import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthState } from '../services/auth';

export function Join({ authState }) {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (authState !== AuthState.Authenticated) {
      navigate('/');
    }
  }, [authState, navigate]);

  async function handleCreateRoom() {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ roomCode: code }),
      });
      if (!res.ok) throw new Error('Failed to create room');

      navigate(`/tracker?room=${encodeURIComponent(code)}&user=${encodeURIComponent(username)}&color=${encodeURIComponent(selectedColor)}`);
    } catch (err) {
      alert('Error creating room');
      console.error(err);
    }
  }

  async function handleJoinRoom() {
    if (!roomCode.trim() || !username.trim() || !selectedColor) {
      return alert('Enter a room code, username, and pick a color.');
    }
    try {
      const res = await fetch(`/api/rooms/${roomCode.trim().toUpperCase()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ playerName: username, color: selectedColor }),
      });
      if (!res.ok) throw new Error('Failed to join room');

      navigate(`/tracker?room=${encodeURIComponent(roomCode.trim().toUpperCase())}&user=${encodeURIComponent(username)}&color=${encodeURIComponent(selectedColor)}`);
    } catch (err) {
      alert('Error joining room');
      console.error(err);
    }
  }

  const colors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#9B59B6', '#1ABC9C', '#E67E22', '#E74C3C'];

  return (
    <main className="container-fluid bg-secondary text-center p-4">
      {/* Username box */}
      <div className="card bg-dark text-light shadow rounded p-3 mx-auto mb-4" style={{ maxWidth: '400px' }}>
        <h5 className="mb-2">Enter Username</h5>
        <input
          type="text"
          className="form-control text-center"
          placeholder="Your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {/* Color picker box */}
      <div className="card bg-dark text-light shadow rounded p-3 mx-auto mb-4" style={{ maxWidth: '400px' }}>
        <h5 className="mb-2">Pick a Color</h5>
        <div className="d-flex flex-wrap justify-content-center">
          {colors.map((color) => (
            <div
              key={color}
              onClick={() => setSelectedColor(color)}
              style={{
                backgroundColor: color,
                width: '30px',
                height: '30px',
                margin: '5px',
                borderRadius: '4px',
                cursor: 'pointer',
                border: selectedColor === color ? '3px solid white' : '1px solid #ccc',
              }}
            />
          ))}
        </div>
      </div>

      {/* Existing Join/Start card */}
      <div className="card bg-dark text-light shadow rounded p-4 mx-auto" style={{ maxWidth: '400px' }}>
        <h3 className="mb-3">Join or Start a Room</h3>

        <button className="btn btn-success w-100 mb-3" onClick={handleCreateRoom}>
          Start New Room
        </button>

        <input
          type="text"
          className="form-control text-center mb-2"
          placeholder="Enter room code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <button className="btn btn-primary w-100" onClick={handleJoinRoom}>
          Join Room
        </button>
      </div>
    </main>
  );
}