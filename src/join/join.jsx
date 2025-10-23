import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthState } from '../login/authState'; // adjust path as needed

export function Join({ authState }) {
  const navigate = useNavigate();

  // Redirect unauthenticated users
  useEffect(() => {
    if (authState !== AuthState.Authenticated) {
      navigate('/');
    }
  }, [authState, navigate]);

  // Room code state
  const [roomCode, setRoomCode] = useState('');

  // Friend list state
  const [friends, setFriends] = useState([
    { name: 'Alice', status: 'Online', joinable: true },
    { name: 'Bob', status: 'Offline', joinable: false },
    { name: 'Charlie', status: 'Away', joinable: true },
  ]);

  // Join a room by code
  function handleJoinRoom() {
    if (roomCode.trim() === '') {
      alert('Please enter a valid room code.');
      return;
    }
    alert(`Joining room with code: ${roomCode}`);
    navigate('/tracker');
  }

  // Join a friend's game
  function handleJoinFriend(friend) {
    if (!friend.joinable) {
      alert(`${friend.name} is not available to join.`);
      return;
    }
    alert(`Joining ${friend.name}'s game`);
    navigate('/tracker');
  }

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
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <button
          className="btn btn-success mt-2"
          onClick={handleJoinRoom}
        >
          Join
        </button>
      </div>

      <br />

      <div className="friends">
        <span className="fs-3">Join a Friend:</span>
      </div>

      <div className="container mt-4 d-flex justify-content-center">
        <div className="card bg-dark text-light shadow rounded" style={{ width: '400px' }}>
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
                {friends.map((friend, i) => (
                  <tr key={i}>
                    <td>{friend.name}</td>
                    <td>
                      <span
                        className={`badge ${
                          friend.status === 'Online'
                            ? 'bg-success'
                            : friend.status === 'Offline'
                            ? 'bg-danger'
                            : 'bg-warning text-dark'
                        }`}
                      >
                        {friend.status}
                      </span>
                    </td>
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

      <br />
    </main>
  );
}
