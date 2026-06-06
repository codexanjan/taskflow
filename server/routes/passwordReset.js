import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';

const router = express.Router();

// @route   POST api/auth/forgot-password
// @desc    Initiate password reset (terminal print simulated email)
// @access  Public
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please provide email address' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ message: 'If that email exists, reset instructions have been printed in the server terminal logs.' });
    }

    if (user.googleId && !user.password) {
      return res.status(400).json({ message: 'This account uses Google Login. Password reset is not available.' });
    }

    // Generate Token
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    // Print Simulated Email to Console
    console.log('\n');
    console.log('========================================= SIMULATED EMAIL OUTBOX =========================================');
    console.log(`To: ${user.email}`);
    console.log('Subject: TaskFlow Password Reset Instructions');
    console.log('---------------------------------------------------------------------------------------------------------');
    console.log(`Hello,\n`);
    console.log(`You are receiving this email because you (or someone else) requested a password reset for your TaskFlow account.\n`);
    console.log(`Please copy and paste the link below in your browser window to complete the process:\n`);
    console.log(`👉 http://localhost:5173?resetToken=${token}\n`);
    console.log(`If you did not request this reset, please ignore this email and your password will remain unchanged.\n`);
    console.log('===========================================================================================================\n');

    res.json({ message: 'Reset link generated! Check your backend server terminal logs to click it.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
});

// @route   POST api/auth/reset-password
// @desc    Complete password reset
// @access  Public
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: 'Missing token or password' });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error during password update' });
  }
});

export default router;
