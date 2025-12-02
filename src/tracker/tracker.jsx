import React, { useState, useEffect, useRef } from "react";

export function Tracker({ userName }) {
  const socket = useRef(null);

  const [players, setPlayers] = useState([]);
  const [roomCode, setRoomCode] = useState("");
  const [gameRoom, setGameRoom] = useState("");
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);

  // -----------------------------------------------------
  // CONNECT WEBSOCKET
  // -----------------------------------------------------
  useEffect(() => {
    socket.current = new WebSocket("wss://startup.tabletoptracker.click");

    socket.current.onopen = () => {
      console.log("WS Connected");

      // If refreshing the page, attempt rejoin
      if (userId && gameRoom) {
        socket.current.send(
          JSON.stringify({
            type: "rejoin-room",
            roomCode: gameRoom,
            userId,
          })
        );
      }
    };

    socket.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log("WS =>", msg);

      switch (msg.type) {
        case "room-created":
          setGameRoom(msg.roomCode);
          break;

        case "joined-room":
          setGameRoom(msg.roomCode);
          setUserId(msg.userId);
          localStorage.setItem("userId", msg.userId);
          break;

        case "rejoined-room":
        case "room-update":
          setPlayers(msg.room.players);
          break;

        case "error":
          alert(msg.message);
          break;

        default:
          break;
      }
    };

    socket.current.onclose = () => console.log("WS Closed");
    return () => socket.current.close();
  }, [userId, gameRoom]);

  // -----------------------------------------------------
  // CREATE ROOM
  // -----------------------------------------------------
  function createRoom() {
    if (!userName) return alert("Enter your name");

    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    setGameRoom(code);

    socket.current.send(
      JSON.stringify({
        type: "create-room",
        roomCode: code,
      })
    );
  }

  // -----------------------------------------------------
  // JOIN ROOM
  // -----------------------------------------------------
  function joinRoom() {
    if (!userName) return alert("Enter your name");
    if (!roomCode) return alert("Enter room code");

    const code = roomCode.toUpperCase();

    socket.current.send(
      JSON.stringify({
        type: "join-room",
        roomCode: code,
        userId,
        name: userName,
      })
    );
  }

  // -----------------------------------------------------
  // UPDATE A SINGLE PLAYER STAT
  // -----------------------------------------------------
  function handleInputChange(index, field, value) {
    const updated = [...players];
    updated[index] = { ...updated[index], [field]: value };
    setPlayers(updated);

    socket.current.send(
      JSON.stringify({
        type: "update-stats",
        roomCode: gameRoom,
        userId: updated[index].userId,
        field,
        value,
      })
    );
  }

  return (
    <main className="bg-secondary text-light min-vh-100 p-4">
      <div className="container">

        {!gameRoom && (
          <div className="card bg-dark text-light p-3 mb-4 shadow">
            <h3 className="text-center">Join or Create Room</h3>

            <div className="d-flex gap-2">
              <button className="btn btn-success w-50" onClick={createRoom}>
                Create Room
              </button>
              <button className="btn btn-primary w-50" onClick={joinRoom}>
                Join Room
              </button>
            </div>

            <input
              type="text"
              className="form-control mt-2 text-center"
              placeholder="Enter Room Code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
            />
          </div>
        )}

        {gameRoom && (
          <div className="alert alert-info text-center">
            <strong>Room Code:</strong> {gameRoom}
          </div>
        )}

        <div className="row g-4 mb-4">
          {players.map((player, i) => (
            <div key={player.userId} className="col-12 col-md-6 col-lg-4">
              <div className="card text-center shadow bg-dark text-light">

                <div className="card-header p-2">
                  <input
                    type="text"
                    className="form-control text-center fw-bold fs-4"
                    value={player.name}
                    onChange={(e) =>
                      handleInputChange(i, "name", e.target.value)
                    }
                  />
                </div>

                <img
                  src="kalia.png"
                  alt="Commander"
                  style={{ width: "100%", height: "250px", objectFit: "cover" }}
                />

                <div className="card-body">
                  <div className="row g-2">
                    {["health", "energy", "poison", "other"].map((field) => (
                      <div className="col" key={field}>
                        <input
                          type={field === "other" ? "text" : "number"}
                          className="form-control text-center"
                          placeholder={field.toUpperCase()}
                          value={player[field]}
                          onChange={(e) =>
                            handleInputChange(i, field, e.target.value)
                          }
                        />
                      </div>
                    ))}
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
