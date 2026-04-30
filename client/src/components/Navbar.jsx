"use client";

import { FiSearch, FiHelpCircle, FiInbox, FiUserPlus, FiCheck, FiMenu, FiUsers } from 'react-icons/fi';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Navbar({ onMenuClick }) {
  const searchParams = useSearchParams();
  const currentChannel = searchParams.get('channel') || 'general';
  const { activeWorkspace, onlineCount, isMemberListOpen, setIsMemberListOpen } = useWorkspace();
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleCopyInvite = () => {
    // Generate a direct link to the current workspace and channel
    const workspaceParam = activeWorkspace ? `workspace=${activeWorkspace._id}&` : '';
    const inviteUrl = `${window.location.origin}/workspace?${workspaceParam}channel=${currentChannel}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock search data
  const searchResults = [
    { type: 'message', content: 'Design Landing Page mocks ready.', sender: 'Ash', channel: 'design' },
    { type: 'message', content: 'Are we using socket.io?', sender: 'Lavkesh', channel: 'general' },
    { type: 'task', content: 'Build Auth API', assignee: 'Gaurav', status: 'To Do' },
    { type: 'task', content: 'Kanban Board Drag & Drop', assignee: 'Ash', status: 'In Progress' }
  ].filter(item => 
    item.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.sender && item.sender.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.assignee && item.assignee.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-background border-b border-border shadow-sm z-30 w-full shrink-0 relative transition-all duration-300">
      {/* Channel Title & Stats */}
      <div className="flex items-center gap-4">
        <button 
          aria-label="Toggle sidebar menu" 
          className="md:hidden text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-surface border border-transparent hover:border-border" 
          onClick={onMenuClick}
        >
          <FiMenu className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-primary font-black text-xl tracking-tighter shrink-0">#</span> 
            <h2 className="font-black text-white uppercase tracking-widest text-sm truncate max-w-[120px] sm:max-w-[200px]">
              {currentChannel}
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">{onlineCount} online</span>
            </div>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-700"></span>
            <span className="hidden sm:inline-block text-[9px] font-black uppercase text-slate-500 tracking-widest">Team-wide</span>
          </div>
        </div>
      </div>

      {/* Center Search */}
      <div className="flex-1 max-w-xl mx-4 hidden lg:block">
        <div className="relative group">
          <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isSearchFocused ? 'text-primary' : 'text-slate-400 group-focus-within:text-primary'}`} />
          <input 
            type="text" 
            placeholder={`Search in #${currentChannel}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="w-full bg-surface/50 border border-border text-xs text-slate-200 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button 
          onClick={() => setIsMemberListOpen(!isMemberListOpen)}
          className={`p-2 rounded-lg transition-all border ${isMemberListOpen ? 'bg-primary/10 border-primary/50 text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]' : 'text-slate-400 border-transparent hover:bg-surface hover:border-border'}`}
          title="Channel Members"
        >
          <FiUsers className="w-4 h-4" />
        </button>

        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={handleCopyInvite}
              className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all border border-border hover:border-primary/50 hover:bg-primary/10 text-slate-300 relative group"
            >
              {copied ? <FiCheck className="text-emerald-400" /> : <FiUserPlus className="text-primary" />}
              <span>Invite</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Copy Invite Link</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button aria-label="Open inbox" className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-surface rounded-lg border border-transparent hover:border-border">
              <FiInbox className="w-4.5 h-4.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Inbox</TooltipContent>
        </Tooltip>

        <Dialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-surface rounded-lg border border-transparent hover:border-border cursor-pointer">
                <FiHelpCircle className="w-4.5 h-4.5" />
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">Help</TooltipContent>
          </Tooltip>
          <DialogContent className="sm:max-w-[425px] bg-surface text-white border-border rounded-2xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-widest">Nexuspace Help</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Quick guides and keyboard shortcuts to navigate faster.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <h4 className="font-semibold mb-2">Keyboard Shortcuts</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex justify-between items-center bg-white/5 p-2 rounded">
                  <span>New Line</span>
                  <kbd className="bg-surface px-2 py-1 rounded text-xs font-mono">Shift + Enter</kbd>
                </li>
                <li className="flex justify-between items-center bg-white/5 p-2 rounded">
                  <span>Send Message</span>
                  <kbd className="bg-surface px-2 py-1 rounded text-xs font-mono">Enter</kbd>
                </li>
              </ul>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
