import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, supabase } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(true); // Always online for cloud storage
  const [authError, setAuthError] = useState('');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [guestMode, setGuestMode] = useState(() => {
    return localStorage.getItem('guest_mode') === 'true';
  });

  // Check current Supabase session
  const initAuth = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await authAPI.getMe();
        setUser(profile);
        setGuestMode(false);
        localStorage.setItem('guest_mode', 'false');
      } else {
        const isGuest = localStorage.getItem('guest_mode') === 'true';
        setGuestMode(isGuest);
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to restore Supabase session:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
    
    // Subscribe to auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Supabase Auth Event:', event);
      if (session?.user) {
        const profile = await authAPI.getMe();
        setUser(profile);
        setGuestMode(false);
        localStorage.setItem('guest_mode', 'false');
      } else {
        setUser(null);
      }

      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authAPI.login(email, password);
      setGuestMode(false);
      localStorage.setItem('guest_mode', 'false');
      setUser(data.user);
      setLoading(false);
      return data.user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const register = async (email, password) => {
    setLoading(true);
    try {
      const data = await authAPI.register(email, password);
      setGuestMode(false);
      localStorage.setItem('guest_mode', 'false');
      setUser(data.user);
      setLoading(false);
      return data.user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    localStorage.removeItem('guest_mode');
    setGuestMode(false);
    setUser(null);
    setLoading(false);
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      setLoading(false);
      throw error;
    }
  };

  const startGuestMode = () => {
    setGuestMode(true);
    localStorage.setItem('guest_mode', 'true');
    setUser(null);
  };

  const stopGuestMode = () => {
    setGuestMode(false);
    localStorage.setItem('guest_mode', 'false');
    initAuth();
  };

  const forgotPassword = async (email) => {
    return authAPI.forgotPassword(email);
  };

  const resetPassword = async (token, password) => {
    return authAPI.resetPassword(token, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        backendOnline,
        guestMode,
        authError,
        setAuthError,
        isRecoveryMode,
        setRecoveryMode: setIsRecoveryMode,
        login,
        register,
        logout,
        signInWithGoogle,
        startGuestMode,
        stopGuestMode,
        forgotPassword,
        resetPassword,
        refreshBackendStatus: initAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
