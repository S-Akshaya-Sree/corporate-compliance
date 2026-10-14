const jwt = require('jsonwebtoken');

const sign = emp =>
  jwt.sign({ sub: emp.id, name: emp.name, role: emp.role || 'employee' }, process.env.JWT_SECRET, { expiresIn: '8h' });

function authenticate(request) {
  const header = request.headers.get('authorization') || '';
  try {
    return jwt.verify(header.replace(/^Bearer\s+/i, ''), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

const json = (status, body) => ({ status, jsonBody: body });
const unauthorized = () => json(401, { error: 'Please sign in again.' });

module.exports = { sign, authenticate, json, unauthorized };
