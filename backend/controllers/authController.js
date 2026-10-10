import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import { generateToken } from '../utils/generateToken.js';

const googleClient = new OAuth2Client();

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    preferredLanguage: user.preferredLanguage,
    practiceGoal: user.practiceGoal,
    avatarUrl: user.avatarUrl,
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
    const valid = Boolean(
      user?.password && await bcrypt.compare(password, user.password)
    );
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({ user: serializeUser(user), token: generateToken(user._id.toString()) });
  } catch (error) {
    return next(error);
  }
}

export async function loginWithGoogle(req, res, next) {
  try {
    const { credential } = req.body;
    const { GOOGLE_CLIENT_ID } = process.env;

    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({ message: 'Google credential is required' });
    }
    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: 'Google authentication is not configured' });
    }

    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
    } catch {
      return res.status(401).json({ message: 'Unable to verify Google account' });
    }
    const payload = ticket.getPayload();

    if (
      !payload ||
      !payload.sub ||
      !(
        payload.iss === 'https://accounts.google.com' ||
        payload.iss === 'accounts.google.com'
      ) ||
      !payload.exp ||
      payload.exp <= Math.floor(Date.now() / 1000) ||
      !payload.email ||
      payload.email_verified !== true
    ) {
      return res.status(401).json({ message: 'Unable to verify Google account' });
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    let user = await User.findOne({ googleSubjectId: payload.sub });

    if (!user) {
      const existingLocalUser = await User.findOne({ email: normalizedEmail });
      if (existingLocalUser) {
        return res.status(409).json({
          message: 'An account with this email already exists. Log in with your existing credentials.',
        });
      }

      user = await User.create({
        name: payload.name?.trim() || normalizedEmail,
        email: normalizedEmail,
        authProvider: 'google',
        googleSubjectId: payload.sub,
        emailVerified: true,
        avatarUrl: payload.picture,
      });
      await Progress.create({ user: user._id });
    }

    return res.json({
      user: serializeUser(user),
      token: generateToken(user._id.toString()),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getProfile(req, res) {
  res.json({ user: serializeUser(req.user) });
}


export async function updateProfile(req, res, next) {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';

    if (!name) {
      return res.status(400).json({ message: 'Name is required.' });
    }

    if (name.length > 80) {
      return res.status(400).json({ message: 'Name must be 80 characters or fewer.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    return res.json({ user: serializeUser(user) });
  } catch (error) {
    return next(error);
  }
}
