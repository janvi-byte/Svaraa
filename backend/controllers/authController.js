import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import { generateToken } from '../utils/generateToken.js';

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    preferredLanguage: user.preferredLanguage,
    practiceGoal: user.practiceGoal,
  };
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ message: 'Unable to create account with those details' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: normalizedEmail, password: passwordHash });
    await Progress.create({ user: user._id });

    return res.status(201).json({ user: serializeUser(user), token: generateToken(user._id.toString()) });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    const valid = user && await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({ user: serializeUser(user), token: generateToken(user._id.toString()) });
  } catch (error) {
    return next(error);
  }
}

export async function getProfile(req, res) {
  res.json({ user: serializeUser(req.user) });
}
