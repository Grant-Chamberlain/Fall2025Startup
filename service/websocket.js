const WebSocket = require("ws");
const crypto = require("crypto");
const Room = require("./models/Room");

const activeConnections = new Map(); // userId → ws

function broadcastToRoom(room, data) {
  const obj = room.toObject ? room.toObject() : room;

  obj.players.forEach((p) => {
    const ws = activeConnections.get(p.userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });
}

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.on("message", async (data) => {
      let msg;
      try {
        msg = JSON.parse(data);
      } catch {
        console.log("Bad JSON:", data);
        return;
      }

      const { type } = msg;

      // -----------------------------------------
      // CREATE ROOM
      // -----------------------------------------
      if (type === "create-room") {
        const { roomCode } = msg;

        const existing = await Room.findOne({ roomCode });
        if (existing) {
          ws.send(JSON.stringify({ type: "error", message: "Room exists" }));
          return;
        }

        const room = new Room({
          roomCode,
          players: [],
        });

        await room.save();

        ws.send(JSON.stringify({ type: "room-created", roomCode }));
      }

      // -----------------------------------------
      // JOIN ROOM
      // -----------------------------------------
      if (type === "join-room") {
        const { roomCode, name } = msg;

        const room = await Room.findOne({ roomCode });
        if (!room) {
          ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
          return;
        }

        const userId = msg.userId || crypto.randomUUID();
        activeConnections.set(userId, ws);

        let player = room.players.find((p) => p.userId === userId);

        if (!player) {
          player = {
            userId,
            name,
            health: 40,
            energy: 0,
            poison: 0,
            other: "",
          };
          room.players.push(player);
        } else {
          player.name = name; // update display name
        }

        await room.save();

        ws.send(
          JSON.stringify({
            type: "joined-room",
            roomCode,
            userId,
          })
        );

        broadcastToRoom(room, {
          type: "room-update",
          room: room.toObject(),
        });
      }

      // -----------------------------------------
      // REJOIN ROOM
      // -----------------------------------------
      if (type === "rejoin-room") {
        const { roomCode, userId } = msg;

        const room = await Room.findOne({ roomCode });
        if (!room) return;

        const player = room.players.find((p) => p.userId === userId);
        if (!player) return;

        activeConnections.set(userId, ws);

        ws.send(
          JSON.stringify({
            type: "rejoined-room",
            room: room.toObject(),
          })
        );

        broadcastToRoom(room, {
          type: "room-update",
          room: room.toObject(),
        });
      }

      // -----------------------------------------
      // UPDATE PLAYER STATS
      // -----------------------------------------
      if (type === "update-stats") {
        const { roomCode, userId, field, value } = msg;

        const room = await Room.findOne({ roomCode });
        if (!room) return;

        const player = room.players.find((p) => p.userId === userId);
        if (!player) return;

        player[field] = value;
        room.updatedAt = new Date();

        await room.save();

        broadcastToRoom(room, {
          type: "room-update",
          room: room.toObject(),
        });
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
      // We do NOT remove players – persistence depends on them staying
    });
  });

  console.log("WebSocket server ready.");
}

module.exports = setupWebSocket;
