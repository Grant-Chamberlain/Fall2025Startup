const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  userId: String,
  name: String,
  health: Number,
  energy: Number,
  poison: Number,
  other: String,
});

const RoomSchema = new mongoose.Schema({
  roomCode: { type: String, unique: true },
  players: [PlayerSchema],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Room", RoomSchema);
