"use client";

import { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { useSocket } from '@/context/SocketContext';
import { FiUsers, FiX, FiMoreVertical, FiTrash2, FiLogOut, FiEdit3 } from 'react-icons/fi';
import { Crown, ShieldCheck, UserMinus, ArrowUp, ArrowDown, RefreshCw, AlertTriangle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import api from '@/services/api';
import { useWorkspace } from '@/context/WorkspaceContext';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";


export default function ChatWindow({ messages, onSendMessage, onDeleteMessage, onEditMessage, onReactToMessage, onPinMessage, currentUser, socket, channelId, channelName }) {
  const { isMemberListOpen, setIsMemberListOpen, onlineCount, activeWorkspace } = useWorkspace();
  const router = useRouter();
  const bottomRef = useRef(null);
  const [latestAnnouncement, setLatestAnnouncement] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Deduplication helper to ensure we don't have duplicate member entries
  const deduplicateMembers = (membersList) => {
    const seen = new Set();
    return membersList.filter(m => {
      const id = m._id || m.id;
      if (!id || seen.has(id.toString())) return false;
      seen.add(id.toString());
      return true;
    });
  };

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'leave' | 'delete'
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newName, setNewName] = useState(channelName || '');
  const [isSubmittingRename, setIsSubmittingRename] = useState(false);

  // Fetch channel members
  const fetchMembers = async () => {
    if (channelId) {
      setIsLoadingMembers(true);
      try {
        const res = await api.get(`/channels/${channelId}/members`);
        setMembers(deduplicateMembers(res.data));
      } catch (err) {
      } finally {
        setIsLoadingMembers(false);
      }
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [channelId]);

  // Real-time updates for roles and membership
  useEffect(() => {
    if (!socket || !channelId) return;

    const handleRoleUpdate = (data) => {
      if (data.channelId === channelId) {
        fetchMembers(); // Re-fetch to get consistent state
        if (data.userId === currentUser?._id) {
          toast.info(`Your permissions in #${channelName} have been updated to ${data.role || 'owner'}.`);
        }
      }
    };

    const handleMemberRemoved = (data) => {
      if (data.channelId === channelId) {
        setMembers(prev => prev.filter(m => m._id !== data.userId));
        if (data.userId === currentUser?._id) {
          // If we are removed, the workspace context or parent should handle redirection
          toast.error(`You are no longer a member of #${channelName}.`);
        }
      }
    };

    const handleMemberJoined = (data) => {
      if (data.channelId === channelId) {
        setMembers(prev => deduplicateMembers([...prev, data.user]));
      }
    };

    socket.on('channel_role_updated', handleRoleUpdate);
    socket.on('member_removed', handleMemberRemoved);
    socket.on('member_joined', handleMemberJoined);

    return () => {
      socket.off('channel_role_updated', handleRoleUpdate);
      socket.off('member_removed', handleMemberRemoved);
      socket.off('member_joined', handleMemberJoined);
    };
  }, [socket, channelId, currentUser, channelName]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    if (messages && messages.length > 0) {
      const latestMsg = messages[messages.length - 1];
      if (latestMsg.senderDetails?._id !== currentUser?._id) {
        setLatestAnnouncement(`New message from ${latestMsg.sender}: ${latestMsg.content}`);
      }
    }
  }, [messages, currentUser]);

  const pinnedMessages = messages.filter(m => m.isPinned);

  const formatDividerDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Role management actions
  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.patch(`/channels/${channelId}/role`, { userId, role: newRole });
      toast.success(`Success! User is now a channel ${newRole}.`);
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong while updating the role. Please try again.");
    }
  };

  const handleRemoveMember = async (userId, name) => {
    if (confirm(`Are you sure you want to remove ${name} from this channel?`)) {
      try {
        await api.delete(`/channels/${channelId}/members/${userId}`);
        toast.success(`${name} has been removed from the channel.`);
        setMembers(prev => prev.filter(m => m._id !== userId));
      } catch (err) {
        toast.error(err.response?.data?.message || "We couldn't remove the member right now. Please try again.");
      }
    }
  };

  const handleTransferOwnership = async (userId, name) => {
    if (confirm(`TRANSFER OWNERSHIP to ${name}? You will lose owner privileges.`)) {
      try {
        await api.post(`/channels/${channelId}/transfer-ownership`, { newOwnerId: userId });
        toast.success(`Ownership successfully transferred to ${name}.`);
        fetchMembers();
      } catch (err) {
        toast.error(err.response?.data?.message || "We couldn't transfer ownership. Please check your connection and try again.");
      }
    }
  };

  const onLeaveChannel = async () => {
    try {
      await api.post(`/channels/${channelId}/leave`);
      toast.success("You've successfully left the channel. See you around!");
      router.push(`/workspace?workspace=${activeWorkspace._id}&channel=general`);
    } catch (err) {
      toast.error(err.response?.data?.message || "We couldn't process your request to leave. Please try again.");
    }
  };

  const onDeleteChannel = async () => {
    try {
      await api.delete(`/channels/${channelId}`);
      toast.success("Channel deleted successfully. Poof! It's gone.");
      router.push(`/workspace?workspace=${activeWorkspace._id}&channel=general`);
    } catch (err) {
      toast.error(err.response?.data?.message || "We couldn't delete the channel. Please try again in a moment.");
    }
  };

  const handleConfirmAction = () => {
    if (confirmAction === 'leave') onLeaveChannel();
    if (confirmAction === 'delete') onDeleteChannel();
    setIsConfirmDialogOpen(false);
  };

  const handleRenameChannel = async (e) => {
    if (e) e.preventDefault();
    if (!newName || newName === channelName) {
      setIsRenameDialogOpen(false);
      return;
    }

    setIsSubmittingRename(true);
    try {
      await api.patch(`/channels/${channelId}`, { name: newName });
      toast.success(`Channel renamed to #${newName} successfully!`);
      setIsRenameDialogOpen(false);
      // Update local state if necessary or let the socket handle it
      // Since we use the URL param 'channel' for name, we should redirect to the new name
      router.push(`/workspace?workspace=${activeWorkspace._id}&channel=${newName.toLowerCase().replace(/\s+/g, '-')}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "We couldn't rename the channel. Maybe that name is already taken?");
    } finally {
      setIsSubmittingRename(false);
    }
  };

  // Grouping members
  const owners = members.filter(m => m.channelRole === 'owner');
  const admins = members.filter(m => 
    m.channelRole === 'admin' || 
    (m.role === 'Admin' && m.channelRole !== 'owner')
  );
  const regularMembers = members.filter(m => 
    m.channelRole !== 'owner' && 
    m.channelRole !== 'admin' && 
    m.role !== 'Admin'
  );

  const currentUserMember = members.find(m => m._id === currentUser?._id);
  const currentUserChannelRole = currentUserMember?.channelRole || (currentUser?.role === 'Admin' ? 'admin' : 'member');

  return (
    <div className="flex h-full bg-background absolute inset-0 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div aria-live="polite" className="sr-only">
          {latestAnnouncement}
        </div>

        {pinnedMessages.length > 0 && (
          <div className="bg-surface/30 border-b border-border shadow-sm z-20 sticky top-0 backdrop-blur-md shrink-0 flex flex-col p-3">
            <div className="flex items-center gap-2 mb-2 px-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Pinned</h3>
              <span className="bg-amber-500/20 text-amber-500 text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none">{pinnedMessages.length}</span>
            </div>
            <div className="max-h-24 overflow-y-auto pr-2 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
              {pinnedMessages.map(msg => (
                <div key={msg.id || msg._id} className="text-sm text-slate-300 bg-surface/50 px-3 py-2 rounded-lg border border-border truncate cursor-pointer lg:hover:bg-surface transition-colors">
                  <span className="font-semibold text-primary mr-2">{msg.sender}:</span> 
                  {msg.content}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 scroll-smooth scrollbar-thin scrollbar-thumb-surface-hover scrollbar-track-transparent relative z-10">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center shadow-inner border border-border">
                <span className="text-3xl animate-bounce">👋</span>
              </div>
              <p className="font-bold text-lg text-slate-300">Welcome to #{(channelName || 'general').toUpperCase()}</p>
              <p className="text-sm text-slate-500">This is the start of your workspace history.</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const currentDate = msg.createdAt ? new Date(msg.createdAt).toDateString() : null;
              const prevDate = idx > 0 && messages[idx - 1].createdAt ? new Date(messages[idx - 1].createdAt).toDateString() : null;
              const showDivider = currentDate && currentDate !== prevDate;

              return (
                <div key={msg.id || msg._id || `temp-${idx}`}>
                  {showDivider && (
                    <div className="flex justify-center my-6 relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                      </div>
                      <div className="relative px-4 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-surface backdrop-blur-md rounded-full border border-border shadow-sm z-10">
                        {formatDividerDate(msg.createdAt)}
                      </div>
                    </div>
                  )}
                  {msg.type === 'system' ? (
                    <div className="flex justify-center my-4">
                      <div className="px-4 py-1.5 bg-surface rounded-full border border-border/30 text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <MessageBubble 
                      message={msg} 
                      isOwnMessage={msg.senderDetails?._id === currentUser?._id}
                      onDelete={() => onDeleteMessage(msg.id)}
                      onEdit={(newContent) => onEditMessage(msg.id, newContent)}
                      onReact={(emoji) => onReactToMessage(msg.id, emoji)}
                      onPin={() => onPinMessage(msg.id)}
                      onReply={() => setReplyingTo(msg)}
                      currentUser={currentUser}
                    />
                  )}
                </div>
              );
            })
          )}
          <div ref={bottomRef} className="h-0 w-0" />
        </div>

        <MessageInput 
          onSendMessage={onSendMessage} 
          socket={socket} 
          channelId={channelId} 
          channelName={channelName}
          currentUser={currentUser}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
        />
      </div>

      {/* Mobile Backdrop for Member List */}
      {isMemberListOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMemberListOpen(false)}
        />
      )}

      {isMemberListOpen && (
        <div className="fixed lg:relative inset-y-0 right-0 w-full sm:w-80 lg:w-72 bg-sidebar/50 backdrop-blur-3xl border-l border-border flex flex-col h-full animate-in slide-in-from-right duration-300 z-40 lg:z-30 shadow-2xl">
          <div className="h-16 flex items-center justify-between px-4 border-b border-border bg-surface/50">
            <div className="flex items-center gap-2 text-slate-200">
              <FiUsers className="w-4 h-4 text-primary" />
              <span className="font-black text-xs uppercase tracking-widest">Members</span>
              <Badge variant="secondary" className="ml-1 text-[10px] font-black px-1.5 py-0 h-5">
                {members.length}
              </Badge>
            </div>
            <button onClick={() => setIsMemberListOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <FiX className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {isLoadingMembers ? (
              // Skeleton rows while members load
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-2 py-2">
                    <Skeleton className="w-8 h-8 rounded-full bg-white/8 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 rounded-full bg-white/8" style={{ width: `${50 + (i * 19) % 40}%` }} />
                      <Skeleton className="h-2.5 rounded-full bg-white/8" style={{ width: `${30 + (i * 13) % 30}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {owners.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-amber-500/80 uppercase tracking-[0.2em] mb-3 px-2 flex items-center gap-2">
                      <Crown className="w-3 h-3" /> Owner
                    </h4>
                    {owners.map(m => (
                      <MemberItem
                        key={`owner-${m._id}`}
                        member={m}
                        currentUser={currentUser}
                        currentUserChannelRole={currentUserChannelRole}
                        channelName={channelName}
                        handleUpdateRole={handleUpdateRole}
                        handleTransferOwnership={handleTransferOwnership}
                        handleRemoveMember={handleRemoveMember}
                      />
                    ))}
                  </div>
                )}
                {admins.length > 0 && (
                  <div>
                    {owners.length > 0 && <Separator className="mb-4 opacity-20" />}
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 px-2 flex items-center gap-2">
                      <ShieldCheck className="w-3 h-3" /> Admins
                      <Badge variant="outline" className="text-[9px] font-black px-1 h-4 ml-auto border-primary/30 text-primary">{admins.length}</Badge>
                    </h4>
                    {admins.map(m => (
                      <MemberItem
                        key={`admin-${m._id}`}
                        member={m}
                        currentUser={currentUser}
                        currentUserChannelRole={currentUserChannelRole}
                        channelName={channelName}
                        handleUpdateRole={handleUpdateRole}
                        handleTransferOwnership={handleTransferOwnership}
                        handleRemoveMember={handleRemoveMember}
                      />
                    ))}
                  </div>
                )}
                {regularMembers.length > 0 && (
                  <div>
                    {(owners.length > 0 || admins.length > 0) && <Separator className="mb-4 opacity-20" />}
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 px-2 flex items-center gap-2">
                      Members
                      <Badge variant="outline" className="text-[9px] font-black px-1 h-4 ml-auto border-white/10 text-slate-500">{regularMembers.length}</Badge>
                    </h4>
                    {regularMembers.map(m => (
                      <MemberItem
                        key={`member-${m._id}`}
                        member={m}
                        currentUser={currentUser}
                        currentUserChannelRole={currentUserChannelRole}
                        channelName={channelName}
                        handleUpdateRole={handleUpdateRole}
                        handleTransferOwnership={handleTransferOwnership}
                        handleRemoveMember={handleRemoveMember}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Channel Actions moved to bottom */}
            {channelName !== 'general' && (
              <div className="pt-4 border-t border-white/5 space-y-2">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 px-2">Channel Settings</h4>
                <div className="space-y-1">
                  {(currentUserChannelRole === 'owner' || currentUserChannelRole === 'admin') && (
                    <button 
                      onClick={() => { setNewName(channelName); setIsRenameDialogOpen(true); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-foreground lg:hover:bg-white/5 transition-all border border-transparent hover:border-border"
                    >
                      <FiEdit3 className="w-4 h-4 text-primary" /> Rename Channel
                    </button>
                  )}
                  {currentUserChannelRole === 'owner' ? (
                    <button 
                      onClick={() => { setConfirmAction('delete'); setIsConfirmDialogOpen(true); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-500 lg:hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                    >
                      <FiTrash2 className="w-4 h-4" /> Delete Channel
                    </button>
                  ) : (
                    <button 
                      onClick={() => { setConfirmAction('leave'); setIsConfirmDialogOpen(true); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-400 lg:hover:bg-white/5 transition-all border border-transparent hover:border-border"
                    >
                      <FiLogOut className="w-4 h-4" /> Leave Channel
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="bg-surface border-border sm:max-w-[400px]">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <DialogTitle className="text-foreground font-black uppercase tracking-widest text-lg">
              {confirmAction === 'delete' ? 'Delete Channel' : 'Leave Channel'}
            </DialogTitle>
            <DialogDescription className="text-slate-400 pt-2">
              {confirmAction === 'delete' 
                ? `Are you absolutely sure? This will permanently delete #${channelName} and all its messages. This action cannot be undone.`
                : `Are you sure you want to leave #${channelName}? You will need an invite or PIN to rejoin if it is a private channel.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-6">
            <button 
              onClick={() => setIsConfirmDialogOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirmAction}
              className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 ${confirmAction === 'delete' ? 'bg-red-600 shadow-red-600/20 hover:bg-red-700' : 'bg-primary shadow-primary/20 hover:bg-primary-hover'}`}
            >
              Confirm
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="bg-surface border-white/10 sm:max-w-[420px] rounded-4xl overflow-hidden shadow-[0_0_50px_-12px_rgba(var(--primary-rgb),0.3)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent opacity-50"></div>
          
          <DialogHeader className="pt-6 px-6">
            <DialogTitle className="text-foreground font-black uppercase tracking-widest text-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <FiEdit3 className="w-5 h-5 text-primary" />
              </div>
              Rename Channel
            </DialogTitle>
            <DialogDescription className="text-slate-400 pt-3 text-sm leading-relaxed">
              Updating the name of <span className="text-primary font-bold">#{channelName}</span> will sync for all members instantly across the workspace.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRenameChannel} className="p-6 space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1 ml-1 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-primary"></div>
                New Channel Name
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl group-focus-within:bg-primary/10 transition-all duration-500"></div>
                <div className="relative flex items-center">
                  <span className="absolute left-5 text-primary font-black text-xl select-none">#</span>
                  <input 
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="new-channel-name"
                    className="w-full bg-background/50 backdrop-blur-md border border-border rounded-2xl pl-12 pr-5 py-4 text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-700"
                    autoFocus
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setIsRenameDialogOpen(false)}
                className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 lg:hover:text-white lg:hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmittingRename || !newName || newName === channelName}
                className="flex-[1.5] py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white bg-linear-to-r from-primary to-primary/80 shadow-[0_10px_25px_-5px_rgba(var(--primary-rgb),0.4)] lg:hover:shadow-[0_15px_30px_-5px_rgba(var(--primary-rgb),0.5)] lg:hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
              >
                {isSubmittingRename ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const MemberItem = ({ member, currentUser, currentUserChannelRole, channelName, handleUpdateRole, handleTransferOwnership, handleRemoveMember }) => {
  const isOwner = member.channelRole === 'owner';
  const isAdmin = member.channelRole === 'admin' || (member.role === 'Admin' && !isOwner);
  const isSelf = member._id === currentUser?._id;

  // Permissions logic
  const canManage = (currentUserChannelRole === 'owner' || currentUserChannelRole === 'admin') && !isSelf && !isOwner;
  const canDemote = currentUserChannelRole === 'owner' && (isAdmin && member.channelRole === 'admin');
  const canTransfer = currentUserChannelRole === 'owner';

  return (
    <div className="flex items-center gap-3 px-2 py-2 rounded-lg lg:hover:bg-surface transition-colors group">
      <div className="relative">
        {member.avatar ? (
          <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-white text-xs font-black uppercase">
            {member.name?.charAt(0)}
          </div>
        )}
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full"></div>
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-200 truncate">{member.name}</span>
          {isOwner && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
          {isAdmin && <ShieldCheck className="w-3 h-3 text-primary shrink-0" />}
        </div>
        <span className="text-[10px] text-slate-500 font-medium truncate tracking-tight">@{member.username}</span>
      </div>


      {canManage && channelName !== 'general' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-white transition-all">
              <FiMoreVertical className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 shadow-2xl border-white/10">
            {!isAdmin && (
              <DropdownMenuItem onClick={() => handleUpdateRole(member._id, 'admin')}>
                <ArrowUp className="w-4 h-4 mr-2" /> Promote to Admin
              </DropdownMenuItem>
            )}
            {canDemote && (
              <DropdownMenuItem onClick={() => handleUpdateRole(member._id, 'member')}>
                <ArrowDown className="w-4 h-4 mr-2" /> Demote to Member
              </DropdownMenuItem>
            )}
            {canTransfer && (
              <DropdownMenuItem onClick={() => handleTransferOwnership(member._id, member.name)}>
                <RefreshCw className="w-4 h-4 mr-2" /> Transfer Ownership
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-500 focus:text-red-500 font-bold"
              onClick={() => handleRemoveMember(member._id, member.name)}
            >
              <UserMinus className="w-4 h-4 mr-2" /> Remove from Channel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

