"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCheck } from 'react-icons/fi';
import { Bell } from 'lucide-react';
import api from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function InboxModal({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {}
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {}
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
        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
        className="relative bg-slate-900 border border-slate-700/60 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="text-lg font-black text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">
              Inbox
            </h2>
            {unreadCount > 0 && (
              <Badge className="bg-indigo-600/20 text-indigo-400 border-indigo-500/30 text-xs font-bold">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg"
              >
                <FiCheck className="w-3 h-3" /> Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        <Separator className="opacity-20" />

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-700 bg-slate-950/50">
          {loading ? (
            // Proper shadcn skeleton rows — much nicer than a spinner
            <div className="space-y-1 p-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 p-3">
                  <Skeleton className="w-10 h-10 rounded-full bg-white/6 shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <Skeleton className="h-3 rounded-full bg-white/6" style={{ width: `${55 + (i * 17) % 35}%` }} />
                    <Skeleton className="h-3 rounded-full bg-white/6" style={{ width: `${40 + (i * 23) % 45}%` }} />
                    <Skeleton className="h-2.5 rounded-full bg-white/6 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-slate-500 space-y-3">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center shadow-inner">
                <span className="text-2xl">🎉</span>
              </div>
              <p className="font-bold text-slate-400">You're all caught up!</p>
              <p className="text-xs text-slate-600">No new mentions or notifications.</p>
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {notifications.map(notif => (
                <div
                  key={notif._id}
                  className={`flex gap-3 p-3 rounded-xl transition-all group ${
                    notif.isRead
                      ? 'opacity-60 hover:opacity-100 hover:bg-slate-900/60'
                      : 'bg-slate-900 border border-slate-700/50 shadow-md'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0 pt-0.5">
                    {notif.senderDetails?.avatar ? (
                      <img
                        src={notif.senderDetails.avatar}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-800"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow">
                        {notif.senderDetails?.name?.charAt(0).toUpperCase() || '@'}
                      </div>
                    )}
                    {!notif.isRead && (
                      <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-indigo-500 border-2 border-slate-900 rounded-full" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 leading-snug">
                      {notif.type === 'mention' ? (
                        <>
                          <span className="text-indigo-400">@{notif.senderDetails?.name}</span>
                          {' '}mentioned you
                        </>
                      ) : notif.type}
                    </p>
                    <p className="text-sm text-slate-400 mt-0.5 truncate leading-snug">{notif.content}</p>
                    <p className="text-[11px] text-slate-600 mt-1.5 font-medium">
                      {new Date(notif.createdAt).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Mark-read button */}
                  {!notif.isRead && (
                    <button
                      onClick={e => markAsRead(notif._id, e)}
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all self-center opacity-0 group-hover:opacity-100"
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
