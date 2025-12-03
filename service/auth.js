const express = require('express');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const cookieParser = require('cookie-parser');

const { getUsers } = require('./database');

const apiRouter = express.Router();
const authCookieName = 'token';
const isProduction = process.env.NODE_ENV === 'production';

// --- Middleware for this router ---
apiRouter.use(express.json());
apiRouter.use(cookieParser());

// --- Helper Functions ---
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
    maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
  });
}

// --- Routes ---

// Create user
apiRouter.post('/auth/create', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Email and password required' });

    if (await findUser('email', email)) return res.status(409).json({ msg: 'Existing user' });

    const user = await createUser(email, password);
    setAuthCookie(res, user.token);
    res.json({ email: user.email });
  } catch (err) {
    console.error('❌ /auth/create error:', err);
    res.status(500).json({ type: err.name, message: err.message });
  }
});

// Login
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
    console.error('❌ /auth/login error:', err);
    res.status(500).json({ type: err.name, message: err.message });
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
    res.status(500).json({ type: err.name, message: err.message });
  }
});

// Auth status
apiRouter.get('/auth/status', async (req, res) => {
  try {
    const token = req.cookies[authCookieName];
    const user = token ? await findUser('token', token) : null;
    res.json(user ? { authenticated: true, email: user.email } : { authenticated: false });
  } catch (err) {
    console.error('❌ /auth/status error:', err);
    res.status(500).json({ type: err.name, message: err.message });
  }
});

module.exports = apiRouter;