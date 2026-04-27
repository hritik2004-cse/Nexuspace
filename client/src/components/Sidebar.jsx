"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiHash, FiPlus, FiChevronDown, FiBell, FiSettings, FiTrash2, FiLock } from 'react-icons/fi';
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

import api from '@/services/api';
import { useWorkspace } from '@/context/WorkspaceContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user } = useAuth();
  const { activeWorkspace, workspaces, switchWorkspace, createWorkspace } = useWorkspace();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const currentChannel = searchParams.get('channel') || 'general';
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [isPrivateChannel, setIsPrivateChannel] = useState(false);
  const [channelPin, setChannelPin] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  
  // Real Channel mapping
  const [channels, setChannels] = useState([]);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  
  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (newWorkspaceName.trim()) {
      await createWorkspace(newWorkspaceName);
      setNewWorkspaceName('');
      setIsWorkspaceModalOpen(false);
    }
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (inviteEmail.trim() && activeWorkspace) {
      try {
        await api.post(`/workspaces/${activeWorkspace._id}/members`, { memberEmail: inviteEmail });
        setInviteEmail('');
        setIsInviteModalOpen(false);
        // Toast notification could go here
      } catch (err) {
        console.error("Invite failed", err);
      }
    }
  };

  useEffect(() => {
    const fetchChannels = async () => {
      if (activeWorkspace) {
        try {
          const res = await api.get(`/channels/${activeWorkspace._id}`);
          setChannels(res.data);
        } catch (err) {
          console.error("Failed to fetch real channels", err);
        }
      }
    };
    fetchChannels();
  }, [activeWorkspace]);

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (newChannelName.trim() && activeWorkspace) {
      const formattedName = newChannelName.toLowerCase().replace(/\s+/g, '-');
      try {
        const payload = { 
          name: formattedName, 
          workspaceId: activeWorkspace._id,
        };
        
        if (user?.role === 'Admin') {
          payload.isPrivate = isPrivateChannel;
          if (isPrivateChannel) payload.pin = channelPin;
        }

        const res = await api.post('/channels/findOrCreate', payload);
        
        // Prevent duplicate local appending
        if (!channels.find(c => c._id === res.data._id)) {
          setChannels([...channels, res.data]);
        }
        
        setNewChannelName('');
        setIsPrivateChannel(false);
        setChannelPin('');
        setIsDialogOpen(false);
        router.push(`/workspace?workspace=${activeWorkspace._id}&channel=${formattedName}`);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteChannel = async (channelId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/channels/${channelId}`);
      setChannels(prev => prev.filter(c => c._id !== channelId));
      if (currentChannel === channels.find(c => c._id === channelId)?.name) {
        router.push(`/workspace?workspace=${activeWorkspace._id}&channel=general`);
      }
    } catch (err) {
      console.error(err);
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
        {/* Workspace Header Dropdown */}
        <div className="relative">
          <div 
            onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
            className="h-16 flex items-center justify-between px-4 border-b border-slate-800 cursor-pointer hover:bg-slate-900 transition-colors"
          >
            <h1 className="font-bold text-lg text-white font-sans tracking-tight truncate max-w-[200px]">
              {activeWorkspace ? activeWorkspace.name : 'Nexuspace'}
            </h1>
            <FiChevronDown className="text-slate-400 shrink-0" />
          </div>

          {/* Dropdown Menu */}
          {isWorkspaceDropdownOpen && (
            <div className="absolute top-full left-0 w-full bg-slate-900 border-b border-r border-slate-800 shadow-2xl z-50">
              <div className="p-2 space-y-1">
                <div className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Workspaces</div>
                {workspaces.map(w => (
                  <button 
                    key={w._id}
                    onClick={() => { switchWorkspace(w._id); setIsWorkspaceDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeWorkspace?._id === w._id ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                  >
                    {w.name}
                  </button>
                ))}
                
                <div className="pt-2 mt-2 border-t border-slate-700/50">
                  <Dialog open={isWorkspaceModalOpen} onOpenChange={setIsWorkspaceModalOpen}>
                    <DialogTrigger className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-indigo-400 hover:bg-slate-800 transition-colors flex items-center">
                      <FiPlus className="mr-2" /> Create Workspace
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white">
                      <DialogHeader>
                        <DialogTitle>Create New Workspace</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateWorkspace} className="space-y-4 pt-4">
                        <input
                          autoFocus
                          value={newWorkspaceName}
                          onChange={(e) => setNewWorkspaceName(e.target.value)}
                          placeholder="My Awesome Team"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                        />
                        <DialogFooter>
                          <button type="submit" disabled={!newWorkspaceName} className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 disabled:opacity-50 font-semibold w-full">Create</button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>

                  {activeWorkspace && activeWorkspace.owner === user?._id && (
                    <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                      <DialogTrigger className="w-full mt-1 text-left px-3 py-2 rounded-md text-sm font-medium text-emerald-400 hover:bg-slate-800 transition-colors flex items-center">
                        <FiPlus className="mr-2" /> Invite Member
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white">
                        <DialogHeader>
                          <DialogTitle>Invite Member to {activeWorkspace.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleInviteUser} className="space-y-4 pt-4">
                          <input
                            autoFocus
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="colleague@example.com"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                          />
                          <DialogFooter>
                            <button type="submit" disabled={!inviteEmail} className="px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-50 font-semibold w-full">Send Invite</button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </div>
          )}
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
                    <DialogTitle className="text-xl font-bold font-sans text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">Create Channel</DialogTitle>
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

                  {user?.role === 'Admin' && (
                    <div className="space-y-4 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                          <FiLock className="text-amber-400" /> Make Private
                        </label>
                        <input
                          type="checkbox"
                          checked={isPrivateChannel}
                          onChange={(e) => setIsPrivateChannel(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-700 rounded focus:ring-indigo-500"
                        />
                      </div>
                      {isPrivateChannel && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Channel PIN</label>
                          <input
                            type="password"
                            value={channelPin}
                            onChange={(e) => setChannelPin(e.target.value)}
                            maxLength={6}
                            className="w-full bg-slate-950/50 border border-amber-500/30 text-amber-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-sans tracking-widest text-center shadow-inner"
                            placeholder="••••"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <DialogFooter className="pt-2">
                    <button type="submit" disabled={!newChannelName.trim() || (isPrivateChannel && !channelPin)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20 text-sm font-semibold w-full flex justify-center items-center">
                      Create Channel
                    </button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-2 space-y-0.5">
            {channels.map((channelObj) => (
              <div key={channelObj._id} className={`group flex items-center justify-between rounded-lg mx-2 ${currentChannel === channelObj.name ? 'bg-indigo-600/10' : 'hover:bg-slate-900'} transition-colors`}>
                <button
                  onClick={() => router.push(`/workspace?workspace=${activeWorkspace._id}&channel=${channelObj.name}`)}
                  className={`flex items-center flex-1 px-4 py-2 text-sm font-medium transition-colors ${currentChannel === channelObj.name ? 'text-indigo-400' : 'text-slate-300 hover:text-slate-100'}`}
                >
                  <FiHash className={`w-4 h-4 mr-2 ${currentChannel === channelObj.name ? 'text-indigo-400' : 'text-slate-500'}`} />
                  {channelObj.name}
                </button>
                {activeWorkspace?.owner === user?._id && channelObj.name !== 'general' && (
                  <button 
                    onClick={(e) => handleDeleteChannel(channelObj._id, e)}
                    className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 mr-1"
                  >
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
            {user?.avatar || user?.profileImage ? (
              <img 
                src={user.avatar || user.profileImage} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover shadow-lg"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
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
      </aside>
      
      <AnimatePresence>
        {isProfileOpen && (
          <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
