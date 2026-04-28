"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '@/services/api';

const ThemeContext = createContext();

export const themes = {
  midnight: {
    name: 'Midnight',
    primary: 'indigo',
    primaryHex: '#6366f1',
    bg: '#030014',
    sidebar: '#0a0a0f',
    accent: 'indigo-500',
    class: 'theme-midnight'
  },
  emerald: {
    name: 'Emerald',
    primary: 'emerald',
    primaryHex: '#10b981',
    bg: '#020617',
    sidebar: '#061a14',
    accent: 'emerald-500',
    class: 'theme-emerald'
  },
  rose: {
    name: 'Rose',
    primary: 'rose',
    primaryHex: '#f43f5e',
    bg: '#0c0205',
    sidebar: '#1a060a',
    accent: 'rose-500',
    class: 'theme-rose'
  },
  amber: {
    name: 'Amber',
    primary: 'amber',
    primaryHex: '#f59e0b',
    bg: '#0a0500',
    sidebar: '#1a0d06',
    accent: 'amber-500',
    class: 'theme-amber'
  },
  aura: {
    name: 'Aura',
    primary: 'purple',
    primaryHex: '#a855f7',
    bg: '#05000a',
    sidebar: '#0f061a',
    accent: 'purple-500',
    class: 'theme-aura'
  }
};

export function ThemeProvider({ children }) {
  const { user, updateProfile } = useAuth();
  const [currentTheme, setCurrentTheme] = useState('midnight');

  // 1. Initialize theme from User profile or LocalStorage
  useEffect(() => {
    if (user?.theme && themes[user.theme]) {
      setCurrentTheme(user.theme);
    } else {
      const savedTheme = localStorage.getItem('nexuspace-theme');
      if (savedTheme && themes[savedTheme]) {
        setCurrentTheme(savedTheme);
      }
    }
  }, [user?.theme]); // Only re-run if the DB theme changes

  // 2. Apply theme to DOM and save to LocalStorage
  useEffect(() => {
    const themeObj = themes[currentTheme] || themes.midnight;
    
    // Remove all theme classes
    Object.values(themes).forEach(t => {
      document.documentElement.classList.remove(t.class);
    });
    
    // Add current theme class
    document.documentElement.classList.add(themeObj.class);
    localStorage.setItem('nexuspace-theme', currentTheme);
  }, [currentTheme]);

  // 3. Exposed setter that also syncs to DB
  const setTheme = async (themeKey) => {
    if (!themes[themeKey]) return;
    
    setCurrentTheme(themeKey);
    
    if (user) {
      try {
        await api.put('/auth/profile', { theme: themeKey });
      } catch (err) {
        console.error("Failed to sync theme to DB", err);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setCurrentTheme: setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
