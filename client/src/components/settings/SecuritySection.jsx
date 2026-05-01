"use client";

import { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import SectionWrapper from './SectionWrapper';
import StickySaveBar from './StickySaveBar';
import { FiLock, FiShield, FiAlertTriangle } from 'react-icons/fi';

export default function SecuritySection() {
  const { saveManualSection } = useSettings();
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!passwords.current) newErrors.current = 'Required';
    if (passwords.new.length < 8) newErrors.new = 'Must be at least 8 characters';
    if (passwords.new !== passwords.confirm) newErrors.confirm = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    const success = await saveManualSection('password', {
      currentPassword: passwords.current,
      newPassword: passwords.new
    });

    if (success) {
      setPasswords({ current: '', new: '', confirm: '' });
    }
  };

  const hasChanges = passwords.current || passwords.new || passwords.confirm;

  return (
    <div className="space-y-12 pb-24">
      <SectionWrapper 
        id="panel-password"
        title="Security Settings" 
        description="Update your password and manage your account security."
      >
        <div className="space-y-8 max-w-xl">
          <div className="bg-[#FEF3C7] border border-[#FDE68A] p-5 rounded-2xl flex gap-4">
            <FiAlertTriangle className="text-[#92400E] text-xl shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-black text-[#92400E] uppercase tracking-tight">Security Tip</p>
              <p className="text-xs text-[#92400E]/80 font-medium leading-relaxed">
                Use a strong, unique password with a mix of letters, numbers, and symbols to protect your account.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Current Password</label>
              <input 
                type="password"
                value={passwords.current}
                onChange={e => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                className={`w-full bg-background/50 border ${errors.current ? 'border-red-500/50' : 'border-white/5'} rounded-2xl px-6 py-4 text-white font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
              />
              {errors.current && <p className="text-red-500 text-[10px] font-bold px-1 uppercase tracking-widest">{errors.current}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">New Password</label>
              <input 
                type="password"
                value={passwords.new}
                onChange={e => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                className={`w-full bg-background/50 border ${errors.new ? 'border-red-500/50' : 'border-white/5'} rounded-2xl px-6 py-4 text-white font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
              />
              {errors.new && <p className="text-red-500 text-[10px] font-bold px-1 uppercase tracking-widest">{errors.new}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Confirm New Password</label>
              <input 
                type="password"
                value={passwords.confirm}
                onChange={e => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                className={`w-full bg-background/50 border ${errors.confirm ? 'border-red-500/50' : 'border-white/5'} rounded-2xl px-6 py-4 text-white font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
              />
              {errors.confirm && <p className="text-red-500 text-[10px] font-bold px-1 uppercase tracking-widest">{errors.confirm}</p>}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {hasChanges && <StickySaveBar sectionId="password" onSave={handleSave} />}
    </div>
  );
}
