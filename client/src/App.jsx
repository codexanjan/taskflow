import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AuthForm from './components/AuthForm';
import ResetPasswordForm from './components/ResetPasswordForm';

function AppContent() {
  const { user, guestMode, loading, isRecoveryMode, setRecoveryMode } = useAuth();
  const [showForgot, setShowForgot] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f1f5f9] dark:bg-[#0b0f19] text-slate-800 dark:text-white transition-colors duration-500">
        <div className="w-12 h-12 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin" />
        <span className="mt-4 font-bold text-slate-400 dark:text-slate-505 text-xs tracking-wider uppercase">Loading Workspace...</span>
      </div>
    );
  }

  const isAuthenticated = user || guestMode;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center py-6 px-4 transition-colors duration-500 overflow-hidden">
      
      {/* Decorative Floating Glassmorphic Blobs */}
      <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-float-1 -z-10" />
      <div className="absolute bottom-[20%] right-[10%] w-[450px] h-[450px] bg-purple-500/10 dark:bg-purple-650/10 rounded-full blur-3xl pointer-events-none animate-float-2 -z-10" />
      <div className="absolute top-[60%] left-[40%] w-[350px] h-[350px] bg-pink-500/5 dark:bg-pink-650/5 rounded-full blur-3xl pointer-events-none animate-float-3 -z-10" />

      {/* Main App Bar */}
      <Navbar />
      
      {/* Content Container */}
      <main className="w-full flex-grow flex items-start justify-center z-10">
        {isRecoveryMode ? (
          <ResetPasswordForm token="recovery" onBack={() => setRecoveryMode(false)} />
        ) : showForgot ? (
          <ResetPasswordForm onBack={() => setShowForgot(false)} />
        ) : isAuthenticated ? (
          <Dashboard />
        ) : (
          <AuthForm onForgotClick={() => setShowForgot(true)} />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs font-bold text-slate-450 dark:text-slate-500 z-10 select-none tracking-wide">
        Made with ❤️ by Anjan Shetty
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
