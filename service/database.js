const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);

let db;
let users;

async function connectDB() {
  try {
    await client.connect(); // safe to call multiple times

    db = client.db('tabletoptracker');
    users = db.collection('users');

    console.log(`✅ Connected to MongoDB at ${config.hostname}`);
    return db;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
}

// ✅ Export a function to get the users collection safely
function getUsers() {
  if (!users) throw new Error('❌ Users collection not initialized. Make sure connectDB() is called first.');
  return users;
}

module.exports = { connectDB, getUsers };

