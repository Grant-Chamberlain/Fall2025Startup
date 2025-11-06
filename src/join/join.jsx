import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthState } from '../login/authState';

export function Join({ authState }) {
  const navigate = useNavigate();

  // Redirect if user is not authenticated
  useEffect(() => {
    if (authState !== AuthState.Authenticated) {
      navigate('/');
    }
  }, [authState, navigate]);

  const [roomCode, setRoomCode] = useState('');
  const [friends, setFriends] = useState([
    { name: 'Alice', status: 'Online', joinable: true },
    { name: 'Bob', status: 'Offline', joinable: false },
    { name: 'Charlie', status: 'Away', joinable: true },
  ]);

  function handleJoinRoom() {
    if (!roomCode.trim()) return alert('Enter a valid room code.');
    navigate('/tracker');
  }

  function handleJoinFriend(friend) {
    if (!friend.joinable) return alert(`${friend.name} is not available.`);
    navigate('/tracker');
  }

  return (
    <main className="container-fluid bg-secondary text-center">
      <div>
        <label htmlFor="code">Room Code</label>
        <input
          type="text"
          id="code"
          className="form-control"
          placeholder="Your Code Here"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <button className="btn btn-success mt-2" onClick={handleJoinRoom}>Join</button>
      </div>

      <div className="container mt-4 d-flex justify-content-center">
        <div className="card bg-dark text-light shadow rounded" style={{ width: '400px' }}>
          <div className="card-header text-center">Friends Online</div>
          <div className="card-body p-0">
            <table className="table table-dark table-hover table-striped table-bordered mb-0 text-center">
              <thead>
                <tr>
                  <th>Friend</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {friends.map((friend, i) => (
                  <tr key={i}>
                    <td>{friend.name}</td>
                    <td>
                      <span className={`badge ${
                        friend.status === 'Online' ? 'bg-success' :
                        friend.status === 'Offline' ? 'bg-danger' : 'bg-warning text-dark'
                      }`}>{friend.status}</span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${friend.joinable ? 'btn-primary' : 'btn-secondary'}`}
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

