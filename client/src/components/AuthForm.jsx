import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/api';
import { Mail, Lock, ShieldAlert, LogIn, ArrowRight, UserPlus, Info } from 'lucide-react';

export default function AuthForm({ onForgotClick }) {
  const { login, register, startGuestMode, backendOnline, loading, authError, setAuthError, signInWithGoogle } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    if (setAuthError) setAuthError('');
    setAuthLoading(true);

    try {
      if (isRegister) {
        await register(email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSimulatedGoogleLogin = async () => {
    setAuthLoading(true);
    setSimulating(true);
    setError('');
    try {
      const email = 'google-tester@taskflow.app';
      const password = 'google-test-password-123';
      try {
        await login(email, password);
      } catch (err) {
        // Sign up if user does not exist
        await register(email, password);
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        if (supabaseUser) {
          await supabase
            .from('profiles')
            .update({
              name: 'Google Test User',
              profile_picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
            })
            .eq('id', supabaseUser.id);
        }
        // Login again to get updated profile details
        await login(email, password);
      }
      setShowGoogleModal(false);
    } catch (err) {
      setError(err.message || 'Simulated Google Sign-In failed');
    } finally {
      setAuthLoading(false);
      setSimulating(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-12 px-4">
      {/* Background radial gradient glow for premium feel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl -z-10 rounded-full pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="glass-panel p-8 rounded-3xl border border-white/20 dark:border-slate-800/30 shadow-2xl relative overflow-hidden"
      >
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60" />

        {/* Server Status Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
            backendOnline 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {backendOnline ? 'Cloud Synced' : 'Offline Mode'}
          </span>
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {(error || authError) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error || authError}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Server Offline info banner */}
        {!backendOnline && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-slate-600 dark:text-slate-350 text-xs leading-relaxed">
            <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-600 dark:text-amber-400">Database offline.</span> Registering or logging in requires database connectivity. Don't worry! Click the guest button below to store tasks in local browser memory.
            </div>
          </div>
        )}

        {/* Auth Forms */}
        {backendOnline ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
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
                  disabled={authLoading}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/30 dark:bg-slate-950/20 text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={authLoading}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/30 dark:bg-slate-950/20 text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
              {!isRegister && (
                <div className="text-right pt-1.5">
                  <button
                    type="button"
                    onClick={onForgotClick}
                    className="text-[10px] font-bold text-slate-500 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline cursor-pointer focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full mt-2 py-3 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer"
            >
              {authLoading && !simulating ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isRegister ? (
                <>
                  <UserPlus className="w-4 h-4" /> Create Account
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              )}
            </button>

            {/* Toggle Login/Register Link */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                  if (setAuthError) setAuthError('');
                }}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {isRegister
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Register now"}
              </button>
            </div>

            {/* Google Authentication Option */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/50 dark:border-slate-800/50" />
              </div>
              <span className="relative px-3 bg-[#f1f5f9] dark:bg-[#0b0f19] text-[10px] font-bold text-slate-400 dark:text-slate-650 uppercase tracking-widest transition-all">
                Or continue with
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="w-full py-2.5 rounded-xl text-sm font-bold border border-slate-250/60 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer bg-white/20 dark:bg-slate-950/10 shadow-sm animate-fade-in"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </form>
        ) : null}

        {/* Divider if online (since we show both forms and guest option) */}
        {backendOnline && (
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/50 dark:border-slate-800/50" />
            </div>
            <span className="relative px-3 bg-[#f1f5f9] dark:bg-[#0b0f19] text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest transition-all">
              Or
            </span>
          </div>
        )}

        {/* Guest Mode Action */}
        <button
          type="button"
          onClick={startGuestMode}
          className={`w-full py-3 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer ${
            backendOnline
              ? 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-350'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent shadow-lg shadow-indigo-600/20'
          }`}
        >
          <span>Continue as Guest</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[10px] text-center text-slate-400 dark:text-slate-505 mt-6 leading-relaxed">
          Secure JWT Authentication enabled when synced. Guest mode tasks are securely cached in local storage.
        </p>
      </motion.div>

      {/* Google Auth Configuration/Simulation Modal */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !simulating && setShowGoogleModal(false)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm glass-panel p-6 rounded-3xl border border-white/20 dark:border-slate-800/30 shadow-2xl space-y-5 z-10"
            >
              <div className="space-y-2 text-center">
                <h3 className="text-lg font-bold text-slate-850 dark:text-white">Google OAuth Options</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Real Google Sign-In requires enabling Google Provider on your **Supabase Console** and configuring Google Client Credentials.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSimulatedGoogleLogin}
                  disabled={simulating}
                  className="w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  {simulating ? (
                    <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Simulate Google Log In'
                  )}
                </button>
                
                <button
                  onClick={async () => {
                    try {
                      setError('');
                      setShowGoogleModal(false);
                      await signInWithGoogle();
                    } catch (err) {
                      setError(err.message || 'Google Auth failed');
                    }
                  }}
                  disabled={simulating}
                  className="w-full py-3 rounded-xl text-xs font-bold border border-slate-250/60 dark:border-slate-800/40 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/50 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  Proceed to Real Google OAuth
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  onClick={() => setShowGoogleModal(false)}
                  disabled={simulating}
                  className="text-[10px] font-semibold text-slate-450 hover:underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
