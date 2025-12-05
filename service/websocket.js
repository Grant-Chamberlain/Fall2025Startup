const WebSocket = require('ws');
const crypto = require('crypto');
const Room = require('./Room'); // Mongoose model

// Active connections: userId → ws
const activeConnections = new Map();

// Broadcast room state to all connected players
function broadcastToRoom(room, data) {
  const roomObj = room.toObject(); // plain JSON-safe object
  roomObj.players.forEach((player) => {
    const ws = activeConnections.get(player.userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ ...data, room: roomObj }));
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
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
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

        const room = new Room({ roomCode, players: [] });
        await room.save();

        ws.send(JSON.stringify({ type: 'room-created', roomCode }));
        return;
      }

      // ------------------------
      // JOIN ROOM
      // ------------------------
      if (type === 'join-room') {
        const { roomCode, name, userId, color } = msg;
        const room = await Room.findOne({ roomCode });
        if (!room) {
          ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
          return;
        }

        if (!color) {
          ws.send(JSON.stringify({ type: 'error', message: 'Color is required' }));
          return;
        }

        const id = userId || crypto.randomUUID();

        // Close old connection if exists
        const oldConn = activeConnections.get(id);
        if (oldConn && oldConn.readyState === WebSocket.OPEN) {
          oldConn.close();
        }
        activeConnections.set(id, ws);

        let player = room.players.find((p) => p.userId === id);
        if (!player) {
          player = {
            userId: id,
            name,
            color,
            health: 40,
            energy: 0,
            poison: 0,
            other: '',
            damageFrom: new Map()
          };
          room.players.push(player);
        } else {
          player.name = name;
          player.color = color;
        }

        await room.save();

        ws.send(JSON.stringify({ type: 'joined-room', roomCode, userId: id }));
        broadcastToRoom(room, { type: 'room-update' });
        return;
      }

      // ------------------------
      // LEAVE ROOM
      // ------------------------
      if (type === 'leave-room') {
        const { roomCode, userId } = msg;
        const room = await Room.findOne({ roomCode });
        if (!room) {
          ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
          return;
        }

        room.players = room.players.filter(p => p.userId !== userId);

        room.players.forEach(p => {
          if (p.damageFrom && p.damageFrom.has(userId)) {
            p.damageFrom.delete(userId);
          }
        });

        await room.save();

        ws.send(JSON.stringify({ type: 'left-room', roomCode, userId }));
        broadcastToRoom(room, { type: 'room-update' });
        return;
      }

      // ------------------------
      // DEAL DAMAGE
      // ------------------------
      if (type === 'deal-damage') {
        const { roomCode, sourceId, targetId, amount } = msg;
        const room = await Room.findOne({ roomCode });
        if (!room) {
          ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
          return;
        }

        const target = room.players.find(p => p.userId === targetId);
        if (target) {
          if (!target.damageFrom) target.damageFrom = new Map();
          const current = target.damageFrom.get(sourceId) || 0;
          target.damageFrom.set(sourceId, current + amount);
          await room.save();
          broadcastToRoom(room, { type: 'room-update' });
        }
        return;
      }

      // ------------------------
      // REJOIN ROOM
      // ------------------------
      if (type === 'rejoin-room') {
        const { roomCode, userId } = msg;
        const room = await Room.findOne({ roomCode });
        if (!room) {
          ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
          return;
        }

        const player = room.players.find((p) => p.userId === userId);
        if (!player) {
          ws.send(JSON.stringify({ type: 'error', message: 'Player not found' }));
          return;
        }

        activeConnections.set(userId, ws);

        ws.send(JSON.stringify({ type: 'rejoined-room', room: room.toObject() }));
        broadcastToRoom(room, { type: 'room-update' });
        return;
      }

      // ------------------------
      // UPDATE PLAYER STATS
      // ------------------------
      if (type === 'update-stats') {
        const { roomCode, userId, field, value } = msg;
        const room = await Room.findOne({ roomCode });
        if (!room) {
          ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
          return;
        }

        const player = room.players.find((p) => p.userId === userId);
        if (!player) {
          ws.send(JSON.stringify({ type: 'error', message: 'Player not found' }));
          return;
        }

        // Whitelist fields
        const allowedFields = ['health', 'energy', 'poison', 'other'];
        if (!allowedFields.includes(field)) {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid field update' }));
          return;
        }

        player[field] = value;
        await room.save();

        broadcastToRoom(room, { type: 'room-update' });
        return;
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      // Remove from activeConnections
      for (const [id, conn] of activeConnections.entries()) {
        if (conn === ws) {
          activeConnections.delete(id);
        }
      }
    });
  });

  console.log('WebSocket server ready.');
}

module.exports = { setupWebSocket };