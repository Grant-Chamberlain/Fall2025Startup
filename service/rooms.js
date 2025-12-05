const express = require('express');
const Room = require('./Room'); // import your Mongoose Room model
const router = express.Router();

// POST /api/rooms → create a new room
router.post('/rooms', async (req, res) => {
  try {
    const { roomCode } = req.body;
    if (!roomCode) return res.status(400).json({ msg: 'Room code required' });

    const existing = await Room.findOne({ roomCode });
    if (existing) return res.status(400).json({ msg: 'Room already exists' });

    const room = new Room({ roomCode });
    await room.save();   // <-- this is what actually writes to MongoDB

    console.log('✅ Room saved:', room);
    res.status(201).json({ code: room.roomCode });
  } catch (err) {
    console.error('❌ Error creating room:', err);
    res.status(500).json({ msg: 'Failed to create room' });
  }
});


// GET /api/rooms/:code → fetch room details
router.get('/rooms/:code', async (req, res) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.code });
    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }
    res.json(room);
  } catch (err) {
    console.error('Error fetching room:', err);
    res.status(500).json({ msg: 'Failed to fetch room' });
  }
});

// Join a room with username + color
router.post('/rooms/:roomCode/join', async (req, res) => {
  try {
    const { playerName, color } = req.body;
    const { roomCode } = req.params;

    if (!playerName || !color) {
      return res.status(400).json({ msg: 'Player name and color required' });
    }

    const room = await Room.findOne({ roomCode });
    if (!room) return res.status(404).json({ msg: 'Room not found' });

    // Prevent duplicates
    const alreadyInRoom = room.players.some(p => p.name === playerName);
    if (!alreadyInRoom) {
      room.players.push({ name: playerName, color });
      room.updatedAt = new Date();
      await room.save();
    }

    res.json(room);
  } catch (err) {
    console.error('❌ Error joining room:', err);
    res.status(500).json({ msg: 'Failed to join room' });
  }
});



module.exports = { router };