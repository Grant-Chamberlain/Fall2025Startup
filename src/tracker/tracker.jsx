import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function Tracker() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roomCode = queryParams.get('room');
  const currentUser = queryParams.get('user');
  const currentColor = queryParams.get('color'); // 👈 required color

  const [players, setPlayers] = useState([]);
  const [ws, setWs] = useState(null);
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [error, setError] = useState(null);

  useEffect(() => {
    // Require color before joining
    if (!currentColor) {
      setError('You must select a color before joining a room.');
      return;
    }

    const socket = new WebSocket('ws://localhost:4000'); // adjust to your backend URL
    setWs(socket);

    socket.onopen = () => {
      console.log('✅ Connected to WebSocket server');

      if (userId) {
        // Rejoin with saved userId
        socket.send(JSON.stringify({
          type: 'rejoin-room',
          roomCode,
          userId,
        }));
      } else {
        // First join with color
        socket.send(JSON.stringify({
          type: 'join-room',
          roomCode,
          name: currentUser,
          color: currentColor, // 👈 send color
        }));
      }
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === 'joined-room') {
        setUserId(msg.userId);
        localStorage.setItem('userId', msg.userId);
      }

      if (msg.type === 'room-update') {
        setPlayers(msg.room.players || []);
      }

      if (msg.type === 'rejoined-room') {
        setPlayers(msg.room.players || []);
      }

      if (msg.type === 'error') {
        setError(msg.message);
      }
    };

    socket.onclose = () => {
      console.log('❌ Disconnected from WebSocket server');
    };

    return () => {
      socket.close();
    };
  }, [roomCode, currentUser, currentColor, userId]);

  // Send update-stats message
  function updateStat(playerId, field, delta) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const player = players.find(p => p.userId === playerId);
    if (!player) return;

    const newValue = player[field] + delta;

    ws.send(JSON.stringify({
      type: 'update-stats',
      roomCode,
      userId: playerId,
      field,
      value: newValue,
    }));
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <main className="container-fluid bg-secondary text-center p-4">
      <h2 className="mb-4">Room: {roomCode}</h2>

      <div className="table-responsive">
        <table className="table table-dark table-striped table-bordered align-middle">
          <thead>
            <tr>
              <th>Color 🎨</th>
              <th>Player</th>
              <th>Health ❤️</th>
              <th>Energy ⚡</th>
              <th>Poison ☠️</th>
              <th>Other</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.userId}>
                <td>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: player.color,
                      border: '2px solid #fff',
                      margin: 'auto',
                    }}
                  />
                </td>
                <td>{player.name}</td>
                <td>
                  {player.health}
                  <div>
                    <button
                      className="btn btn-sm btn-danger me-1"
                      onClick={() => updateStat(player.userId, 'health', -1)}
                    >
                      -
                    </button>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => updateStat(player.userId, 'health', +1)}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td>
                  {player.energy}
                  <div>
                    <button
                      className="btn btn-sm btn-danger me-1"
                      onClick={() => updateStat(player.userId, 'energy', -1)}
                    >
                      -
                    </button>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => updateStat(player.userId, 'energy', +1)}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td>
                  {player.poison}
                  <div>
                    <button
                      className="btn btn-sm btn-danger me-1"
                      onClick={() => updateStat(player.userId, 'poison', -1)}
                    >
                      -
                    </button>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => updateStat(player.userId, 'poison', +1)}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td>{player.other}
                  <div>
                    <button
                      className="btn btn-sm btn-danger me-1"
                      onClick={() => updateStat(player.userId, 'poison', -1)}
                    >
                      -
                    </button>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => updateStat(player.userId, 'poison', +1)}
                    >
                      +
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}