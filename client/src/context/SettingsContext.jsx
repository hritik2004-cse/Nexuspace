"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import api from '@/services/api';
import { toast } from 'react-toastify';

const SettingsContext = createContext();

export const SETTINGS_CONFIG = {
  profile: { strategy: 'auto', label: 'Profile' },
  password: { strategy: 'manual', label: 'Security' },
  appearance: { strategy: 'auto', label: 'Appearance' },
};

export function SettingsProvider({ children }) {
  const { user, updateProfile } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL Tab State
  const validTabs = Object.keys(SETTINGS_CONFIG);
  const currentTab = searchParams.get('tab') || 'profile';
  
  const setTab = (tabId) => {
    if (!validTabs.includes(tabId)) return;
    const params = new URLSearchParams(searchParams);
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Ensure currentTab is valid on mount
  useEffect(() => {
    if (!validTabs.includes(currentTab)) {
      setTab('profile');
    }
  }, [currentTab]);

  // Settings State
  const [initialData, setInitialData] = useState(null);
  const [currentData, setCurrentData] = useState(null);
  const [dirtyFields, setDirtyFields] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  // Auto-save AbortController
  const abortControllerRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  // Initialize data
  useEffect(() => {
    if (user) {
      const data = {
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        customTitle: user.customTitle || '',
        theme: user.theme || 'midnight',
      };
      setInitialData(data);
      setCurrentData(data);
      setDirtyFields({});
    }
  }, [user]);

  // Update a specific field
  const updateField = (field, value) => {
    setCurrentData(prev => ({ ...prev, [field]: value }));
    setDirtyFields(prev => ({ ...prev, [field]: value !== initialData[field] }));

    // If it's an auto-save section field, trigger auto-save
    const section = Object.keys(SETTINGS_CONFIG).find(key => 
      key === 'profile' && ['name', 'bio', 'customTitle'].includes(field) ||
      key === 'appearance' && field === 'theme'
    );

    if (section && SETTINGS_CONFIG[section].strategy === 'auto') {
      triggerAutoSave(field, value);
    }
  };

  // Debounced Auto-Save
  const triggerAutoSave = (field, value) => {
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    
    setLastSaved(null);
    setIsSaving(true);
    setSaveError(null);

    autoSaveTimeoutRef.current = setTimeout(async () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      try {
        // Use updateProfile from AuthContext to keep global state in sync
        await updateProfile({ [field]: value });
        
        setInitialData(prev => ({ ...prev, [field]: value }));
        setDirtyFields(prev => ({ ...prev, [field]: false }));
        setLastSaved(new Date());
        setIsSaving(false);
      } catch (err) {
        if (err.name === 'CanceledError') return;
        setSaveError(`Failed to auto-save ${field}`);
        setIsSaving(false);
      }
    }, 1000);
  };

  // Manual Save for specific section
  const saveManualSection = async (sectionId, payload) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      if (sectionId === 'password') {
        await api.put('/auth/change-password', payload);
      } else {
        await updateProfile(payload);
      }
      
      // Update local state for non-password fields
      if (sectionId !== 'password') {
        setInitialData(prev => ({ ...prev, ...payload }));
        Object.keys(payload).forEach(key => {
          setDirtyFields(prev => ({ ...prev, [key]: false }));
        });
      }
      
      toast.success("Changes saved successfully!");
      setIsSaving(false);
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save changes";
      setSaveError(msg);
      toast.error(msg);
      setIsSaving(false);
      return false;
    }
  };

  const discardChanges = (sectionId) => {
    // Reset fields belonging to this section
    // For simplicity, we can reset all or just specific ones
    setCurrentData(initialData);
    setDirtyFields({});
    setSaveError(null);
  };

  // Unsaved Changes Warning
  useEffect(() => {
    const hasUnsaved = Object.values(dirtyFields).some(isDirty => isDirty);
    
    const handleBeforeUnload = (e) => {
      if (hasUnsaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirtyFields]);

  return (
    <SettingsContext.Provider value={{
      currentTab,
      setTab,
      currentData,
      updateField,
      dirtyFields,
      isSaving,
      saveError,
      lastSaved,
      saveManualSection,
      discardChanges,
      user
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
