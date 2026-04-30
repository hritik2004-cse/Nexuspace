"use client";

import { Suspense, lazy } from 'react';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import SettingsTabs from '@/components/settings/SettingsTabs';
import SettingsSkeleton from '@/components/settings/SettingsSkeleton';
import { AnimatePresence } from 'framer-motion';

// Lazy load sections for performance
const ProfileSection = lazy(() => import('@/components/settings/ProfileSection'));
const SecuritySection = lazy(() => import('@/components/settings/SecuritySection'));
const AppearanceSection = lazy(() => import('@/components/settings/AppearanceSection'));

function SettingsContent() {
  const { currentTab } = useSettings();

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-12 scrollbar-thin scrollbar-thumb-surface-hover relative">
      <div className="max-w-4xl mx-auto pb-32">
        <AnimatePresence mode="wait">
          <Suspense fallback={<SettingsSkeleton />}>
            {currentTab === 'profile' && <ProfileSection key="profile" />}
            {currentTab === 'password' && <SecuritySection key="password" />}
            {currentTab === 'appearance' && <AppearanceSection key="appearance" />}
          </Suspense>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <SettingsProvider>
      <div className="h-full bg-background flex flex-col overflow-hidden">
        {/* Mobile Header (Condensed) */}
        <div className="p-6 md:p-12 border-b border-border bg-white/5 shrink-0">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase">User Settings</h1>
            <p className="text-slate-500 mt-1.5 text-xs md:text-sm font-medium">Manage your account, security, and interface aesthetics</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <SettingsTabs />
          <SettingsContent />
        </div>
      </div>
    </SettingsProvider>
  );
}
