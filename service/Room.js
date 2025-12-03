const mongoose = require("mongoose");

// Define the Player schema
const PlayerSchema = new mongoose.Schema({
  userId: { type: String, required: true },   // unique identifier for the player
  name: { type: String, default: "" },        // username
  color: { type: String, required: true },    // hex code or color string
  health: { type: Number, default: 40 },
  energy: { type: Number, default: 0 },
  poison: { type: Number, default: 0 },
  other: { type: String, default: "" },
});

// Define the Room schema
const RoomSchema = new mongoose.Schema({
  roomCode: { type: String, unique: true, required: true },
  players: [PlayerSchema],
  updatedAt: { type: Date, default: Date.now },
});

// Export the Room model
module.exports = mongoose.model("Room", RoomSchema);