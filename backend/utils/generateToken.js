import jwt from 'jsonwebtoken';

export function generateToken(userId) {
  const { JWT_SECRET, JWT_EXPIRES_IN = '7d' } = process.env;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
