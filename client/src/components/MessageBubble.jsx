"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiSmile, FiX, FiCheck, FiBookmark, FiCornerUpLeft, FiShield, FiAlertTriangle } from 'react-icons/fi';
import ProfileModal from './ProfileModal';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function MessageBubble({ message, isOwnMessage, onDelete, onEdit, onReact, onPin, onReply, currentUser }) {
  const [mounted, setMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const { user } = useAuth();

  useEffect(() => setMounted(true), []);

  // Sync editContent if message is updated via socket while not editing
  useEffect(() => {
    if (!isEditing) {
      setEditContent(message.content);
    }
  }, [message.content, isEditing]);

  // Format the time securely only after mounting locally to avoid SSR hydration mismatch
  const dateToFormat = message.createdAt || message.timestamp;
  const timeString = mounted && dateToFormat && !isNaN(new Date(dateToFormat).getTime()) 
    ? new Date(dateToFormat).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : '';

  const handleEditSubmit = () => {
    if (editContent.trim() && editContent.trim() !== message.content) {
      onEdit(editContent.trim());
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(message.content);
    }
  };

  const canDelete = isOwnMessage || user?.role === 'Admin';

  const commonReactions = ['👍', '❤️', '😂', '🎉'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex w-full mb-6 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
      style={{ touchAction: 'pan-y' }}
    >
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} gap-3 group relative`}>
        {/* Avatar */}
        <div 
          className="shrink-0 mt-1 relative cursor-pointer w-9 h-9 z-10" 
          onClick={() => setIsProfileOpen(true)}
        >
          { (isOwnMessage ? (user?.avatar || user?.profileImage) : (message.senderDetails?.avatar || message.senderDetails?.profileImage)) ? (
            <img 
              src={isOwnMessage ? (user?.avatar || user?.profileImage) : (message.senderDetails?.avatar || message.senderDetails?.profileImage)} 
              alt="Avatar" 
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover shadow outline-2 outline-background cursor-pointer lg:hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-linear-to-tr from-primary to-primary/60 flex items-center justify-center text-white font-bold text-sm shadow outline-2 outline-background cursor-pointer lg:hover:scale-105 transition-transform">
              {message.sender.charAt(0).toUpperCase()}
            </div>
          )}
          {/* Online indicator dot */}
          <div className={`absolute bottom-0 ${isOwnMessage ? 'left-0' : 'right-0'} w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full`}></div>
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} min-w-0`}>
          {/* Reply Preview */}
          {message.replyTo && (
            <div className={`flex items-center gap-2 mb-1 px-3 py-1 bg-white/5 border-l-2 border-primary rounded-r-lg max-w-full opacity-80 lg:hover:opacity-100 transition-opacity cursor-pointer`}>
              <FiCornerUpLeft className="w-3 h-3 text-slate-500" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black text-primary uppercase tracking-tighter">
                  {message.replyTo.sender?.name || message.replyTo.sender?.username}
                </span>
                <span className="text-[11px] text-slate-400 truncate leading-tight">
                  {message.replyTo.content}
                </span>
              </div>
            </div>
          )}
          {/* Sender & Timestamp */}
          <div className={`flex items-baseline gap-2 mb-1 px-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} max-w-full`}>
            <span 
              onClick={() => setIsProfileOpen(true)}
              className="text-sm font-semibold text-slate-200 flex items-center justify-center gap-1.5 lg:hover:underline decoration-slate-500 underline-offset-2 cursor-pointer truncate"
            >
              {message.sender}
              {(isOwnMessage ? (user?.role === 'Admin' || user?.role === 'Owner') : (message.senderDetails?.role === 'Admin' || message.senderDetails?.role === 'Owner')) && (
                <FiShield className="w-3 h-3 text-primary shrink-0" title="Admin" />
              )}
              <span className="bg-primary/20 text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm tracking-wider uppercase border border-primary/30 shrink-0">
                {isOwnMessage ? (user?.customTitle || 'Member') : (message.senderDetails?.customTitle || 'Member')}
              </span>
            </span>
            {timeString && (
              <span className="text-xs text-slate-500 font-medium opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-200 shrink-0">
                {timeString}
              </span>
            )}
          </div>
          
          {/* Bubble & Actions Wrapper */}
          <div className={`relative flex items-center gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} max-w-full mt-1.5`}>
            
            {message.isPinned && (
              <div className={`absolute -top-4 bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1 z-10 
                ${isOwnMessage ? '-left-2' : '-right-2'}`}>
                <FiBookmark className="w-2.5 h-2.5" /> Pinned
              </div>
            )}

            {/* Bubble */}
            <div 
              className={`px-4 py-2.5 rounded-2xl shadow-sm text-[15px] leading-relaxed relative whitespace-pre-wrap wrap-break-word min-w-0 ${
                isOwnMessage 
                  ? 'bg-primary text-white rounded-tr-sm bg-linear-to-br from-primary to-primary/80 border border-white/10 shadow-[0_4px_15px_rgba(var(--primary-rgb),0.3)]' 
                  : 'bg-white/5 text-slate-100 rounded-tl-sm border border-white/5'
              }`}
            >
              {message.attachment && (
                <div className="mb-2 rounded overflow-hidden">
                  {message.attachment.type?.startsWith('image/') ? (
                    <img src={message.attachment.url} alt="attachment" className="max-w-full h-auto max-h-48 object-cover rounded" />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-black/20 rounded text-sm">
                      <span>📄</span> {message.attachment.name}
                    </div>
                  )}
                </div>
              )}

              {isEditing ? (
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    className="w-full bg-black/20 text-white p-2 rounded text-sm resize-none focus:outline-none focus:ring-1 focus:ring-white/50"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-white/60 font-medium tracking-tight">Enter to save · Esc to cancel</span>
                    <div className="flex gap-2">
                      <button onClick={() => { setIsEditing(false); setEditContent(message.content); }} className="text-xs hover:text-white/80"><FiX /></button>
                      <button onClick={handleEditSubmit} className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30"><FiCheck /></button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {message.content}
                  {message.isEdited && (
                    <span className="text-[10px] text-white/60 ml-2 italic">(edited)</span>
                  )}
                </>
              )}
            </div>

            {/* Actions Menu - Visible on hover (desktop) or active (mobile tap) */}
            {!isEditing && (
              <div className={`opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-all duration-200 flex items-center bg-surface-hover/95 backdrop-blur-md border border-white/10 rounded-lg shadow-xl p-0.5 md:p-1 gap-0.5 md:gap-1 absolute bottom-full mb-1 ${isOwnMessage ? 'right-0' : 'left-0'} md:top-0 md:bottom-auto ${isOwnMessage ? 'md:right-full md:mr-2 md:left-auto' : 'md:left-full md:ml-2 md:right-auto'} z-20`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={onReply} className="p-1.5 text-slate-400 lg:hover:text-primary lg:hover:bg-white/5 rounded transition-colors">
                      <FiCornerUpLeft className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Reply</TooltipContent>
                </Tooltip>

                <div className="group/react relative">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div role="button" tabIndex={0} className="p-1.5 text-slate-400 lg:hover:text-primary lg:hover:bg-white/5 rounded transition-colors tooltip-trigger cursor-pointer">
                        <FiSmile className="w-4 h-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">React</TooltipContent>
                  </Tooltip>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-1 md:pb-0 md:top-full opacity-0 group-hover/react:opacity-100 scale-95 group-hover/react:scale-100 transition-all pointer-events-none group-hover/react:pointer-events-auto z-20">
                    <div className="bg-surface-hover border border-white/10 rounded-full shadow-xl p-1 flex gap-1 relative before:content-[''] before:absolute before:-top-2 before:left-0 before:w-full before:h-2">
                      {commonReactions.map(emoji => (
                        <div role="button" tabIndex={0} key={emoji} onClick={() => onReact(emoji)} className="lg:hover:bg-white/5 rounded-full p-1 text-lg leading-none transition-transform lg:hover:scale-110 cursor-pointer">
                          {emoji}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {isOwnMessage && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={() => setIsEditing(true)} className="p-1.5 text-slate-400 lg:hover:text-primary lg:hover:bg-white/5 rounded transition-colors">
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Edit</TooltipContent>
                    </Tooltip>
                  </>
                )}

                {canDelete && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => setIsDeleteDialogOpen(true)} className="p-1.5 text-slate-400 lg:hover:text-red-400 lg:hover:bg-white/5 rounded transition-colors">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Delete</TooltipContent>
                  </Tooltip>
                )}

                {user?.role === 'Admin' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={onPin} className="p-1.5 text-slate-400 lg:hover:text-amber-400 lg:hover:bg-white/5 rounded transition-colors">
                        <FiBookmark className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">{message.isPinned ? 'Unpin' : 'Pin'}</TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}
          </div>

          {/* Reactions Display */}
          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className={`flex gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              {Object.entries(message.reactions).map(([reaction, users]) => (
                <div key={reaction} className="bg-surface-hover border border-white/5 rounded-full px-2 py-0.5 text-[11px] flex items-center gap-1 cursor-pointer lg:hover:bg-white/10 transition-colors" onClick={() => onReact(reaction)}>
                  <span>{reaction}</span>
                  <span className="text-slate-400 font-medium">{users.length}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {isProfileOpen && (
          <ProfileModal 
            isOpen={isProfileOpen} 
            onClose={() => setIsProfileOpen(false)} 
            viewUser={isOwnMessage ? null : message.senderDetails}
          />
        )}
      </AnimatePresence>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-surface border-white/10 rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
              <FiAlertTriangle className="text-red-500" /> Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-slate-400 pt-2">
              Are you sure you want to delete this message? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 mt-6">
            <Button 
              variant="ghost" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => { onDelete(); setIsDeleteDialogOpen(false); }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

