"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/services/api';
import ChatWindow from '@/components/ChatWindow';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import PinModal from '@/components/PinModal';
import { toast } from 'react-toastify';

export default function WorkspacePage() {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const { activeWorkspace, setOnlineCount } = useWorkspace();
  const searchParams = useSearchParams();
  const currentChannel = searchParams.get('channel') || 'general';
  
  // Prioritize Name for Google Users as requested
  const currentUser = user?.name || user?.username || "User"; 
  
  const [messages, setMessages] = useState([]);
  const [channelId, setChannelId] = useState(null);
  
  // Real-time auxiliary states
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [notification, setNotification] = useState(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [lockedChannel, setLockedChannel] = useState(null);

  // Authenticate Socket connection
  useEffect(() => {
    if (socket && user?._id) {
      socket.emit('register_user', user._id);
    }
  }, [socket, user]);

  // Fetch Channel and Messages
  useEffect(() => {
    const fetchChannelData = async () => {
      if (!activeWorkspace) return;

      try {
        // 1. Get or Create Channel by Name bounded to Active Workspace
        const channelRes = await api.post('/channels/findOrCreate', { 
          name: currentChannel,
          workspaceId: activeWorkspace._id
        });
        setChannelId(channelRes.data._id);

        // 2. Fetch Messages for this Channel
        const msgRes = await api.get(`/messages/${channelRes.data._id}`);
        // Map backend sender object to string format matching the frontend for now
        const parsedMessages = msgRes.data.map(m => ({
          ...m,
          id: m._id,
          sender: m.sender?.name || m.sender?.username || 'Unknown',
          senderDetails: m.sender,
          replyTo: m.replyTo
        }));
        
        setMessages(parsedMessages);
        if (parsedMessages.length > 0) {
          toast.success("All caught up! Messages loaded.", { toastId: 'load-success' });
        }
      } catch (error) {
        if (error.response?.status === 403) {
          // Channel is private and no active session
          const returnedChannelId = error.response.data.channelId;
          setMessages([]);
          setLockedChannel({ id: returnedChannelId, name: currentChannel }); 
          setIsPinModalOpen(true);
        } else {
        }
      }
    };

    if (user && activeWorkspace) {
      fetchChannelData();
    }
  }, [currentChannel, user, activeWorkspace]);

  // Handle Real-time Socket Events
  useEffect(() => {
    if (!socket || !channelId || !isConnected) return;
    
    // Join the current room using the actual Mongo ID
    socket.emit('join_channel', channelId);

    const handleNewMessage = (newMessage) => {
      const formatted = {
        ...newMessage,
        id: newMessage._id,
        sender: newMessage.sender?.username || newMessage.sender?.name || 'Unknown',
        senderDetails: newMessage.sender
      };
      setMessages((prev) => {
        if (prev.some(m => m.id === formatted.id || m._id === formatted.id)) {
          return prev;
        }
        return [...prev, formatted];
      });
    };

    const handleReaction = (data) => {
      setMessages((prev) => prev.map(m => {
        if (m.id === data.messageId || m._id === data.messageId) {
          return { ...m, reactions: data.reactions };
        }
        return m;
      }));
    };

    const handlePinState = (data) => {
      setMessages((prev) => prev.map(m => {
        if (m.id === data.messageId || m._id === data.messageId) {
          return { ...m, isPinned: data.isPinned };
        }
        return m;
      }));
    };

    const handleDisplayTyping = (typingUser) => {
      setTypingUsers(prev => new Set(prev).add(typingUser));
    };

    const handleHideTyping = () => {
      // Simplistic clearing for demo
      setTypingUsers(new Set());
    };

    const handleNotification = (msg) => {
      setNotification(msg);
      setTimeout(() => setNotification(null), 4000);
    };

    const handleMessageDeleted = (data) => {
      setMessages((prev) => prev.filter(m => m.id !== data.messageId && m._id !== data.messageId));
    };

    const handleMessageEdited = (data) => {
      setMessages((prev) => prev.map(m =>
        (m.id === data.messageId || m._id === data.messageId)
          ? { ...m, content: data.content, isEdited: true }
          : m
      ));
    };

    socket.on('receive_message', handleNewMessage);
    socket.on('reaction_updated', handleReaction);
    socket.on('message_pinned', handlePinState);
    socket.on('display_typing', handleDisplayTyping);
    socket.on('hide_typing', handleHideTyping);
    socket.on('receive_notification', handleNotification);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('message_edited', handleMessageEdited);
    
    socket.on('channel_online_count', (count) => setOnlineCount(count));
    
    // Active Eviction handling
    socket.on('session_expired', (data) => {
      setMessages([]);
      setLockedChannel({ id: channelId, name: currentChannel });
      setIsPinModalOpen(true);
      if (data?.reason) {
        setNotification(`Access Revoked: ${data.reason}`);
      }
    });

    return () => {
      socket.emit('leave_channel', channelId);
      socket.off('receive_message', handleNewMessage);
      socket.off('reaction_updated', handleReaction);
      socket.off('message_pinned', handlePinState);
      socket.off('display_typing', handleDisplayTyping);
      socket.off('hide_typing', handleHideTyping);
      socket.off('receive_notification', handleNotification);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('message_edited', handleMessageEdited);
    };
  }, [socket, channelId, isConnected]);

  const handleSendMessage = async (content, attachment = null, replyToId = null) => {
    if (!channelId) return;

    try {
      const payload = {
        content,
        channelId,
        attachments: attachment ? [attachment] : [],
        replyTo: replyToId
      };

      // The backend posts it to DB, then socket broadcasts it to others
      const res = await api.post('/messages', payload);
      
      const formatted = {
        ...res.data,
        id: res.data._id,
        sender: res.data.sender?.name || res.data.sender?.username || 'Unknown',
        senderDetails: res.data.sender,
        replyTo: res.data.replyTo
      };

      // Add locally for the sender if the socket hasn't already added it
      setMessages((prev) => {
        if (prev.some(m => m.id === formatted.id || m._id === formatted.id)) {
          return prev;
        }
        return [...prev, formatted];
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "We couldn't send your message. Please try again in a moment.");
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      await api.delete(`/messages/${id}`);
      // Local removal is handled by the 'message_deleted' socket event
      // but we also remove locally immediately for snappy UX
      setMessages((prev) => prev.filter(m => m.id !== id && m._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "We couldn't delete this message. Please try again.");
    }
  };

  const handleEditMessage = async (id, newContent) => {
    try {
      await api.put(`/messages/${id}`, { content: newContent });
      // Local update is handled by the 'message_edited' socket event
      setMessages((prev) => prev.map(m => (m.id === id || m._id === id) ? { ...m, content: newContent, isEdited: true } : m));
    } catch (error) {
      toast.error(error.response?.data?.message || "We couldn't save your changes. Please try again.");
    }
  };

  const handleReactToMessage = async (id, emoji) => {
    try {
      const res = await api.put(`/messages/${id}/react`, { emoji });
      
      // Update locally
      setMessages((prev) => prev.map(m => {
        if (m.id === id || m._id === id) {
          return { ...m, reactions: res.data.reactions };
        }
        return m;
      }));

      // Broadcast reaction change via Socket
      if (socket && channelId) {
         socket.emit('update_reaction', {
           messageId: id,
           reactions: res.data.reactions,
           channelId
         });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "We couldn't add your reaction. Please try again.");
    }
  };

  const handlePinMessage = async (id) => {
    try {
      const res = await api.put(`/messages/${id}/pin`, {});
      
      // Update locally
      setMessages((prev) => prev.map(m => {
        if (m.id === id || m._id === id) {
          return { ...m, isPinned: res.data.isPinned };
        }
        return m;
      }));

      // Broadcast pin change via Socket
      if (socket && channelId) {
         socket.emit('pin_message', {
           messageId: id,
           isPinned: res.data.isPinned,
           channelId
         });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "We couldn't pin this message. Please try again.");
    }
  };

  // Ensure we only render messages that actually belong to the current fetch
  // (Filter logic isn't strictly needed anymore if fetching by Mongo ID, but safe)
  const channelMessages = messages;

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Toast Notification overlay */}
      {notification && (
        <div className="absolute top-4 right-4 z-50 bg-indigo-600/90 backdrop-blur-md text-white px-4 py-3 rounded-lg shadow-2xl animate-in slide-in-from-top-2 fade-in duration-300 flex items-center gap-3">
          <span className="text-xl">🔔</span>
          <p className="text-sm font-semibold">{notification}</p>
        </div>
      )}
      
      {/* Typing Indicator Top Banner */}
      {typingUsers.size > 0 && (
         <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-slate-800/80 backdrop-blur-md text-slate-300 px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg animate-pulse">
           {Array.from(typingUsers)[0]} is typing...
         </div>
      )}

      <ChatWindow 
        messages={channelMessages} 
        onSendMessage={handleSendMessage} 
        onDeleteMessage={handleDeleteMessage}
        onEditMessage={handleEditMessage}
        onReactToMessage={handleReactToMessage}
        onPinMessage={handlePinMessage}
        currentUser={user} 
        channelId={channelId}
        channelName={currentChannel}
        socket={socket}
      />
      
      <PinModal 
        isOpen={isPinModalOpen} 
        channelId={lockedChannel?.id || channelId} 
        channelName={lockedChannel?.name || currentChannel} 
        onSuccess={() => {
          setIsPinModalOpen(false);
          // Refetch messages to load the channel
          const event = new Event('submit'); // Dummy event just to trigger effect if we wanted to, but we can just call fetchChannelData logic
          window.location.reload(); // Simple approach to re-mount and re-fetch properly
        }} 
        onCancel={() => {
          setIsPinModalOpen(false);
          // Optionally redirect back to general channel
          window.location.href = `/workspace?workspace=${activeWorkspace._id}&channel=general`;
        }}
      />
    </div>
  );
}
