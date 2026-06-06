import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, Download, Sparkles, CloudOff, RefreshCw, LogIn } from 'lucide-react';

export default function Navbar() {
  const { user, logout, guestMode, backendOnline, stopGuestMode, refreshBackendStatus } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBtn(false);
    }
  };

  const handleRefreshClick = async () => {
    setRefreshing(true);
    await refreshBackendStatus();
    // Simulate delay for a smooth rotating loader feel
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <header className="glass-panel sticky top-4 z-40 rounded-2xl mx-auto px-6 py-4 flex items-center justify-between border border-white/20 dark:border-slate-800/30 shadow-lg mb-8 max-w-6xl w-full">
      {/* Brand Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-extrabold shadow-md shadow-indigo-500/20">
          ✓
        </div>
        <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
          TaskFlow
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* PWA Install Button */}
        {showInstallBtn && (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        )}

        {/* Server Sync / Offline Toggles */}
        {guestMode ? (
          <div className="flex items-center gap-2">
            {!backendOnline ? (
              <span className="hidden md:flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-2.5 py-1 rounded-full border border-slate-200/50 dark:border-slate-800/20">
                <CloudOff className="w-3 h-3 text-amber-500" />
                Local Storage
              </span>
            ) : (
              <button
                onClick={stopGuestMode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sync Account</span>
              </button>
            )}

            {!backendOnline && (
              <button
                onClick={handleRefreshClick}
                disabled={refreshing}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                title="Retry cloud connection"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {user?.profilePicture && (
              <img
                src={user.profilePicture}
                alt={user.name || 'User avatar'}
                className="w-7 h-7 rounded-full border border-indigo-500/30 object-cover shadow-sm"
                referrerPolicy="no-referrer"
              />
            )}
            <span className="hidden md:block text-xs font-bold text-slate-600 dark:text-slate-350">
              {user?.name || user?.email}
            </span>
            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all flex items-center justify-center cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
