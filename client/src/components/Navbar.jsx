"use client";

import { FiSearch, FiHelpCircle, FiInbox, FiUserPlus, FiCheck, FiMenu } from 'react-icons/fi';
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

export default function Navbar({ onMenuClick }) {
  const searchParams = useSearchParams();
  const currentChannel = searchParams.get('channel') || 'general';
  const { activeWorkspace } = useWorkspace();
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
    <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-slate-900 border-b border-slate-800 shadow-sm z-10 w-full shrink-0">
      {/* Channel Title */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button aria-label="Toggle sidebar menu" className="md:hidden text-slate-400 hover:text-white transition-colors" onClick={onMenuClick}>
            <FiMenu className="w-5 h-5" />
          </button>
        )}
        <h2 className="font-bold text-lg text-white flex items-center gap-1.5 min-w-0">
          <span className="text-slate-500 text-xl shrink-0">#</span> 
          <span className="truncate">{currentChannel}</span>
        </h2>
        <span className="hidden sm:inline-block bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-md font-medium border border-slate-700 whitespace-nowrap">Team-wide discussion</span>
      </div>

      {/* Center Search */}
      <div className="flex-1 max-w-2xl mx-6 hidden md:block">
        <div className="relative group">
          <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isSearchFocused ? 'text-indigo-400' : 'text-slate-400 group-focus-within:text-indigo-400'}`} />
          <input 
            type="text" 
            placeholder="Search messages and tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            aria-label="Search"
            className="w-full bg-slate-950/50 border border-slate-700/50 text-sm text-slate-200 rounded-md pl-9 pr-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner placeholder:text-slate-500"
          />
          
          {/* Search Results Dropdown */}
          {isSearchFocused && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700/80 rounded-lg shadow-xl overflow-hidden py-2 z-50">
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Found {searchResults.length} results
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="px-4 py-8 text-center text-slate-500">No matching results found layout.</div>
                ) : (
                  searchResults.map((result, idx) => (
                    <div key={idx} className="px-4 py-3 hover:bg-slate-800/80 cursor-pointer border-b border-slate-800/40 last:border-0 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${result.type === 'message' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {result.type}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {result.type === 'message' ? `in #${result.channel}` : `• ${result.status}`}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-200 truncate">{result.content}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {result.type === 'message' ? `From ` : `Assigned to `}
                        <span className="text-slate-300 font-medium">{result.sender || result.assignee}</span>
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button 
          onClick={handleCopyInvite}
          aria-label="Copy invite link"
          className="flex items-center gap-2 overflow-hidden text-sm font-medium px-3 py-1.5 rounded-md transition-all border border-slate-700 lg:hover:border-indigo-500/50 lg:hover:bg-indigo-500/10 text-slate-300 relative"
        >
          {copied ? (
            <>
              <FiCheck className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <FiUserPlus className="w-4 h-4 text-indigo-400" />
              <span>Invite</span>
            </>
          )}
        </button>
        <button aria-label="Open inbox" className="text-slate-400 hover:text-slate-200 transition-colors p-1.5 lg:hover:bg-slate-800 rounded-md">
          <FiInbox className="w-5 h-5" />
        </button>
        <Dialog>
          <DialogTrigger aria-label="Help and shortcuts" className="text-slate-400 hover:text-slate-200 transition-colors p-1.5 lg:hover:bg-slate-800 rounded-md cursor-pointer flex items-center justify-center">
            <FiHelpCircle className="w-5 h-5" />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white border-slate-800">
            <DialogHeader>
              <DialogTitle>Nexuspace Help</DialogTitle>
              <DialogDescription className="text-slate-400">
                Quick guides and keyboard shortcuts to navigate faster.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <h4 className="font-semibold mb-2">Keyboard Shortcuts</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex justify-between items-center bg-slate-800/50 p-2 rounded">
                    <span>New Line</span>
                    <kbd className="bg-slate-700 px-2 py-1 rounded text-xs font-mono">Shift + Enter</kbd>
                  </li>
                  <li className="flex justify-between items-center bg-slate-800/50 p-2 rounded">
                    <span>Send Message</span>
                    <kbd className="bg-slate-700 px-2 py-1 rounded text-xs font-mono">Enter</kbd>
                  </li>
                  <li className="flex justify-between items-center bg-slate-800/50 p-2 rounded">
                    <span>Mention Member</span>
                    <kbd className="bg-slate-700 px-2 py-1 rounded text-xs font-mono">@</kbd>
                  </li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
