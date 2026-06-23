function validateRegister(body) {
  const errors = [];
  if (!body.name || body.name.trim().length < 2) errors.push('Name is required');
  if (!body.email || !body.email.includes('@')) errors.push('Valid email is required');
  if (!body.password || body.password.length < 6) errors.push('Password must be at least 6 characters');
  if (body.role && !['admin', 'manager', 'staff'].includes(body.role)) errors.push('Invalid role');
  return errors;
}

function validateLogin(body) {
  const errors = [];
  if (!body.email || !body.email.includes('@')) errors.push('Valid email is required');
  if (!body.password) errors.push('Password is required');
  return errors;
}

module.exports = {
  validateRegister,
  validateLogin
};

