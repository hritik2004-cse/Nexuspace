"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
  const { user } = useAuth();
  const pathname = usePathname();
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexuspace-theme');
      return (saved && themes[saved]) ? saved : 'midnight';
    }
    return 'midnight';
  });

  // Initialize theme from user or local storage
  useEffect(() => {
    const isWorkspace = pathname?.startsWith('/workspace');
    if (!isWorkspace) return;

    if (user?.theme && themes[user.theme]) {
      setCurrentTheme(user.theme);
    } else {
      const savedTheme = localStorage.getItem('nexuspace-theme');
      if (savedTheme && themes[savedTheme]) {
        setCurrentTheme(savedTheme);
      }
    }
  }, [user?.theme, pathname]);

  // Apply currentTheme to DOM
  useEffect(() => {
    const isWorkspace = pathname?.startsWith('/workspace');
    
    // Determine the theme to apply
    // If workspace: use currentTheme (defaulting to localStorage if state is fresh)
    // If landing: use midnight (default)
    let themeToApply = isWorkspace ? currentTheme : 'midnight';
    
    // Emergency fallback to localStorage if in workspace and currentTheme is somehow lost
    if (isWorkspace && themeToApply === 'midnight') {
      const saved = localStorage.getItem('nexuspace-theme');
      if (saved && themes[saved]) themeToApply = saved;
    }

    const themeObj = themes[themeToApply] || themes.midnight;
    
    // Clean up ALL theme classes to prevent collisions
    Object.values(themes).forEach(t => {
      document.documentElement.classList.remove(t.class);
    });
    
    // Add theme class and persist if in workspace
    if (isWorkspace) {
      document.documentElement.classList.add(themeObj.class);
      localStorage.setItem('nexuspace-theme', themeToApply);
    } else {
      // On landing, we might want a clean state or just keep midnight
      document.documentElement.classList.add(themes.midnight.class);
    }
  }, [currentTheme, pathname]);

  // setter that also syncs to DB
  const setTheme = async (themeKey) => {
    if (!themes[themeKey]) return;
    
    setCurrentTheme(themeKey);
    
    if (user) {
      try {
        await api.put('/auth/profile', { theme: themeKey });
      } catch (err) {
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
