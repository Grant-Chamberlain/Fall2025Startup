const WebSocket = require("ws");
const crypto = require("crypto");
const Room = require("./models/Room");

// Map of active user connections: userId → ws
const activeConnections = new Map();

// Broadcast data to all connected players in a room
function broadcastToRoom(room, data) {
  const obj = room.toObject ? room.toObject() : room;
  obj.players.forEach((p) => {
    const ws = activeConnections.get(p.userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });
}

// Setup WebSocket server
function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.on("message", async (data) => {
      let msg;
      try {
        msg = JSON.parse(data);
      } catch (err) {
        console.log("Bad JSON:", data);
        ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
        return;
      }

      const { type } = msg;

      // -----------------------------------------
      // CREATE ROOM
      // -----------------------------------------
      if (type === "create-room") {
        const { roomCode, name, userId } = msg;

        try {
          const existing = await Room.findOne({ roomCode });
          if (existing) {
            ws.send(JSON.stringify({ type: "error", message: "Room exists" }));
            return;
          }

          const creatorId = userId || crypto.randomUUID();
          activeConnections.set(creatorId, ws);

          const room = new Room({
            roomCode,
            players: [
              {
                userId: creatorId,
                name,
                health: 40,
                energy: 0,
                poison: 0,
                other: "",
              },
            ],
            updatedAt: new Date(),
          });

          await room.save();

          ws.send(
            JSON.stringify({ type: "room-created", roomCode, userId: creatorId })
          );
          broadcastToRoom(room, { type: "room-update", room: room.toObject() });
        } catch (err) {
          console.error(err);
          ws.send(JSON.stringify({ type: "error", message: err.message }));
        }
      }

      // -----------------------------------------
      // JOIN ROOM
      // -----------------------------------------
      if (type === "join-room") {
        const { roomCode, name, userId } = msg;

        try {
          const room = await Room.findOne({ roomCode });
          if (!room) {
            ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
            return;
          }

          const id = userId || crypto.randomUUID();
          activeConnections.set(id, ws);

          let player = room.players.find((p) => p.userId === id);
          if (!player) {
            player = { userId: id, name, health: 40, energy: 0, poison: 0, other: "" };
            room.players.push(player);
          } else {
            player.name = name;
          }

          room.updatedAt = new Date();
          await room.save();

          ws.send(JSON.stringify({ type: "joined-room", roomCode, userId: id }));
          broadcastToRoom(room, { type: "room-update", room: room.toObject() });
        } catch (err) {
          console.error(err);
          ws.send(JSON.stringify({ type: "error", message: err.message }));
        }
      }

      // -----------------------------------------
      // REJOIN ROOM
      // -----------------------------------------
      if (type === "rejoin-room") {
        const { roomCode, userId } = msg;

        try {
          const room = await Room.findOne({ roomCode });
          if (!room) {
            ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
            return;
          }

          const player = room.players.find((p) => p.userId === userId);
          if (!player) {
            ws.send(JSON.stringify({ type: "error", message: "Player not found" }));
            return;
          }

          activeConnections.set(userId, ws);

          ws.send(JSON.stringify({ type: "rejoined-room", room: room.toObject() }));
          broadcastToRoom(room, { type: "room-update", room: room.toObject() });
        } catch (err) {
          console.error(err);
          ws.send(JSON.stringify({ type: "error", message: err.message }));
        }
      }

      // -----------------------------------------
      // UPDATE PLAYER STATS
      // -----------------------------------------
      if (type === "update-stats") {
        const { roomCode, userId, field, value } = msg;

        try {
          const room = await Room.findOne({ roomCode });
          if (!room) return;

          const player = room.players.find((p) => p.userId === userId);
          if (!player) return;

          // Only allow safe fields to be updated
          if (["health", "energy", "poison", "other", "name"].includes(field)) {
            player[field] = value;
          }

          room.updatedAt = new Date();
          await room.save();

          broadcastToRoom(room, { type: "room-update", room: room.toObject() });
        } catch (err) {
          console.error(err);
          ws.send(JSON.stringify({ type: "error", message: err.message }));
        }
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
      // Do NOT remove players — persistence relies on them staying
    });
  });

  console.log("WebSocket server ready.");
}

module.exports = setupWebSocket;
