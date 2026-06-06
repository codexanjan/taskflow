import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [customTheme, setCustomTheme] = useState(() => {
    return localStorage.getItem('customTheme') || 'slate';
  });
  
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('isDark');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Custom backgrounds/wallpapers: 'default' | 'nebula' | 'cyber' | 'warm'
  const [wallpaper, setWallpaper] = useState(() => {
    return localStorage.getItem('wallpaper') || 'default';
  });

  useEffect(() => {
    const body = window.document.body;
    
    // Clean up classes
    body.classList.remove(
      'dark', 
      'theme-cyberpunk', 
      'theme-sunset', 
      'theme-forest', 
      'theme-lavender',
      'bg-nebula',
      'bg-cyber',
      'bg-warm'
    );
    
    // Force dark mode for Cyberpunk
    if (isDark || customTheme === 'cyberpunk') {
      body.classList.add('dark');
    }
    
    // Apply custom theme class
    if (customTheme !== 'slate') {
      body.classList.add(`theme-${customTheme}`);
    }

    // Apply wallpaper class
    if (wallpaper !== 'default') {
      body.classList.add(`bg-${wallpaper}`);
    }
    
    localStorage.setItem('customTheme', customTheme);
    localStorage.setItem('isDark', isDark ? 'true' : 'false');
    localStorage.setItem('wallpaper', wallpaper);
  }, [customTheme, isDark, wallpaper]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme: isDark ? 'dark' : 'light', 
        customTheme, 
        setCustomTheme, 
        isDark: isDark || customTheme === 'cyberpunk', 
        toggleTheme,
        wallpaper,
        setWallpaper
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
