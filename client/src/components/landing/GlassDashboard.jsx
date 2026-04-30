import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, LayoutDashboard, Bell, Hash, Search, User, Settings, Send, Plus, CheckCircle2, Clock, MoreHorizontal, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const INITIAL_MESSAGES = [
  { user: "Alex", text: "New edge router deployed to production.", time: "12:04 PM", color: "indigo", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&auto=format&fit=crop" },
  { user: "Sarah", text: "Verified. Latency is down 20% in US-East.", time: "12:05 PM", color: "fuchsia", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&auto=format&fit=crop" },
  { user: "System", text: "Security audit completed. No issues found.", time: "12:10 PM", color: "emerald", avatar: "/web-app-manifest-192x192.png" }
];

const NEW_MESSAGES = [
  { user: "James", text: "Should we scale the database clusters?", time: "12:12 PM", color: "amber", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=80&h=80&auto=format&fit=crop" },
  { user: "Sarah", text: "Already on it. Scaling to 10 nodes.", time: "12:13 PM", color: "fuchsia", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&auto=format&fit=crop" },
  { user: "Alex", text: "Great. I'll monitor the traffic spikes.", time: "12:14 PM", color: "indigo", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&auto=format&fit=crop" }
];

const BACKLOG_TASKS = [
  { id: 1, title: "Optimize DB Index", priority: "High" },
  { id: 2, title: "Refactor Auth Middleware", priority: "Medium" },
  { id: 3, title: "Update API Docs", priority: "Low" }
];

export default function GlassDashboard({ activeScene = 0 }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [hasNotification, setHasNotification] = useState(true);
  const [tasks, setTasks] = useState(BACKLOG_TASKS);
  const [completedTasks, setCompletedTasks] = useState([{ id: 0, title: "Initial Deploy" }]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    let messageInterval;
    let taskInterval;
    let searchInterval;

    if (activeScene === 0) {
      messageInterval = setInterval(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => {
            const next = [...prev, NEW_MESSAGES[Math.floor(Math.random() * NEW_MESSAGES.length)]];
            return next.slice(-4);
          });
        }, 2000);
      }, 6000);
    }

    if (activeScene === 1) {
      taskInterval = setInterval(() => {
        setTasks(prev => {
          if (prev.length === 0) return BACKLOG_TASKS;
          const taskToMove = prev[0];
          setCompletedTasks(c => [taskToMove, ...c].slice(0, 3));
          return prev.slice(1);
        });
      }, 5000);
    }

    searchInterval = setInterval(() => {
      const queries = ["global-ops", "security", "latency", "deployment"];
      const q = queries[Math.floor(Math.random() * queries.length)];
      setIsSearching(true);
      setSearchQuery("");
      let i = 0;
      const typeInterval = setInterval(() => {
        setSearchQuery(q.slice(0, i + 1));
        i++;
        if (i === q.length) {
          clearInterval(typeInterval);
          setTimeout(() => setIsSearching(false), 2000);
        }
      }, 100);
    }, 10000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(taskInterval);
      clearInterval(searchInterval);
    };
  }, [activeScene]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-full rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-3xl shadow-2xl overflow-hidden flex relative group text-left transition-all duration-500"
    >
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.08), transparent 80%)`
        }}
      />

      {/* Sidebar */}
      <div className="w-14 md:w-64 border-r border-white/5 bg-white/2 flex flex-col p-2 md:p-4 shrink-0 relative z-10">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg overflow-hidden relative group/logo">
            <div className="absolute inset-0 bg-indigo-500/20 group-hover/logo:bg-indigo-500/40 transition-colors" />
            <Image 
              src="/web-app-manifest-512x512.png" 
              alt="Nexuspace Logo" 
              width={24} 
              height={24} 
              className="relative z-10 group-hover/logo:scale-110 transition-transform duration-500"
            />
          </div>
          <span className="font-black text-white hidden md:block text-lg tracking-tight">Nexuspace</span>
        </div>

        <div className="space-y-2 flex-1">
          {[
            { icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard", active: activeScene === 1 },
            { icon: <MessageSquare className="w-4 h-4" />, label: "Channels", active: activeScene === 0 },
            { icon: <Bell className="w-4 h-4" />, label: "Activity", active: activeScene === 2, notify: hasNotification },
            { icon: <User className="w-4 h-4" />, label: "Team" }
          ].map((item, i) => (
            <div 
              key={i} 
              onClick={() => item.label === "Activity" && setHasNotification(false)}
              className={`flex items-center justify-between p-2 md:p-3 rounded-xl transition-all duration-300 cursor-pointer ${item.active ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-2 md:gap-3">
                {item.icon}
                <span className="text-sm font-bold hidden md:block">{item.label}</span>
              </div>
              {item.notify && (
                <span className="relative flex h-2 w-2 md:mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-auto p-1 flex justify-center">
          <div className="w-10 h-10 md:w-full md:h-14 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center md:justify-start gap-2 md:gap-3 px-0 md:px-3 group/settings cursor-pointer hover:bg-white/10 transition-all">
             <div className="w-6 h-6 md:w-9 md:h-9 rounded-full border border-white/10 overflow-hidden shadow-lg relative shrink-0 aspect-square">
               <Image 
                 src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&auto=format&fit=crop" 
                 alt="Profile" 
                 fill
                 className="object-cover"
               />
             </div>
             <div className="hidden md:block">
               <div className="text-xs font-black text-white leading-tight">Jane Doe</div>
               <div className="text-[10px] text-slate-500 font-bold">Pro Account</div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header */}
        <header className="h-12 md:h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-6 bg-white/1">
          <div className="flex items-center gap-3 md:gap-4">
            <Hash className="w-4 h-4 md:w-5 md:h-5 text-slate-500" />
            <h2 className="font-bold text-white text-[10px] md:text-base tracking-tight">global-operations</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 relative overflow-hidden group/search">
              <Search className={`w-3.5 h-3.5 transition-colors ${isSearching ? 'text-indigo-400' : ''}`} />
              <span className="w-24 overflow-hidden whitespace-nowrap">
                {isSearching ? searchQuery : "Search..."}
              </span>
              <AnimatePresence>
                {isSearching && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-10 right-0 w-48 bg-slate-900/90 border border-white/10 rounded-xl p-2 shadow-2xl backdrop-blur-xl z-50"
                  >
                    <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-2">Search Result</div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                      <div className="w-5 h-5 rounded bg-indigo-500/20 flex items-center justify-center">
                        <Hash className="w-3 h-3 text-indigo-400" />
                      </div>
                      <span className="text-[10px] text-white">Found in #infra</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="w-7 h-7 md:w-9 md:h-9 rounded-full border border-white/10 shadow-lg relative overflow-hidden shrink-0 aspect-square">
               <Image 
                 src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&auto=format&fit=crop" 
                 alt="Header Profile" 
                 fill
                 className="object-cover"
               />
               <span className="absolute bottom-0 right-0 w-2 md:w-2.5 md:h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse z-10" />
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 p-6 overflow-hidden">
          {activeScene === 0 && (
             <div className="flex flex-col h-full gap-4">
                <div className="flex-1 rounded-2xl border border-white/5 bg-white/1 p-4 flex flex-col overflow-hidden">
                   {/* Scrollable Message Area */}
                   <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-4">
                      <AnimatePresence mode="popLayout">
                        {messages.map((msg, i) => (
                          <motion.div 
                            key={msg.text + i} 
                            layout
                            initial={{ opacity: 0, x: -10, scale: 0.98 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex gap-2 md:gap-4"
                          >
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl overflow-hidden relative border border-white/5 shrink-0 shadow-sm aspect-square">
                                <Image src={msg.avatar} alt={msg.user} fill className="object-cover" />
                              </div>
                              <div className="space-y-0.5 md:space-y-1">
                                 <div className="flex items-center gap-2">
                                   <span className="font-bold text-white text-xs md:text-sm">{msg.user}</span>
                                   <span className="text-[9px] md:text-[10px] text-slate-500">{msg.time}</span>
                                 </div>
                                 <p className="text-xs md:text-sm text-slate-400 leading-tight md:leading-relaxed">{msg.text}</p>
                              </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                   </div>

                   {/* Fixed-height Typing Indicator to prevent layout jumps */}
                   <div className="h-8 flex items-center shrink-0">
                     <AnimatePresence>
                       {isTyping && (
                         <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="flex items-center gap-2 text-slate-500"
                         >
                            <div className="flex gap-1">
                              <span className="w-1.5 h-1.5 bg-indigo-500/50 rounded-full animate-bounce" />
                              <span className="w-1.5 h-1.5 bg-indigo-500/50 rounded-full animate-bounce delay-75" />
                              <span className="w-1.5 h-1.5 bg-indigo-500/50 rounded-full animate-bounce delay-150" />
                            </div>
                            <span className="text-[10px] font-bold">Sarah is typing...</span>
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </div>

                   {/* Input Bar */}
                   <div className="pt-2 flex gap-2 md:gap-3 shrink-0">
                      <div className="flex-1 h-9 md:h-11 rounded-lg md:rounded-xl bg-white/5 border border-white/10 flex items-center px-3 md:px-4 gap-2 md:gap-3">
                         <Plus className="w-3 h-3 md:w-4 md:h-4 text-slate-500" />
                         <span className="text-[10px] md:text-xs text-slate-500">Message...</span>
                      </div>
                      <div className="w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer">
                         <Send className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                      </div>
                   </div>
                </div>
             </div>
          )}

          {activeScene === 1 && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full overflow-hidden">
                <div className="rounded-2xl border border-white/5 bg-white/1 p-3 md:p-5 flex flex-col gap-4 overflow-hidden shadow-inner">
                   <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 shrink-0">
                      <Clock className="w-3 h-3 text-indigo-400" /> Backlog
                   </h3>
                   <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
                      <AnimatePresence mode="popLayout">
                        {tasks.map(task => (
                          <motion.div 
                            key={task.id} 
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                            className="p-3 md:p-4 rounded-xl bg-white/5 border border-white/5 group/card relative shadow-sm"
                          >
                             <div className="text-[10px] font-black text-white mb-1">{task.title}</div>
                             <div className="flex items-center gap-2">
                               <div className="h-1 w-8 bg-indigo-500/50 rounded-full" />
                               <span className="text-[8px] md:text-[9px] text-slate-500 uppercase font-bold tracking-wider">{task.priority}</span>
                             </div>
                             <MoreHorizontal className="absolute top-3 right-3 w-3 h-3 text-slate-600 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                   </div>
                </div>
                <div className="rounded-2xl border border-white/5 bg-indigo-500/5 p-3 md:p-5 flex flex-col gap-4 relative overflow-hidden shadow-inner">
                   <h3 className="text-[10px] md:text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                   </h3>
                   <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
                      <AnimatePresence mode="popLayout">
                        {completedTasks.map(task => (
                          <motion.div 
                            key={task.id} 
                            layout
                            initial={{ scale: 0.9, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="p-3 md:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 relative overflow-hidden shadow-sm"
                          >
                             <div className="text-[10px] font-black text-emerald-400 mb-1">{task.title}</div>
                             <div className="text-[8px] md:text-[9px] text-emerald-500/60 font-bold uppercase tracking-widest flex items-center gap-1">
                               <Sparkles className="w-2.5 h-2.5" /> Sync
                             </div>
                             {task.id !== 0 && (
                               <motion.div 
                                 initial={{ opacity: 1, scale: 0 }}
                                 animate={{ opacity: 0, scale: 2 }}
                                 transition={{ duration: 0.8 }}
                                 className="absolute inset-0 bg-emerald-400/20"
                               />
                             )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                   </div>
                </div>
             </div>
          )}

          {activeScene === 2 && (
             <div className="flex items-center justify-center h-full">
                <div className="relative">
                   <motion.div 
                     animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }} 
                     transition={{ duration: 2, repeat: Infinity }}
                     className="absolute inset-0 bg-indigo-500/30 rounded-full scale-[2] blur-2xl"
                   />
                   <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative z-10 backdrop-blur-xl">
                      <Bell className="w-12 h-12 text-indigo-400 animate-bounce" />
                   </div>
                   <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-black text-white border-2 border-slate-950">
                      12
                   </div>
                </div>
             </div>
          )}
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-linear-to-tr from-indigo-500/5 via-transparent to-fuchsia-500/5" />
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
    </motion.div>
  );
}
