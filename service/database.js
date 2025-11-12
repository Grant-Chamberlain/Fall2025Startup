// database.js
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('260classrental');
const users = db.collection('users');

// You should use a long, random secret in production.
// You can store this safely in an environment variable.
const JWT_SECRET = 'your-very-secret-jwt-key';

async function connect() {
  if (!client.topology?.isConnected()) {
    await client.connect();
    await db.command({ ping: 1 });
    console.log(`✅ Connected to MongoDB at ${config.hostname}`);
  }
}

// Register a new user
async function registerUser(username, password) {
  await connect();

  const existing = await users.findOne({ username });
  if (existing) throw new Error('Username already exists');

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await users.insertOne({
    username,
    password: hashedPassword,
    createdAt: new Date(),
  });

  console.log(`👤 Registered new user: ${username}`);
  return result.insertedId;
}

// Log in a user and issue a JWT
async function loginUser(username, password) {
  await connect();

  const user = await users.findOne({ username });
  if (!user) throw new Error('User not found');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Invalid password');

  // Create a token valid for 1 hour
  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });

  console.log(`✅ ${username} logged in successfully`);
  return { username: user.username, token };
}

// Verify a token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
}

module.exports = {
  connect,
  registerUser,
  loginUser,
  verifyToken,
};
