const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const { MongoClient } = require('mongodb');
const DBConfig = require('./dbConfig.json');

const app = express();
const authCookieName = 'token';
const port = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === 'production';

// --- Middleware ---
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// --- MongoDB Setup ---
const url = `mongodb+srv://${DBConfig.userName}:${DBConfig.password}@${DBConfig.hostname}`;
const client = new MongoClient(url);

let db, userCollection, scoreCollection;

// --- Helper Functions ---
async function findUser(field, value) {
  if (!value) return null;
  if (field === 'token') return userCollection.findOne({ token: value });
  return userCollection.findOne({ email: value });
}

async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  const token = uuid.v4();
  const user = { email, password: passwordHash, token, createdAt: new Date() };
  await userCollection.insertOne(user);
  return user;
}

async function updateUser(user) {
  await userCollection.updateOne({ email: user.email }, { $set: user });
}

async function addScore(score) {
  await scoreCollection.insertOne(score);
}

async function getHighScores() {
  const cursor = scoreCollection
    .find({ score: { $gt: 0, $lt: 900 } })
    .sort({ score: -1 })
    .limit(10);
  return cursor.toArray();
}

function setAuthCookie(res, token) {
  res.cookie(authCookieName, token, {
    maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
  });
}

// --- Auth Middleware ---
async function verifyAuth(req, res, next) {
  const token = req.cookies[authCookieName];
  const user = token ? await findUser('token', token) : null;
  if (user) next();
  else res.status(401).send({ msg: 'Unauthorized' });
}

// --- API Routes ---
const apiRouter = express.Router();
app.use('/api', apiRouter);

// Create user
apiRouter.post('/auth/create', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send({ msg: 'Email and password required' });

    if (await findUser('email', email)) return res.status(409).send({ msg: 'Existing user' });

    const user = await createUser(email, password);
    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  } catch (err) {
    console.error('❌ /auth/create error:', err);
    res.status(500).send({ type: err.name, message: err.message });
  }
});

// Login
apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUser('email', email);
    if (!user) return res.status(401).send({ msg: 'Unauthorized' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).send({ msg: 'Unauthorized' });

    user.token = uuid.v4();
    await updateUser(user);
    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  } catch (err) {
    console.error('❌ /auth/login error:', err);
    res.status(500).send({ type: err.name, message: err.message });
  }
});

// Logout
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
    console.error('❌ /auth/logout error:', err);
    res.status(500).send({ type: err.name, message: err.message });
  }
});

// Auth status
apiRouter.get('/auth/status', async (req, res) => {
  try {
    const token = req.cookies[authCookieName];
    const user = token ? await findUser('token', token) : null;
    res.send(user ? { authenticated: true, email: user.email } : { authenticated: false });
  } catch (err) {
    console.error('❌ /auth/status error:', err);
    res.status(500).send({ type: err.name, message: err.message });
  }
});

// Scores
apiRouter.get('/scores', verifyAuth, async (_req, res) => {
  const scores = await getHighScores();
  res.send(scores);
});

apiRouter.post('/score', verifyAuth, async (req, res) => {
  await addScore(req.body);
  const scores = await getHighScores();
  res.send(scores);
});

// --- SPA fallback ---
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Start Server after DB is connected ---
async function startServer() {
  try {
    await client.connect();
    db = client.db('tabletoptracker');
    userCollection = db.collection('users');
    scoreCollection = db.collection('scores');
    console.log('✅ Connected to MongoDB');

    app.listen(port, () => console.log(`🚀 Listening on port ${port}`));
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err);
    process.exit(1);
  }
}

startServer();


