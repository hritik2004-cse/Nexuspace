"use client";

import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { useSocket } from '@/context/SocketContext';
import { FiBookmark } from 'react-icons/fi';

export default function ChatWindow({ messages, onSendMessage, onDeleteMessage, onEditMessage, onReactToMessage, onPinMessage, currentUser, socket, channelId }) {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const pinnedMessages = messages.filter(m => m.isPinned);

  return (
    <div className="flex flex-col h-full bg-slate-900 absolute inset-0">
      {/* Pinned Messages Banner */}
      {pinnedMessages.length > 0 && (
        <div className="bg-slate-800/80 border-b border-slate-700 p-3 shadow-sm z-20 sticky top-0 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2 mb-2 px-2">
            <FiBookmark className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Pinned</h3>
            <span className="bg-amber-500/20 text-amber-500 text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none">{pinnedMessages.length}</span>
          </div>
          <div className="max-h-24 overflow-y-auto pr-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-600">
            {pinnedMessages.map(msg => (
              <div key={msg.id || msg._id} className="text-sm text-slate-300 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-700/50 truncate cursor-pointer hover:bg-slate-800 transition-colors">
                <span className="font-semibold text-slate-400 mr-2">{msg.sender}:</span> 
                {msg.content}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scrollable Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center shadow-inner">
              <span className="text-3xl">👋</span>
            </div>
            <p className="font-medium text-lg">Welcome to the beginning of the channel.</p>
            <p className="text-sm">This is the start of your workspace history.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <MessageBubble 
              key={msg.id || msg._id || idx} 
              message={msg} 
              isOwnMessage={msg.sender === currentUser} 
              onDelete={() => onDeleteMessage && onDeleteMessage(msg.id || msg._id)}
              onEdit={(newContent) => onEditMessage && onEditMessage(msg.id || msg._id, newContent)}
              onReact={(reaction) => onReactToMessage && onReactToMessage(msg.id || msg._id, reaction)}
              onPin={() => onPinMessage && onPinMessage(msg.id || msg._id)}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Message Input fixed at bottom of container */}
      <div className="mt-auto z-10">
        <MessageInput onSendMessage={onSendMessage} socket={socket} channelId={channelId} currentUser={currentUser} />
      </div>
    </div>
  );
}
