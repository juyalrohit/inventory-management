const bcrypt = require('bcryptjs');
const { AppError } = require('../middleware/errorMiddleware');
const { query, getPool } = require('../config/db');
const generateToken = require('../utils/generateToken');

async function registerUser(payload) {
  const existingUsers = await query('SELECT id FROM users WHERE email = ?', [payload.email]);
  if (existingUsers.length > 0) {
    throw new AppError('Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const [result] = await getPool().execute(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [payload.name, payload.email, passwordHash, payload.role || 'staff']
  );

  const token = generateToken({
    id: result.insertId,
    email: payload.email,
    role: payload.role || 'staff'
  });

  return {
    user: {
      id: result.insertId,
      name: payload.name,
      email: payload.email,
      role: payload.role || 'staff'
    },
    token
  };
}

async function loginUser(payload) {
  const rows = await query('SELECT * FROM users WHERE email = ?', [payload.email]);
  const user = rows[0];

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const passwordOk = await bcrypt.compare(payload.password, user.password_hash);
  if (!passwordOk) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  };
}

async function getProfile(userId) {
  const rows = await query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [userId]);
  return rows[0] || null;
}

module.exports = {
  registerUser,
  loginUser,
  getProfile
};

