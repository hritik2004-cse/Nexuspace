"use client";

import { useState, useRef, useEffect } from 'react';
import { FiSend, FiPaperclip, FiSmile, FiX, FiFile } from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';

import { toast } from 'react-toastify';

export default function MessageInput({ onSendMessage, socket, channelId, channelName, currentUser }) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [pickerHeight, setPickerHeight] = useState(400);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPickerHeight(window.innerWidth < 640 ? 300 : 400);
    }
  }, []);

  // Mocked channel members for mentions
  const members = ['gaurav', 'lavkesh', 'ash', 'hritik'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() || attachment) {
      onSendMessage(text, attachment);
      setText('');
      setAttachment(null);
      setShowEmoji(false);
      
      if (socket && channelId) {
        socket.emit('stop_typing', { channelId });
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size exceeds 2MB limit. Please attach a smaller file.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setAttachment({ name: file.name, url: reader.result, type: file.type });
      reader.readAsDataURL(file);
    }
  };

  const onEmojiClick = (emojiObj) => {
    setText((prev) => prev + emojiObj.emoji);
    setShowEmoji(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);
    
    if (socket && channelId) {
      socket.emit('typing', { channelId, username: currentUser?.username || currentUser?.name || 'Unknown' });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { channelId });
      }, 2000);
    }

    // Naive mention detection
    if (val.endsWith('@')) {
      setShowMentions(true);
    } else if (!val.includes('@')) {
      setShowMentions(false);
    }
  };

  const handleMention = (username) => {
    setText((prev) => prev.substring(0, prev.lastIndexOf('@') + 1) + username + ' ');
    setShowMentions(false);
  };

  return (
    <div className="p-4 bg-transparent relative z-20">
      {/* Mentions Popover */}
      {showMentions && (
        <div className="absolute bottom-full left-4 mb-2 w-48 bg-sidebar/90 backdrop-blur-xl border border-border rounded-lg shadow-2xl py-2 z-50">
          <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase">Members</div>
          {members.map(member => (
            <button 
              key={member}
              type="button"
              onClick={() => handleMention(member)}
              className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-primary/20 hover:text-white transition-colors"
            >
              @{member}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmoji && (
        <div className="absolute bottom-full right-2 sm:right-4 mb-2 z-50 shadow-2xl rounded-xl overflow-hidden border border-border/50">
          <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" lazyLoadEmojis={true} height={pickerHeight} />
        </div>
      )}

      {/* Attachment Preview */}
      {attachment && (
        <div className="mb-3 flex items-center gap-3 p-3 bg-white/5 backdrop-blur-md rounded-lg border border-border/50 w-fit relative group">
          {attachment.type.startsWith('image/') ? (
            <img src={attachment.url} alt="preview" className="w-16 h-16 object-cover rounded shadow" />
          ) : (
            <div className="w-16 h-16 flex items-center justify-center bg-white/10 rounded shadow text-slate-300">
              <FiFile className="w-8 h-8" />
            </div>
          )}
          <div className="text-sm text-slate-300 font-medium">{attachment.name}</div>
          <button 
            type="button" 
            onClick={() => setAttachment(null)} 
            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-400 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <FiX className="w-3 h-3" />
          </button>
        </div>
      )}

      <form 
        onSubmit={handleSubmit}
        className="flex flex-row items-end bg-white/5 backdrop-blur-md rounded-xl border border-border p-1.5 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all shadow-lg"
      >
        <div className="flex shrink-0 px-2 pb-1.5 gap-2 text-slate-400">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="hover:text-primary transition-colors p-1 rounded-md hover:bg-white/5"
          >
            <FiPaperclip className="w-5 h-5"/>
          </button>
        </div>
        <textarea
          value={text}
          onChange={handleChange}
          placeholder={`Message #${channelName || 'general'}`}
          className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 max-h-32 min-h-[40px] px-2 py-2 resize-none focus:outline-none focus:ring-0 leading-relaxed font-sans w-full"
          rows={1}
          onKeyDown={handleKeyDown}
        />
        <div className="flex shrink-0 items-center px-1 pb-1 gap-1">
          <button 
            type="button" 
            onClick={() => setShowEmoji(!showEmoji)}
            className={`text-slate-400 hover:text-primary transition-colors p-1 ${showEmoji ? 'text-primary' : ''}`}
          >
            <FiSmile className="w-5 h-5" />
          </button>
          <button 
            type="submit" 
            disabled={!text.trim() && !attachment}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary hover:opacity-90 disabled:bg-white/5 disabled:text-slate-600 text-white transition-all shadow-md group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <FiSend className="w-4 h-4 relative z-10 -ml-0.5 mt-0.5" />
          </button>
        </div>
      </form>
      <div className="px-4 py-2 flex justify-between">
        <p className="text-[11px] text-slate-500 font-medium tracking-tight"><strong>Shift + Enter</strong> to add a new line</p>
      </div>
    </div>
  );
}
