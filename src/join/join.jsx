import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Join() {
  const navigate = useNavigate();

  // Room code state
  const [roomCode, setRoomCode] = useState('');

  // Friend list state
  const [friends, setFriends] = useState([
    { name: 'Alice', status: 'Online', joinable: true },
    { name: 'Bob', status: 'Offline', joinable: false },
    { name: 'Charlie', status: 'Away', joinable: true },
  ]);

  // Handle joining by room code
  function handleJoinRoom() {
    if (roomCode.trim() === '') {
      alert('Please enter a valid room code.');
      return;
    }
    alert(`Joining room with code: ${roomCode}`);
    navigate('/tracker');
  }

  // Handle joining a friend's game
  function handleJoinFriend(friend) {
    if (!friend.joinable) {
      alert(`${friend.name} is not available to join right now.`);
      return;
    }
    alert(`Joining ${friend.name}'s game!`);
    navigate('/tracker');
  }

  // Utility for status badge colors
  function getStatusBadge(status) {
    switch (status) {
      case 'Online':
        return <span className="badge bg-success">Online</span>;
      case 'Offline':
        return <span className="badge bg-danger">Offline</span>;
      case 'Away':
        return <span className="badge bg-warning text-dark">Away</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  }

  return (
    <main className="container-fluid bg-secondary text-center min-vh-100 p-5">
      <div className="mb-4">
        <label htmlFor="code" className="form-label fs-5">
          Room Code
        </label>
        <div className="d-flex justify-content-center gap-2">
          <input
            type="text"
            id="code"
            className="form-control w-auto"
            placeholder="Your Code Here"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <button type="button" className="btn btn-success" onClick={handleJoinRoom}>
            Join
          </button>
        </div>
      </div>

      <div className="friends mt-4">
        <span className="fs-3">Join a Friend:</span>
      </div>

      <div className="container mt-4 d-flex justify-content-center">
        <div
          className="card bg-dark text-light shadow rounded"
          style={{ width: '400px' }}
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
                {friends.map((friend) => (
                  <tr key={friend.name}>
                    <td>{friend.name}</td>
                    <td>{getStatusBadge(friend.status)}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${
                          friend.joinable ? 'btn-primary' : 'btn-secondary'
                        }`}
                        disabled={!friend.joinable}
                        onClick={() => handleJoinFriend(friend)}
                      >
                        Join
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
