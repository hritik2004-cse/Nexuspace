"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiSmile, FiX, FiCheck, FiBookmark } from 'react-icons/fi';
import ProfileModal from './ProfileModal';

export default function MessageBubble({ message, isOwnMessage, onDelete, onEdit, onReact, onPin }) {
  const [mounted, setMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const { user } = useAuth();
  useEffect(() => setMounted(true), []);

  // Format the time securely only after mounting locally to avoid SSR hydration mismatch
  const timeString = mounted ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  const handleEditSubmit = () => {
    if (editContent.trim()) {
      onEdit(editContent);
      setIsEditing(false);
    }
  };

  const commonReactions = ['👍', '❤️', '😂', '🎉'];

  if (message.isSystem) {
    return (
      <div className="flex justify-center w-full mb-6">
        <div className="bg-slate-800/40 border border-slate-700/50 text-slate-400 text-xs font-medium px-4 py-1.5 rounded-full backdrop-blur-sm shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex w-full mb-6 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[75%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} gap-3 group`}>
        {/* Avatar */}
        <div className="shrink-0 mt-1 relative cursor-pointer w-9 h-9" onClick={() => !isOwnMessage && setIsProfileOpen(true)}>
          { (isOwnMessage ? (user?.avatar || user?.profileImage) : (message.senderDetails?.avatar || message.senderDetails?.profileImage)) ? (
            <img 
              src={isOwnMessage ? (user?.avatar || user?.profileImage) : (message.senderDetails?.avatar || message.senderDetails?.profileImage)} 
              alt="Avatar" 
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover shadow outline-2 outline-slate-900 cursor-pointer hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow outline-2 outline-slate-900 cursor-pointer hover:scale-105 transition-transform">
              {message.sender.charAt(0).toUpperCase()}
            </div>
          )}
          {/* Online indicator dot for everyone for now (mocked based on data later) */}
          <div className={`absolute bottom-0 ${isOwnMessage ? 'left-0' : 'right-0'} w-2.5 h-2.5 bg-green-500 border-2 border-slate-950 rounded-full`}></div>
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          {/* Sender & Timestamp */}
          <div className={`flex items-baseline gap-2 mb-1 px-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-sm font-semibold text-slate-200 flex items-center justify-center gap-1.5 hover:underline decoration-slate-500 underline-offset-2">
              {message.sender}
              <span className="bg-indigo-500/20 text-indigo-400 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm tracking-wider uppercase">
                {isOwnMessage ? (user?.customTitle || 'Member') : (message.senderDetails?.customTitle || 'Member')}
              </span>
            </span>
            <span className="text-xs text-slate-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">{timeString}</span>
          </div>
          
          {/* Bubble & Actions Wrapper */}
          <div className={`relative flex items-center gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} max-w-full mt-2`}>
            
            {message.isPinned && (
              <div className={`absolute -top-4 -right-2 bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1 z-10 
              ${isOwnMessage ? '-left-2 right-auto' : '-right-2'}`}>
                <FiBookmark className="w-2.5 h-2.5" /> Pinned
              </div>
            )}

            {/* Bubble */}
            <div 
              className={`px-4 py-2.5 rounded-2xl shadow-sm text-[15px] leading-relaxed relative whitespace-pre-wrap ${
                isOwnMessage 
                  ? 'bg-indigo-600 text-white rounded-tr-sm bg-linear-to-br from-indigo-500 to-indigo-600 border border-indigo-400/20' 
                  : 'bg-slate-800 text-slate-100 rounded-tl-sm border border-slate-700/50'
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
                    className="w-full bg-black/20 text-white p-2 rounded text-sm resize-none focus:outline-none focus:ring-1 focus:ring-white/50"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setIsEditing(false)} className="text-xs hover:text-white/80"><FiX /></button>
                    <button onClick={handleEditSubmit} className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30"><FiCheck /></button>
                  </div>
                </div>
              ) : (
                <>{message.content}</>
              )}
            </div>

            {/* Hover Actions Menu */}
            {!isEditing && (
              <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-1 gap-1 absolute top-0 ${isOwnMessage ? 'right-full mr-2' : 'left-full ml-2'} z-10`}>
                <div className="group/react relative">
                  <div role="button" tabIndex={0} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded transition-colors tooltip-trigger cursor-pointer">
                    <FiSmile className="w-4 h-4" />
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1 opacity-0 group-hover/react:opacity-100 scale-95 group-hover/react:scale-100 transition-all pointer-events-none group-hover/react:pointer-events-auto z-20">
                    <div className="bg-slate-800 border border-slate-700 rounded-full shadow-xl p-1 flex gap-1 relative before:content-[''] before:absolute before:-top-2 before:left-0 before:w-full before:h-2">
                      {commonReactions.map(emoji => (
                        <div role="button" tabIndex={0} key={emoji} onClick={() => onReact(emoji)} className="hover:bg-slate-700 rounded-full p-1 text-lg leading-none transition-transform hover:scale-110 cursor-pointer">
                          {emoji}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {isOwnMessage && (
                  <>
                    <button onClick={() => setIsEditing(true)} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded transition-colors">
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                {user?.role === 'Admin' && (
                  <button onClick={onPin} className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-700 rounded transition-colors">
                    <FiBookmark className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Reactions Display */}
          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className={`flex gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              {Object.entries(message.reactions).map(([reaction, users]) => (
                <div key={reaction} className="bg-slate-800/80 border border-slate-700/50 rounded-full px-2 py-0.5 text-[11px] flex items-center gap-1 cursor-pointer hover:bg-slate-700 transition-colors" onClick={() => onReact(reaction)}>
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
            viewUser={{ name: message.sender, username: message.sender.toLowerCase(), isOnline: true }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
