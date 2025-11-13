const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const DB = require('./database.js'); // your database functions

const app = express();
const authCookieName = 'token';
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// --- Middleware ---
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // serve React build

// --- Helper functions ---
async function findUser(field, value) {
  if (!value) return null;
  if (field === 'token') return DB.getUserByToken(value);
  return DB.getUser(value);
}

async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    email,
    password: passwordHash,
    token: uuid.v4(),
    createdAt: new Date(),
  };
  await DB.addUser(user);
  return user;
}

function setAuthCookie(res, token) {
  res.cookie(authCookieName, token, {
    maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    httpOnly: true,
    secure: isProduction,          // HTTPS only in production
    sameSite: 'strict',
  });
}

// --- Middleware to verify auth ---
async function verifyAuth(req, res, next) {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) next();
  else res.status(401).send({ msg: 'Unauthorized' });
}

// --- API routes ---
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
    await DB.updateUser(user);
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
    const user = await findUser('token', req.cookies[authCookieName]);
    if (user) {
      delete user.token;
      await DB.updateUser(user);
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
    const user = await findUser('token', req.cookies[authCookieName]);
    res.send(user ? { authenticated: true, email: user.email } : { authenticated: false });
  } catch (err) {
    console.error('❌ /auth/status error:', err);
    res.status(500).send({ type: err.name, message: err.message });
  }
});

// Scores
apiRouter.get('/scores', verifyAuth, async (_req, res) => {
  const scores = await DB.getHighScores();
  res.send(scores);
});

apiRouter.post('/score', verifyAuth, async (req, res) => {
  await DB.addScore(req.body);
  const scores = await DB.getHighScores();
  res.send(scores);
});

// --- SPA fallback ---
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Start server ---
app.listen(port, () => console.log(`🚀 Listening on port ${port}`));

