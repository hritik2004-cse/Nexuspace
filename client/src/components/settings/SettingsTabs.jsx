"use client";

import { useSettings, SETTINGS_CONFIG } from '@/context/SettingsContext';
import { FiUser, FiLock, FiLayout, FiLogOut } from 'react-icons/fi';
import { motion } from 'framer-motion';

const TAB_ICONS = {
  profile: <FiUser />,
  password: <FiLock />,
  appearance: <FiLayout />,
};

export default function SettingsTabs() {
  const { currentTab, setTab, dirtyFields, user } = useSettings();

  const handleKeyDown = (e, tabId, index) => {
    const tabs = Object.keys(SETTINGS_CONFIG);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      const nextTab = tabs[(index + 1) % tabs.length];
      setTab(nextTab);
      document.getElementById(`tab-${nextTab}`)?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      const prevTab = tabs[(index - 1 + tabs.length) % tabs.length];
      setTab(prevTab);
      document.getElementById(`tab-${prevTab}`)?.focus();
    }
  };

  return (
    <div 
      role="tablist" 
      aria-label="Settings Sections"
      className="w-full md:w-64 flex md:flex-col overflow-x-auto md:overflow-visible no-scrollbar gap-2 bg-sidebar/30 backdrop-blur-3xl p-4 border-b md:border-b-0 md:border-r border-border/50 shrink-0 sticky top-0 md:relative z-20"
    >
      {Object.entries(SETTINGS_CONFIG).map(([id, config], index) => {
        const isActive = currentTab === id;
        const hasDirty = (id === 'profile' && (dirtyFields.name || dirtyFields.bio || dirtyFields.customTitle)) ||
                        (id === 'appearance' && dirtyFields.theme);

        return (
          <button
            key={id}
            id={`tab-${id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => setTab(id)}
            onKeyDown={(e) => handleKeyDown(e, id, index)}
            className={`
              relative flex-none md:flex-none flex items-center justify-center md:justify-start gap-2 md:gap-3 px-5 md:px-4 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl text-[11px] md:text-sm font-black transition-all whitespace-nowrap
              ${isActive 
                ? 'bg-primary text-white shadow-[0_10px_20px_-5px_rgba(var(--primary-rgb),0.3)]' 
                : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
              }
              group/tab
            `}
          >
            <span className={`text-base md:text-lg ${isActive ? 'text-white' : 'text-primary/70 group-hover/tab:text-primary'}`}>
              {TAB_ICONS[id]}
            </span>
            <span className="uppercase tracking-widest">{config.label}</span>
            
            {hasDirty && !isActive && (
              <span className="absolute top-1 right-1 md:top-2 md:right-2 w-1.5 md:h-2 h-1.5 md:w-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
            )}

            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 border-2 border-white/20 rounded-xl md:rounded-2xl pointer-events-none"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        );
      })}

      <div className="hidden md:flex flex-col pt-4 mt-auto border-t border-white/5">
        <div className="px-4 py-3 mb-1">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Account</p>
        </div>
        <button
          onClick={() => {/* Logout logic handled in component */}}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-all uppercase tracking-widest active:scale-95"
        >
          <FiLogOut className="text-lg" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
