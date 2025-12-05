const express = require('express');
const http = require('http');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const mongoose = require('mongoose');
const config = require('./dbConfig.json');

const { connectDB, getUsers } = require('./database'); // native driver for users
const { setupWebSocket } = require('./websocket');     // WebSocket setup - FIXED
const { router } = require('./rooms');        // Rooms routes - FIXED
const Room = require('./Room');                     // Mongoose Room model

const app = express();
const authCookieName = 'token';
const port = process.argv.length > 2 ? process.argv[2] : 4000;
const isProduction = process.env.NODE_ENV === 'production';

// --- Middleware ---
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// --- Auth Helpers (native driver) ---
async function findUser(field, value) {
  if (!value) return null;
  const userCollection = getUsers();
  if (field === 'token') return userCollection.findOne({ token: value });
  return userCollection.findOne({ email: value });
}

async function createUser(email, password) {
  const userCollection = getUsers();
  const passwordHash = await bcrypt.hash(password, 10);
  const token = uuid.v4();
  const user = { email, password: passwordHash, token, createdAt: new Date() };
  await userCollection.insertOne(user);
  return user;
}

async function updateUser(user) {
  const userCollection = getUsers();
  await userCollection.updateOne({ email: user.email }, { $set: user });
}

function setAuthCookie(res, token) {
  res.cookie(authCookieName, token, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
  });
}

// --- API Router ---
const apiRouter = express.Router();
app.use('/api', apiRouter);

// --- Auth Routes ---
apiRouter.post('/auth/create', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send({ msg: 'Email and password required' });
    if (await findUser('email', email)) return res.status(409).send({ msg: 'Existing user' });

    const user = await createUser(email, password);
    setAuthCookie(res, user.token);
    res.json({ email: user.email });
  } catch (err) {
    res.status(500).send({ type: err.name, message: err.message });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUser('email', email);
    if (!user) return res.status(401).json({ msg: 'Unauthorized' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ msg: 'Unauthorized' });

    user.token = uuid.v4();
    await updateUser(user);
    setAuthCookie(res, user.token);
    res.json({ email: user.email });
  } catch (err) {
    res.status(500).json({ type: err.name, message: err.message });
  }
});

apiRouter.delete('/auth/logout', async (req, res) => {
  try {
    const token = req.cookies[authCookieName];
    const user = token ? await findUser('token', token) : null;
    if (user) {
      delete user.token;
      await updateUser(user);
    }
    res.clearCookie(authCookieName);
    res.status(204).end();
  } catch (err) {
    res.status(500).send({ type: err.name, message: err.message });
  }
});

apiRouter.get('/auth/status', async (req, res) => {
  try {
    const token = req.cookies[authCookieName];
    const user = token ? await findUser('token', token) : null;
    res.json(user ? { authenticated: true, email: user.email } : { authenticated: false });
  } catch (err) {
    res.status(500).send({ type: err.name, message: err.message });
  }
});

// --- Rooms Routes ---
apiRouter.use(router);

// --- Start Server ---
async function startServer() {
  try {
    // Connect native driver for auth
    await connectDB();

    // Connect Mongoose for rooms
    const uri = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}/tabletoptracker?retryWrites=true&w=majority`;
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB Atlas via Mongoose (rooms)");

    // Start HTTP + WebSocket server
    const server = http.createServer(app);
    setupWebSocket(server);  // FIXED - was websocket(server)
    server.listen(port, () => {
      console.log(`🚀 Backend listening on http://localhost:${port}`);
    });
    // ------------------------
    // Cleanup job: delete rooms inactive > 1 hour
    // ------------------------
    setInterval(async () => {
      try {
        const cutoff = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
        const result = await Room.deleteMany({ updatedAt: { $lt: cutoff } });
        if (result.deletedCount > 0) {
          console.log(`🧹 Cleaned up ${result.deletedCount} inactive rooms`);
        }
      } catch (err) {
        console.error('Error cleaning up rooms:', err);
      }
    }, 10 * 60 * 1000); // run every 10 minutes

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();