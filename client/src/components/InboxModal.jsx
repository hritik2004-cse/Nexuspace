"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCheck } from 'react-icons/fi';
import api from '@/services/api';

export default function InboxModal({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose} 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
        className="relative bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-sans text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">Your Inbox</h2>
            {unreadCount > 0 && (
              <span className="bg-indigo-600/20 text-indigo-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-md">
                <FiCheck /> Mark all read
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg transition-colors">
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-700 bg-slate-950/50">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-3">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎉</span>
              </div>
              <p className="font-medium text-slate-400">You're all caught up!</p>
              <p className="text-xs">No new mentions or notifications.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map(notif => (
                <div 
                  key={notif._id} 
                  className={`flex gap-3 p-3 rounded-xl transition-all ${notif.isRead ? 'opacity-70 hover:opacity-100 hover:bg-slate-900' : 'bg-slate-900 border border-slate-700 shadow-md'}`}
                >
                  <div className="relative shrink-0 pt-1">
                    {notif.senderDetails?.avatar ? (
                      <img src={notif.senderDetails.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover outline-2 outline-slate-800" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {notif.senderDetails?.name?.charAt(0).toUpperCase() || '@'}
                      </div>
                    )}
                    {!notif.isRead && <div className="absolute top-1 right-0 w-2.5 h-2.5 bg-indigo-500 border-2 border-slate-900 rounded-full"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200">
                      {notif.type === 'mention' ? (
                        <>
                          <span className="text-indigo-400">@{notif.senderDetails?.name}</span> mentioned you
                        </>
                      ) : notif.type}
                    </p>
                    <p className="text-sm text-slate-300 mt-0.5 truncate">{notif.content}</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{new Date(notif.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                  </div>
                  {!notif.isRead && (
                    <button 
                      onClick={(e) => markAsRead(notif._id, e)}
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors self-center"
                      title="Mark as read"
                    >
                      <FiCheck className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
