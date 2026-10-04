import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { JWT_SECRET } = process.env;
    if (!JWT_SECRET) {
      return res.status(500).json({ message: 'Authentication is not configured' });
    }

    const token = header.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Authentication required' });
  }
}
