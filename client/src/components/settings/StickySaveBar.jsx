"use client";

import { useSettings } from '@/context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSave, FiX, FiRefreshCw } from 'react-icons/fi';

export default function StickySaveBar({ onSave, sectionId }) {
  const { dirtyFields, isSaving, discardChanges, currentData } = useSettings();

  // Check if this specific section has changes
  // For password, we don't use dirtyFields but local state (passed via props or context)
  // Let's assume onSave is passed a payload
  
  const hasChanges = sectionId === 'password' ? true : Object.values(dirtyFields).some(v => v);

  if (!hasChanges && sectionId !== 'password') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl"
      >
        <div className="bg-surface/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-3 md:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-3 px-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <p className="text-xs font-black text-white uppercase tracking-[0.1em]">Unsaved changes detected</p>
          </div>

          <div className="flex-1 sm:flex-none flex items-center gap-3">
            <button
              onClick={() => discardChanges(sectionId)}
              disabled={isSaving}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-black text-slate-400 hover:text-white hover:bg-white/5 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest"
            >
              <FiX className="text-sm" /> Discard
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className={`
                flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-2xl text-xs font-black text-white transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest shadow-lg
                ${isSaving ? 'bg-primary/50' : 'bg-primary shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5'}
              `}
            >
              {isSaving ? (
                <FiRefreshCw className="animate-spin" />
              ) : (
                <FiSave className="text-sm" />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
