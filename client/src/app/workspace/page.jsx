"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import ChatWindow from '@/components/ChatWindow';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';

export default function WorkspacePage() {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const currentChannel = searchParams.get('channel') || 'general';
  
  const currentUser = user?.username || user?.name || "User"; 
  
  const [messages, setMessages] = useState([]);
  const [channelId, setChannelId] = useState(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Fetch Channel and Messages
  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        const token = localStorage.getItem('nexuspace_token');
        if (!token) return;

        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // 1. Get or Create Channel by Name
        const channelRes = await axios.post(`${API_URL}/channels/findOrCreate`, { name: currentChannel }, config);
        setChannelId(channelRes.data._id);

        // 2. Fetch Messages for this Channel
        const msgRes = await axios.get(`${API_URL}/messages/${channelRes.data._id}`, config);
        // Map backend sender object to string format matching the frontend for now
        const parsedMessages = msgRes.data.map(m => ({
          ...m,
          id: m._id,
          sender: m.sender?.username || m.sender?.name || 'Unknown',
          senderDetails: m.sender
        }));
        
        setMessages(parsedMessages);
      } catch (error) {
        console.error("Error fetching channel data:", error);
      }
    };

    fetchChannelData();
  }, [currentChannel]);

  // Handle Real-time Socket Events
  useEffect(() => {
    if (!socket || !channelId) return;
    
    // Join the current room using the actual Mongo ID
    socket.emit('join_channel', channelId);

    const handleNewMessage = (newMessage) => {
      const formatted = {
        ...newMessage,
        id: newMessage._id,
        sender: newMessage.sender?.username || newMessage.sender?.name || 'Unknown',
        senderDetails: newMessage.sender
      };
      setMessages((prev) => [...prev, formatted]);
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

    socket.on('receive_message', handleNewMessage);
    socket.on('reaction_updated', handleReaction);
    socket.on('message_pinned', handlePinState);

    return () => {
      socket.emit('leave_channel', channelId);
      socket.off('receive_message', handleNewMessage);
      socket.off('reaction_updated', handleReaction);
      socket.off('message_pinned', handlePinState);
    };
  }, [socket, channelId]);

  const handleSendMessage = async (content, attachment = null) => {
    if (!channelId) return;

    try {
      const token = localStorage.getItem('nexuspace_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const payload = {
        content,
        channelId,
        attachments: attachment ? [attachment] : []
      };

      // The backend posts it to DB, then socket broadcasts it to others
      const res = await axios.post(`${API_URL}/messages`, payload, config);
      
      const formatted = {
        ...res.data,
        id: res.data._id,
        sender: res.data.sender?.username || res.data.sender?.name || 'Unknown',
        senderDetails: res.data.sender
      };

      // Add locally for the sender
      setMessages((prev) => [...prev, formatted]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleDeleteMessage = (id) => {
    setMessages((prev) => prev.filter(m => m.id !== id));
  };

  const handleEditMessage = (id, newContent) => {
    setMessages((prev) => prev.map(m => m.id === id ? { ...m, content: newContent } : m));
  };

  const handleReactToMessage = async (id, emoji) => {
    try {
      const token = localStorage.getItem('nexuspace_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await axios.put(`${API_URL}/messages/${id}/react`, { emoji }, config);
      
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
      console.error("Error reacting to message:", error);
    }
  };

  const handlePinMessage = async (id) => {
    try {
      const token = localStorage.getItem('nexuspace_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await axios.put(`${API_URL}/messages/${id}/pin`, {}, config);
      
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
      console.error("Error pinning message:", error);
    }
  };

  // Ensure we only render messages that actually belong to the current fetch
  // (Filter logic isn't strictly needed anymore if fetching by Mongo ID, but safe)
  const channelMessages = messages;

  return (
    <ChatWindow 
      messages={channelMessages} 
      onSendMessage={handleSendMessage} 
      onDeleteMessage={handleDeleteMessage}
      onEditMessage={handleEditMessage}
      onReactToMessage={handleReactToMessage}
      onPinMessage={handlePinMessage}
      currentUser={currentUser} 
    />
  );
}
