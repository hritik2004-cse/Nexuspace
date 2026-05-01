"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
    id: 'midnight'
  },
  emerald: {
    name: 'Emerald',
    primary: 'emerald',
    primaryHex: '#10b981',
    bg: '#020617',
    sidebar: '#061a14',
    accent: 'emerald-500',
    id: 'emerald'
  },
  rose: {
    name: 'Rose',
    primary: 'rose',
    primaryHex: '#f43f5e',
    bg: '#0c0205',
    sidebar: '#1a060a',
    accent: 'rose-500',
    id: 'rose'
  },
  amber: {
    name: 'Amber',
    primary: 'amber',
    primaryHex: '#f59e0b',
    bg: '#0a0500',
    sidebar: '#1a0d06',
    accent: 'amber-500',
    id: 'amber'
  },
  aura: {
    name: 'Aura',
    primary: 'purple',
    primaryHex: '#a855f7',
    bg: '#05000a',
    sidebar: '#0f061a',
    accent: 'purple-500',
    id: 'aura'
  }
};

export function ThemeProvider({ children }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [currentTheme, _setCurrentTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return (saved && themes[saved]) ? saved : 'midnight';
    }
    return 'midnight';
  });

  const applyTheme = useCallback((themeId) => {
    if (!themes[themeId]) return;
    
    const root = document.documentElement;
    if (root.dataset.theme === themeId) return; // Guard against redundant updates

    root.dataset.theme = themeId;
    root.style.colorScheme = themeId === 'light' ? 'light' : 'dark';
    
    // Legacy support for .dark class if still used by tailwind
    if (themeId !== 'light') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem('theme', themeId);
    _setCurrentTheme(themeId);
  }, []);

  // Multi-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e) => {
      // 1. Theme sync
      if (e.key === 'theme' && e.newValue && e.newValue !== currentTheme) {
        applyTheme(e.newValue);
      }
      
      // 2. Monotonic Logout Sync
      if (e.key === 'logout_event' && e.newValue) {
        const eventData = JSON.parse(e.newValue);
        const lastSeenLogout = localStorage.getItem('last_logout_ts') || 0;
        
        if (eventData.ts > lastSeenLogout) {
          localStorage.setItem('last_logout_ts', eventData.ts);
          logout();
          router.push('/login');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentTheme, applyTheme, logout, router]);

  // Initial Sync from User Data
  useEffect(() => {
    if (user?.theme && themes[user.theme] && user.theme !== currentTheme) {
      applyTheme(user.theme);
    }
  }, [user?.theme, currentTheme, applyTheme]);

  // Setter that also syncs to DB
  const setTheme = async (themeKey) => {
    if (!themes[themeKey]) return;
    
    applyTheme(themeKey);
    
    if (user) {
      try {
        await api.put('/auth/profile', { theme: themeKey });
      } catch (err) {
        console.error('Failed to sync theme to DB:', err);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
