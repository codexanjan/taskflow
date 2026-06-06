import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ShieldAlert, CheckCircle, ArrowLeft, Key } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResetPasswordForm({ token = null, onBack }) {
  const { forgotPassword, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your email address');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await forgotPassword(email.trim());
      setSuccess(res.message || 'Reset link sent to your email address!');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await resetPassword(token, password);
      setSuccess(res.message || 'Password updated successfully!');
      setPassword('');
      setConfirmPassword('');
      // Redirect after a brief delay
      setTimeout(() => {
        if (onBack) onBack();
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel p-8 rounded-3xl border border-white/20 dark:border-slate-800/30 shadow-2xl relative overflow-hidden w-full max-w-md mx-auto my-12"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-6 text-slate-500 dark:text-slate-400">
        <button
          onClick={onBack}
          className="p-1 rounded-lg hover:bg-slate-150 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </button>
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white mb-6">
        {token ? 'Reset Password' : 'Recover Password'}
      </h2>

      {/* Status Banners */}
      {error && (
        <div className="mb-5 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Password request form */}
      {!token ? (
        <form onSubmit={handleForgotSubmit} className="space-y-5">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Enter your email address below. If an account is registered with this email, a secure reset link will be sent to your email address by Supabase Auth.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                required
                disabled={loading}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/30 dark:bg-slate-950/20 text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>
      ) : (
        /* Actual reset password form */
        <form onSubmit={handleResetSubmit} className="space-y-5">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Enter your new secure password below to complete the recovery process.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              New Password
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                disabled={loading}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/30 dark:bg-slate-950/20 text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={loading}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/30 dark:bg-slate-950/20 text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      )}
    </motion.div>
  );
}
