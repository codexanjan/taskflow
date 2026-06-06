import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Generate Token helper
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'devsecretjwtkeysuper12345',
    { expiresIn: '7d' }
  );
};

// @route   GET api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = generateToken(req.user._id);
      // Redirect back to client with token
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      res.redirect(`${clientUrl}?token=${token}`);
    } catch (err) {
      console.error('OAuth callback redirect error:', err);
      res.redirect((process.env.CLIENT_URL || 'http://localhost:5173') + '?error=oauth_failed');
    }
  }
);

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ email, password });
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Google accounts might not have passwords
    if (user.googleId && !user.password) {
      return res.status(400).json({ message: 'This email is registered with Google. Please Sign in with Google.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET api/auth/me
// @desc    Get current user details
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving user data' });
  }
});

export default router;
