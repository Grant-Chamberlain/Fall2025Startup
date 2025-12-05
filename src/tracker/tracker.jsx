import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function Tracker() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const roomCode = queryParams.get('room');
  const currentUser = queryParams.get('user');
  const currentColor = queryParams.get('color');

  const [ws, setWs] = useState(null);
  const [players, setPlayers] = useState([]);
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [error, setError] = useState(null);

  //
  // ---------------------------------------------------------
  // WebSocket: Join or Rejoin Only (NO create-room)
  // ---------------------------------------------------------
  //
  useEffect(() => {
    if (!currentColor) {
      setError('You must select a color before joining.');
      return;
    }

    const socket = new WebSocket('wss://startup.tabletoptracker.click');
    setWs(socket);

    socket.onopen = () => {
      if (userId) {
        socket.send(JSON.stringify({
          type: 'rejoin-room',
          roomCode,
          userId
        }));
      } else {
        socket.send(JSON.stringify({
          type: 'join-room',
          roomCode,
          name: currentUser,
          color: currentColor
        }));
      }
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      switch (msg.type) {

        case 'joined-room':
          setUserId(msg.userId);
          localStorage.setItem('userId', msg.userId);
          break;

        case 'rejoined-room':
        case 'room-update':
          setPlayers(msg.room.players || []);
          break;

        case 'left-room':
          setPlayers([]);
          break;

        case 'error':
          setError(msg.message);
          localStorage.removeItem('userId');
          socket.close();
          break;

        default:
          console.warn('Unknown WS msg:', msg);
      }
    };

    return () => socket.close();
  }, [roomCode, currentColor, currentUser]);

  //
  // ---------------------------------------------------------
  // Helper functions
  // ---------------------------------------------------------
  //
  function updateStat(playerId, field, delta) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const player = players.find(p => p.userId === playerId);
    if (!player) return;

    ws.send(JSON.stringify({
      type: 'update-stats',
      roomCode,
      userId: playerId,
      field,
      value: player[field] + delta
    }));
  }

  function leaveRoom() {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify({
      type: 'leave-room',
      roomCode,
      userId
    }));

    localStorage.removeItem('userId');
    ws.close();
    navigate('/join');
  }

  //
  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------
  //
  if (error) {
    return (
      <div className="alert alert-danger text-center mt-4">
        {error}
      </div>
    );
  }

  return (
    <main className="container-fluid bg-secondary min-vh-100 p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-white">Players</h2>
        <div>
          <span className="text-white me-3">Room: {roomCode}</span>
          <button className="btn btn-warning" onClick={leaveRoom}>
            Leave Room
          </button>
        </div>
      </div>

      <div className="row">
        {players.map(player => (
          <div className="col-md-10 mb-3 mx-auto" key={player.userId}>
            <div className="card bg-dark text-white h-100">

              <div
                className="card-header text-center"
                style={{
                  backgroundColor: player.color,
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}
              >
                {player.name}
              </div>

              <div className="card-body">

                {/* HEALTH */}
                <div className="mb-3 border rounded bg-dark">
                  <div className="p-2 text-center bg-secondary fw-bold">Health</div>
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{ height: '80px', fontSize: '1.5rem', cursor: 'pointer' }}
                    onClick={(e) => {
                      const half = e.currentTarget.offsetHeight / 2;
                      const clickY = e.nativeEvent.offsetY;
                      updateStat(player.userId, 'health', clickY < half ? +1 : -1);
                    }}
                  >
                    {player.health}
                  </div>
                </div>

                {/* Energy / Poison */}
                <div className="row">
                  {['energy', 'poison'].map(stat => (
                    <div className="col-sm-6 col-12" key={stat}>
                      <div className="mb-3 border rounded bg-dark">
                        <div className="p-2 text-center bg-secondary fw-bold text-uppercase">
                          {stat}
                        </div>
                        <div
                          className="d-flex align-items-center justify-content-center"
                          style={{ height: '80px', fontSize: '1.25rem', cursor: 'pointer' }}
                          onClick={(e) => {
                            const half = e.currentTarget.offsetHeight / 2;
                            const clickY = e.nativeEvent.offsetY;
                            updateStat(player.userId, stat, clickY < half ? +1 : -1);
                          }}
                        >
                          {player[stat]}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Damage */}
                <div className="row mt-3">
                  {players
                    .filter(p => p.userId !== player.userId)
                    .map(op => (
                      <div className="col-sm-6 col-12 mb-3" key={op.userId}>
                        <div className="border rounded bg-dark h-100">
                          <div
                            className="p-2 text-center"
                            style={{ backgroundColor: op.color, fontWeight: 'bold' }}
                          >
                            {op.name}
                          </div>

                          <div
                            className="d-flex align-items-center justify-content-center"
                            style={{ height: '80px', cursor: 'pointer', fontSize: '1.25rem' }}
                            onClick={() => {
                              ws.send(JSON.stringify({
                                type: 'deal-damage',
                                roomCode,
                                sourceId: userId,
                                targetId: player.userId,
                                amount: 1
                              }));
                            }}
                          >
                            {player.damageFrom?.[op.userId] || 0}
                          </div>

                        </div>
                      </div>
                    ))}
                </div>

              </div>

            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

