"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiHash, FiPlus, FiChevronDown, FiBell, FiSettings, FiTrash2, FiLock, FiLogOut, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProfileModal from './ProfileModal';
import InboxModal from './InboxModal';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { useSocket } from '@/context/SocketContext';

export default function Sidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { activeWorkspace, workspaces, switchWorkspace, createWorkspace } = useWorkspace();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const currentChannel = searchParams.get('channel') || 'general';
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChannels, setUnreadChannels] = useState(new Set());
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
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);

  // Listen for unread messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      // If message is in current active channel, don't mark as unread
      if (msg.channelName && msg.channelName !== currentChannel) {
        setChannels(prev => prev.map(c => 
          c.name === msg.channelName 
            ? { ...c, unreadCount: (c.unreadCount || 0) + 1 } 
            : c
        ));
      }
    };

    const handleNewChannel = (newChannel) => {
      setChannels(prev => {
        if (prev.some(c => c._id === newChannel._id)) return prev;
        return [...prev, newChannel];
      });
    };

    const handleChannelUpdated = (updatedChannel) => {
      setChannels(prev => prev.map(c => 
        c._id === updatedChannel._id ? updatedChannel : c
      ));
    };

    socket.on('receive_message', handleNewMessage);
    socket.on('channel_created', handleNewChannel);
    socket.on('channel_updated', handleChannelUpdated);
    return () => {
      socket.off('receive_message', handleNewMessage);
      socket.off('channel_created', handleNewChannel);
      socket.off('channel_updated', handleChannelUpdated);
    };
  }, [socket, currentChannel]);

  // Clear unread when channel changes and sync with backend
  useEffect(() => {
    const syncReadStatus = async () => {
      const channelObj = channels.find(c => c.name === currentChannel);
      if (channelObj) {
        try {
          await api.post('/auth/update-last-read', { channelId: channelObj._id });
          setChannels(prev => prev.map(c => 
            c.name === currentChannel ? { ...c, unreadCount: 0 } : c
          ));
        } catch (err) {
        }
      }
    };
    syncReadStatus();
  }, [currentChannel, channels.length > 0]); // Trigger when currentChannel changes or channels are loaded
  
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
        toast.success(`Success! We've sent an invitation to ${inviteEmail}.`);
      } catch (err) {
        toast.error(err.response?.data?.message || "We couldn't send the invitation. Please check the email and try again.");
      }
    }
  };

  useEffect(() => {
    const fetchChannels = async () => {
      if (activeWorkspace) {
        setIsLoadingChannels(true);
        try {
          const res = await api.get(`/channels/${activeWorkspace._id}`);
          setChannels(res.data);
        } catch (err) {
        } finally {
          setIsLoadingChannels(false);
        }
      }
    };
    
    const fetchNotificationsCount = async () => {
      if (user) {
        try {
          const res = await api.get('/notifications');
          setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (err) {
        }
      }
    };

    fetchChannels();
    fetchNotificationsCount();
  }, [activeWorkspace, user, isInboxOpen]);

  useEffect(() => {
    if (!socket) return;
    const handleNewNotification = () => {
      setUnreadCount(prev => prev + 1);
    };
    socket.on('receive_notification', handleNewNotification);
    return () => socket.off('receive_notification', handleNewNotification);
  }, [socket]);

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
        toast.success(`Welcome to #${formattedName}! The channel is ready for you.`);
      } catch (err) {
        toast.error(err.response?.data?.message || "We couldn't create the channel. Please try a different name.");
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
      toast.success("Channel deleted successfully. It's gone!");
    } catch (err) {
      toast.error(err.response?.data?.message || "We couldn't delete the channel. Please try again.");
    }
  };

  const handleLeaveChannel = async (channelId, e) => {
    e.stopPropagation();
    try {
      await api.post(`/channels/${channelId}/leave`);
      setChannels(prev => prev.filter(c => c._id !== channelId));
      if (currentChannel === channels.find(c => c._id === channelId)?.name) {
        router.push(`/workspace?workspace=${activeWorkspace._id}&channel=general`);
      }
      toast.success("You've successfully left the channel.");
    } catch (err) {
      toast.error(err.response?.data?.message || "We couldn't process your request to leave. Please try again.");
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
      <aside className={`fixed md:relative inset-y-0 left-0 z-50 ${isCollapsed ? 'w-20' : 'w-64 md:w-64'} w-[280px] bg-sidebar/80 backdrop-blur-3xl flex flex-col h-full border-r border-border transition-all duration-500 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} shadow-[10px_0_40px_rgba(0,0,0,0.6)] group/sidebar`}>
        {/* Collapse Toggle Button (Desktop only) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex absolute -right-3.5 top-20 w-7 h-7 bg-primary text-white rounded-full items-center justify-center shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] border border-white/20 z-50 lg:opacity-0 group-hover/sidebar:opacity-100 transition-all hover:scale-110 active:scale-95"
            >
              {isCollapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{isCollapsed ? 'Expand' : 'Collapse'}</TooltipContent>
        </Tooltip>

        {/* Workspace Header Dropdown */}
        <div className="relative">
          <div 
            onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
            className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-4'} border-b border-border cursor-pointer lg:hover:bg-white/5 transition-all duration-300 relative overflow-hidden group/header`}
          >
            {isCollapsed ? (
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] group-hover/header:scale-105 transition-transform">
                {activeWorkspace ? activeWorkspace.name.charAt(0).toUpperCase() : 'N'}
              </div>
            ) : (
              <h1 className="font-black text-lg text-white font-sans tracking-tighter truncate max-w-[180px] animate-in fade-in slide-in-from-left-2 duration-500">
                {activeWorkspace ? activeWorkspace.name : 'Nexuspace'}
              </h1>
            )}
            {!isCollapsed && <FiChevronDown className="text-white/40 shrink-0 group-hover/header:text-primary transition-colors" />}
          </div>

          {/* Dropdown Menu */}
          {isWorkspaceDropdownOpen && (
            <div className={`absolute top-full left-0 ${isCollapsed ? 'w-64 ml-2 rounded-xl' : 'w-full'} bg-surface/95 backdrop-blur-2xl border border-border shadow-2xl z-50 animate-in zoom-in-95 fade-in duration-200 overflow-hidden`}>
              <div className="p-3 space-y-1">
                <div className="px-2 py-1 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Workspaces</div>
                {workspaces.map(w => (
                  <button 
                    key={w._id}
                    onClick={() => { switchWorkspace(w._id); setIsWorkspaceDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeWorkspace?._id === w._id ? 'bg-primary text-white shadow-lg' : 'text-slate-400 lg:hover:bg-white/5 lg:hover:text-white'}`}
                  >
                    {w.name}
                  </button>
                ))}
                
                <div className="pt-3 mt-3 border-t border-border">
                  <Dialog open={isWorkspaceModalOpen} onOpenChange={setIsWorkspaceModalOpen}>
                    <DialogTrigger className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-primary lg:hover:bg-primary/10 transition-all flex items-center gap-2">
                      <FiPlus className="w-4 h-4" /> Create New
                    </DialogTrigger>
                    <DialogContent className="bg-surface/95 backdrop-blur-2xl border-border">
                      <DialogHeader>
                        <DialogTitle className="text-white">Create Workspace</DialogTitle>
                        <DialogDescription className="text-slate-400">Enter a name for your new workspace.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateWorkspace} className="space-y-4">
                        <input 
                          type="text" 
                          placeholder="Workspace Name" 
                          value={newWorkspaceName}
                          onChange={(e) => setNewWorkspaceName(e.target.value)}
                          className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                        <DialogFooter>
                          <button type="submit" className="w-full bg-primary text-white font-black py-3 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">Create Workspace</button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          )}
        </div>

      {/* Navigation */}
      <nav aria-label="Sidebar Navigation" className="flex-1 overflow-y-auto py-6 space-y-8 scrollbar-hide">
        {/* Tools Section */}
        <div>
          {!isCollapsed && (
            <div className="px-6 flex items-center justify-between group mb-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-slate-400 transition-colors">Tools</span>
            </div>
          )}
          <div className="space-y-1 px-3">
            <a
              href="/workspace/board"
              className={`flex items-center ${isCollapsed ? 'justify-center w-12 h-12 mx-auto rounded-2xl' : 'px-4 py-2.5 rounded-xl'} text-sm font-bold transition-all relative group/tool ${router.pathname === '/workspace/board' ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              title={isCollapsed ? "Kanban Board" : ""}
            >
              <FiPlus className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} text-primary group-hover/tool:scale-110 transition-transform`} />
              {!isCollapsed && <span>Kanban Board</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-surface border border-border text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover/tool:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
                  Kanban Board
                </div>
              )}
            </a>
          </div>
        </div>

        {/* Channels Section */}
        <div>
          <div className={`px-6 flex items-center ${isCollapsed ? 'justify-center px-0 mb-4' : 'justify-between mb-3'} group`}>
            {!isCollapsed && <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-slate-400 transition-colors">Channels</span>}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger className={`text-slate-500 hover:text-white transition-all p-1.5 rounded-lg border border-transparent hover:border-border hover:bg-white/5 cursor-pointer flex items-center justify-center ${isCollapsed ? 'w-10 h-10 bg-white/5 rounded-xl' : ''}`}>
                <FiPlus className="w-4 h-4" />
              </DialogTrigger>
              <DialogContent className="bg-surface/95 backdrop-blur-2xl border-border">
                <DialogHeader>
                  <DialogTitle className="text-white">Create Channel</DialogTitle>
                  <DialogDescription className="text-slate-400">Channels are where your team communicates.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateChannel} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Channel Name</label>
                    <div className="relative">
                      <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="e.g. marketing" 
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>

                  {user?.role === 'Admin' && (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between px-1">
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-white">Private Channel</p>
                          <p className="text-[10px] text-slate-500 font-medium">Only invited members can join</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setIsPrivateChannel(!isPrivateChannel)}
                          className={`w-10 h-5 rounded-full transition-all relative ${isPrivateChannel ? 'bg-primary' : 'bg-slate-700'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isPrivateChannel ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>

                      {isPrivateChannel && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Channel PIN</label>
                          <div className="relative">
                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input 
                              type="password" 
                              placeholder="4-digit PIN" 
                              maxLength={4}
                              value={channelPin}
                              onChange={(e) => setChannelPin(e.target.value)}
                              className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <DialogFooter className="pt-4">
                    <button 
                      type="submit" 
                      className="w-full bg-primary text-white font-black py-3 rounded-xl shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Create Channel
                    </button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

          </div>
          <div className="space-y-1 px-3">
            {isLoadingChannels ? (
              // Loading Skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`h-10 rounded-xl bg-white/5 animate-pulse mb-1 ${isCollapsed ? 'w-12 mx-auto' : 'w-full'}`} />
              ))
            ) : (
              channels.map((channelObj) => (
                <div key={channelObj._id} className="relative group/channel">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => router.push(`/workspace?workspace=${activeWorkspace._id}&channel=${channelObj.name}`)}
                        className={`flex items-center ${isCollapsed ? 'justify-center w-12 h-12 mx-auto rounded-2xl' : 'px-4 py-2.5 rounded-xl w-full'} text-sm font-bold transition-all relative ${currentChannel === channelObj.name ? 'bg-primary text-white shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                      >
                        <FiHash className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} ${currentChannel === channelObj.name ? 'text-white' : 'text-slate-600 group-hover/channel:text-primary'} transition-colors`} />
                        {!isCollapsed && <span className="truncate text-white/90">{channelObj.name}</span>}
                        
                        {/* Unread Badge */}
                        {channelObj.unreadCount > 0 && (
                          <span className={`absolute ${isCollapsed ? '-top-1 -right-1' : 'right-4'} min-w-5 h-5 px-1 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-sidebar shadow-lg`}>
                            {channelObj.unreadCount > 99 ? '99+' : channelObj.unreadCount}
                          </span>
                        )}
                      </button>
                    </TooltipTrigger>
                    {isCollapsed && <TooltipContent side="right">#{channelObj.name}</TooltipContent>}
                  </Tooltip>
                </div>
              ))
            )}
          </div>
        </div>
      </nav>

      {/* User Footer */}
      <div className={`mt-auto p-3 border-t border-border bg-white/5 relative overflow-hidden group/footer transition-all duration-300`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between gap-2'}`}>
          <div 
            onClick={() => router.push(`/workspace/settings${activeWorkspace ? `?workspace=${activeWorkspace._id}` : ''}`)}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} cursor-pointer transition-all min-w-0 flex-1`}
          >
            <div className="relative shrink-0">
              {user?.avatar || user?.profileImage ? (
                <img 
                  src={user.avatar || user.profileImage} 
                  alt="Profile" 
                  className={`w-9 h-9 rounded-xl object-cover shadow-2xl ring-2 ring-transparent group-hover/footer:ring-primary/50 transition-all`}
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-primary to-primary/60 flex items-center justify-center text-white font-black text-lg shadow-2xl">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-[3px] border-sidebar rounded-full shadow-lg"></div>
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-black text-white truncate leading-tight">{user?.name || 'User'}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter truncate">@{user?.username || 'user'}</p>
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <div className="flex items-center gap-0.5 shrink-0">
              <button aria-label="Notifications" onClick={(e) => { e.stopPropagation(); setIsInboxOpen(true); }} className="text-slate-500 hover:text-primary transition-all p-2 rounded-lg hover:bg-white/5 relative group/notif">
                <FiBell className="w-4 h-4" />
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-sidebar shadow-lg"></span>}
              </button>
              <button 
                aria-label="Settings" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  router.push(`/workspace/settings${activeWorkspace ? `?workspace=${activeWorkspace._id}` : ''}`); 
                }} 
                className="text-slate-500 hover:text-primary transition-all p-2 rounded-lg hover:bg-white/5"
              >
                <FiSettings className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      </aside>
      
      <AnimatePresence>
        {isProfileOpen && (
          <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        )}
        {isInboxOpen && (
          <InboxModal isOpen={isInboxOpen} onClose={() => { setIsInboxOpen(false); setUnreadCount(0); }} />
        )}
      </AnimatePresence>
    </>
  );
}
