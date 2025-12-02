const WebSocket = require('ws');
const crypto = require('crypto');
const Room = require('./models/Room'); // Mongoose model

const activeConnections = new Map(); // userId → ws

// Broadcast room state to all connected players
function broadcastToRoom(room, data) {
  const roomObj = room.toObject();
  roomObj.players.forEach((player) => {
    const ws = activeConnections.get(player.userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });
}

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', async (rawData) => {
      let msg;
      try {
        msg = JSON.parse(rawData);
      } catch {
        console.log('Bad JSON:', rawData);
        return;
      }

      const { type } = msg;

      // ------------------------
      // CREATE ROOM
      // ------------------------
      if (type === 'create-room') {
        const { roomCode } = msg;
        const existing = await Room.findOne({ roomCode });
        if (existing) {
          ws.send(JSON.stringify({ type: 'error', message: 'Room exists' }));
          return;
        }

        const room = new Room({
          roomCode,
          players: [],
        });

        await room.save();

        ws.send(JSON.stringify({ type: 'room-created', roomCode }));
      }

      // ------------------------
      // JOIN ROOM
      // ------------------------
      if (type === 'join-room') {
        const { roomCode, name, userId } = msg;
        const room = await Room.findOne({ roomCode });
        if (!room) {
          ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
          return;
        }

        const id = userId || crypto.randomUUID();
        activeConnections.set(id, ws);

        let player = room.players.find((p) => p.userId === id);
        if (!player) {
          player = {
            userId: id,
            name,
            health: 40,
            energy: 0,
            poison: 0,
            other: '',
          };
          room.players.push(player);
        } else {
          player.name = name; // update display name
        }

        room.updatedAt = new Date();
        await room.save();

        ws.send(JSON.stringify({ type: 'joined-room', roomCode, userId: id }));

        broadcastToRoom(room, { type: 'room-update', room });
      }

      // ------------------------
      // REJOIN ROOM
      // ------------------------
      if (type === 'rejoin-room') {
        const { roomCode, userId } = msg;
        const room = await Room.findOne({ roomCode });
        if (!room) return;

        const player = room.players.find((p) => p.userId === userId);
        if (!player) return;

        activeConnections.set(userId, ws);

        ws.send(JSON.stringify({ type: 'rejoined-room', room }));
        broadcastToRoom(room, { type: 'room-update', room });
      }

      // ------------------------
      // UPDATE PLAYER STATS
      // ------------------------
      if (type === 'update-stats') {
        const { roomCode, userId, field, value } = msg;
        const room = await Room.findOne({ roomCode });
        if (!room) return;

        const player = room.players.find((p) => p.userId === userId);
        if (!player) return;

        player[field] = value;
        room.updatedAt = new Date();
        await room.save();

        broadcastToRoom(room, { type: 'room-update', room });
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      // Keep players in DB for persistence; rejoin will reconnect them
    });
  });

  console.log('WebSocket server ready.');
}

module.exports = setupWebSocket;
