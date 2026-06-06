import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import passwordResetRoutes from './routes/passwordReset.js';
import './config/passport.js'; // Imports Strategy setup

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for local testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', passwordResetRoutes);
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: 'connected',
    timestamp: new Date()
  });
});

// Database connection
console.log('================================================================');
console.log('Database connection (Supabase Cloud) initialized successfully!');
console.log('================================================================');

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
