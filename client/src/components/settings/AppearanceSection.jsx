"use client";

import { useSettings } from '@/context/SettingsContext';
import { useTheme } from '@/context/ThemeContext';
import SectionWrapper from './SectionWrapper';
import { FiCheck, FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function AppearanceSection() {
  const { currentData, updateField, isSaving } = useSettings();
  const { themes, currentTheme } = useTheme();

  return (
    <SectionWrapper 
      id="panel-appearance"
      title="Appearance" 
      description="Customize the interface and theme of your workspace."
    >
      <div className="space-y-8">
        <div className="flex items-center justify-between bg-surface p-6 rounded-3xl border border-border">
          <div className="space-y-1">
            <p className="text-sm font-black text-foreground uppercase tracking-tight">Active Theme</p>
            <p className="text-xs text-slate-500 font-medium">Auto-saves instantly as you select.</p>
          </div>
          {isSaving && (
            <span className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
              <FiRefreshCw className="animate-spin" /> Syncing
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(themes).map(([key, theme]) => {
            const isSelected = currentData?.theme === key;
            const isApplied = currentTheme === key;

            return (
              <button
                key={key}
                onClick={() => updateField('theme', key)}
                className={`
                  relative group p-6 rounded-[2rem] border-2 transition-all text-left overflow-hidden
                  ${isSelected 
                    ? 'border-primary bg-primary/5 scale-[1.02] shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.2)]' 
                    : 'border-border bg-surface hover:border-primary/20 hover:bg-surface/80 hover:-translate-y-1'
                  }
                `}
              >
                {/* Glow effect for selected theme */}
                {isSelected && (
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/20 blur-2xl rounded-full animate-pulse"></div>
                )}

                <div className="flex items-center justify-between mb-6 relative z-10">
                  <span className="text-xs font-black text-foreground uppercase tracking-[0.2em]">{theme.name}</span>
                  {isSelected && <FiCheck className="text-primary text-xl" />}
                </div>
                
                <div className="space-y-3 relative z-10">
                  <div className="flex gap-2">
                     <div className="w-10 h-10 rounded-xl shadow-lg ring-2 ring-white/10" style={{ backgroundColor: theme.primaryHex }}></div>
                     <div className="flex-1 h-10 rounded-xl bg-white/5 border border-white/5"></div>
                  </div>
                  <div className="w-full h-12 rounded-xl bg-white/5 border border-white/5 opacity-50"></div>
                </div>

                {isApplied && (
                  <div className="absolute top-6 right-6 px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-full">
                    <span className="text-[8px] font-black text-primary uppercase tracking-widest">Active</span>
                  </div>
                )}

                {/* Tap Feedback Overlay */}
                <motion.div
                  className="absolute inset-0 bg-primary/10 opacity-0 group-active:opacity-100 transition-opacity"
                />
              </button>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
