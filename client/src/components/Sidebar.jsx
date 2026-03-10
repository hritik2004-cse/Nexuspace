"use client";

import { useState } from 'react';
import { FiHash, FiPlus, FiChevronDown, FiBell, FiSettings, FiTrash2 } from 'react-icons/fi';
import ProfileModal from './ProfileModal';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"

import { useSearchParams, useRouter } from 'next/navigation';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, joinChannel } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentChannel = searchParams.get('channel') || 'general';
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateChannel = (e) => {
    e.preventDefault();
    if (newChannelName.trim()) {
      const formattedName = newChannelName.toLowerCase().replace(/\s+/g, '-');
      joinChannel(formattedName);
      setNewChannelName('');
      setIsDialogOpen(false);
      router.push(`/workspace?channel=${formattedName}`);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen && setIsOpen(false)}
        />
      )}
      <aside className={`fixed md:relative inset-y-0 left-0 z-50 w-64 bg-slate-950 flex flex-col h-full border-r border-slate-800 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Workspace Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 cursor-pointer hover:bg-slate-900 transition-colors">
        <h1 className="font-bold text-lg text-white font-sans tracking-tight">Nexuspace</h1>
        <FiChevronDown className="text-slate-400" />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {/* Tools Section */}
        <div>
          <div className="px-4 flex items-center justify-between group">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-slate-300 transition-colors">Tools</span>
          </div>
          <div className="mt-2 space-y-1">
            <a
              href="/workspace/board"
              className="flex items-center px-4 py-2 text-sm font-medium transition-colors text-slate-300 hover:bg-slate-900 hover:text-slate-100"
            >
              <FiPlus className="w-4 h-4 mr-2 text-purple-400" />
              Kanban Board
            </a>
          </div>
        </div>

        {/* Channels Section */}
        <div>
          <div className="px-4 flex items-center justify-between group">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-slate-300 transition-colors">Channels</span>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger className="text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-slate-800 cursor-pointer flex items-center justify-center">
                <FiPlus className="w-4 h-4" />
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white border-slate-800 p-0 overflow-hidden shadow-2xl rounded-2xl">
                <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold font-sans text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Create Channel</DialogTitle>
                    <DialogDescription className="text-slate-400 text-sm mt-1.5 leading-relaxed">
                      Channels are where your team communicates. They're best when organized around a topic.
                    </DialogDescription>
                  </DialogHeader>
                </div>
                <form onSubmit={handleCreateChannel} className="p-6 space-y-6 bg-slate-900">
                  <div className="space-y-3">
                    <label htmlFor="name" className="text-sm font-semibold text-slate-300">
                      Channel Name
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-slate-500 font-bold">#</span>
                      <input
                        id="name"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-700/50 text-slate-100 rounded-lg pl-8 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans placeholder:text-slate-600 shadow-inner"
                        placeholder="e.g. marketing"
                        autoFocus
                      />
                    </div>
                  </div>
                  <DialogFooter className="pt-2">
                    <button type="submit" disabled={!newChannelName.trim()} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20 text-sm font-semibold w-full flex justify-center items-center">
                      Create Channel
                    </button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-2 space-y-0.5">
            {(user?.channels || ['general']).map((channel, idx) => (
              <div key={idx} className={`group flex items-center justify-between rounded-lg mx-2 ${currentChannel === channel ? 'bg-indigo-600/10' : 'hover:bg-slate-900'} transition-colors`}>
                <a
                  href={`/workspace?channel=${channel}`}
                  className={`flex items-center flex-1 px-4 py-2 text-sm font-medium transition-colors ${currentChannel === channel ? 'text-indigo-400' : 'text-slate-300 hover:text-slate-100'}`}
                >
                  <FiHash className={`w-4 h-4 mr-2 ${currentChannel === channel ? 'text-indigo-400' : 'text-slate-500'}`} />
                  {channel}
                </a>
                {user?.role === 'Admin' && channel !== 'general' && (
                  <button className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 mr-1">
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Footer */}
      <div 
        onClick={() => setIsProfileOpen(true)}
        className="mt-auto px-4 py-3 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            {user?.profileImage ? (
              <img 
                src={user.profileImage} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover shadow-lg"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-950 rounded-full"></div>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{user?.name || 'Ash'}</p>
            <p className="text-xs text-slate-400">@{user?.username || 'ash'}</p>
          </div>
        </div>
      <div className="flex gap-2 relative z-10">
          <button onClick={(e) => e.stopPropagation()} className="text-slate-400 hover:text-white transition-colors p-1"><FiBell className="w-4 h-4" /></button>
          <button onClick={(e) => { e.stopPropagation(); setIsProfileOpen(true); }} className="text-slate-400 hover:text-white transition-colors p-1"><FiSettings className="w-4 h-4" /></button>
        </div>
      </div>
      
      <AnimatePresence>
        {isProfileOpen && (
          <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        )}
      </AnimatePresence>
      </aside>
    </>
  );
}
