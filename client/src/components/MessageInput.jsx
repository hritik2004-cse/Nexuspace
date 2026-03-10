"use client";

import { useState, useRef, useEffect } from 'react';
import { FiSend, FiPaperclip, FiSmile, FiX, FiFile } from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';

export default function MessageInput({ onSendMessage }) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);

  // Mocked channel members for mentions
  const members = ['gaurav', 'lavkesh', 'ash', 'hritik'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() || attachment) {
      onSendMessage(text, attachment);
      setText('');
      setAttachment(null);
      setShowEmoji(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
    <div className="p-4 bg-slate-900 border-t border-slate-800 shadow-xl relative">
      {/* Mentions Popover */}
      {showMentions && (
        <div className="absolute bottom-full left-4 mb-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl py-2 z-50">
          <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase">Members</div>
          {members.map(member => (
            <button 
              key={member}
              type="button"
              onClick={() => handleMention(member)}
              className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              @{member}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmoji && (
        <div className="absolute bottom-full right-2 sm:right-4 mb-2 z-50 shadow-2xl rounded-xl overflow-hidden border border-slate-700/50">
          <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" lazyLoadEmojis={true} height={350} />
        </div>
      )}

      {/* Attachment Preview */}
      {attachment && (
        <div className="mb-3 flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 w-fit relative group">
          {attachment.type.startsWith('image/') ? (
            <img src={attachment.url} alt="preview" className="w-16 h-16 object-cover rounded shadow" />
          ) : (
            <div className="w-16 h-16 flex items-center justify-center bg-slate-700 rounded shadow text-slate-300">
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
        className="flex flex-row items-end bg-slate-800 rounded-xl border border-slate-700 p-1.5 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all shadow-sm"
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
            className="hover:text-indigo-400 transition-colors p-1 rounded-md hover:bg-slate-700/50"
          >
            <FiPaperclip className="w-5 h-5"/>
          </button>
        </div>
        <textarea
          value={text}
          onChange={handleChange}
          placeholder="Message #general"
          className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 max-h-32 min-h-[40px] px-2 py-2 resize-none focus:outline-none focus:ring-0 leading-relaxed font-sans w-full"
          rows={1}
          onKeyDown={handleKeyDown}
        />
        <div className="flex shrink-0 items-center px-1 pb-1 gap-1">
          <button 
            type="button" 
            onClick={() => setShowEmoji(!showEmoji)}
            className={`text-slate-400 hover:text-indigo-400 transition-colors p-1 ${showEmoji ? 'text-indigo-400' : ''}`}
          >
            <FiSmile className="w-5 h-5" />
          </button>
          <button 
            type="submit" 
            disabled={!text.trim() && !attachment}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white transition-all shadow-md group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <FiSend className="w-4 h-4 relative z-10 -ml-0.5 mt-0.5" />
          </button>
        </div>
      </form>
      <div className="px-4 py-2 flex justify-between">
        <p className="text-[11px] text-slate-500 font-medium"><strong>Shift + Enter</strong> to add a new line</p>
      </div>
    </div>
  );
}
