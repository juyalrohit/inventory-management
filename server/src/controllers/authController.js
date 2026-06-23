const authService = require('../services/authService');
const { sendSuccess } = require('../utils/responseHandler');
const { validateLogin, validateRegister } = require('../validators/authValidator');

async function register(req, res, next) {
  try {
    const errors = validateRegister(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    const result = await authService.registerUser(req.body);
    return sendSuccess(res, result, 'User registered', 201);
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const errors = validateLogin(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    const result = await authService.loginUser(req.body);
    return sendSuccess(res, result, 'Login successful');
  } catch (error) {
    return next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);
    return sendSuccess(res, user, 'Profile loaded');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  me
};

