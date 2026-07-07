import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Hash, Search, Send, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const INITIAL_MESSAGES = [
  { id: "init-1", user: "Alex", text: "New edge router deployed to production.", time: "12:04 PM", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&auto=format&fit=crop" },
  { id: "init-2", user: "Sarah", text: "Verified. Latency is down 20% in US-East.", time: "12:05 PM", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&auto=format&fit=crop" },
  { id: "init-3", user: "System", text: "Security audit completed. No issues found.", time: "12:10 PM", avatar: "/web-app-manifest-192x192.png" }
];

const NEW_MESSAGES = [
  { user: "James", text: "Should we scale the database clusters?", time: "12:12 PM", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=80&h=80&auto=format&fit=crop" },
  { user: "Sarah", text: "Already on it. Scaling to 10 nodes.", time: "12:13 PM", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&auto=format&fit=crop" },
  { user: "Alex", text: "Great. I'll monitor the traffic spikes.", time: "12:14 PM", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&auto=format&fit=crop" }
];

export default function ChannelsPreview() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => {
          const next = [
            ...prev, 
            { 
              ...NEW_MESSAGES[Math.floor(Math.random() * NEW_MESSAGES.length)], 
              id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` 
            }
          ];
          return next.slice(-4);
        });
      }, 2000);
    }, 6000);

    return () => clearInterval(messageInterval);
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="w-full h-full rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-3xl shadow-2xl overflow-hidden flex relative group text-left"
    >
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.1), transparent 80%)`
        }}
      />

      {/* Sidebar - Channels Focused */}
      <div className="w-14 md:w-64 border-r border-white/5 bg-white/2 flex flex-col p-2 md:p-4 shrink-0 relative z-10">
        <div className="flex items-center gap-3 mb-6 md:mb-8 px-1 md:px-2">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
            <Image src="/web-app-manifest-512x512.png" alt="Logo" width={20} height={20} />
          </div>
          <span className="font-black text-white hidden md:block text-lg">Nexuspace</span>
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-bold hidden md:block">Channels</span>
          </div>
          <div className="px-3 py-1 mt-4 text-[10px] font-black text-slate-600 uppercase tracking-widest hidden md:block">Active Threads</div>
          {["global-ops", "security", "infra"].map((chan) => (
            <div key={chan} className="flex items-center gap-3 p-3 rounded-xl text-slate-500 hover:bg-white/5 transition-colors group/chan">
              <Hash className="w-4 h-4 group-hover/chan:text-indigo-400 transition-colors" />
              <span className="text-sm font-bold hidden md:block">{chan}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto p-1 flex justify-center">
          <div className="w-10 h-10 md:w-full md:h-14 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center md:justify-start gap-2 md:gap-3 px-0 md:px-3">
             <div className="w-6 h-6 md:w-9 md:h-9 rounded-full border border-white/10 overflow-hidden relative shrink-0 aspect-square">
               <Image src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&auto=format&fit=crop" alt="User" fill sizes="36px" className="object-cover" />
             </div>
             <div className="hidden md:block">
               <div className="text-xs font-black text-white">Jane Doe</div>
               <div className="text-[10px] text-slate-500 font-bold">Pro Account</div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="h-12 md:h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-6 bg-white/1">
          <div className="flex items-center gap-2 md:gap-4">
            <Hash className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
            <h2 className="font-bold text-white text-[10px] md:text-base tracking-tight">global-ops</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-7 h-7 md:w-9 md:h-9 rounded-full border border-white/10 overflow-hidden relative shrink-0 aspect-square">
               <Image src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&auto=format&fit=crop" alt="User" fill sizes="36px" className="object-cover" />
                <span className="absolute bottom-0 right-0 w-2 md:w-2.5 md:h-2.5 bg-emerald-500 rounded-full border border-slate-950 animate-pulse" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-hidden">
              <div className="flex flex-col h-full gap-4">
                <div className="flex-1 rounded-2xl border border-white/5 bg-white/1 p-3 md:p-4 flex flex-col overflow-hidden">
                   <div className="flex-1 flex flex-col gap-3 md:gap-6 overflow-y-auto custom-scrollbar pr-2 pb-2 md:pb-4">
                      <AnimatePresence mode="popLayout">
                        {messages.map((msg, i) => (
                          <motion.div 
                            key={msg.id} 
                            layout
                            initial={{ opacity: 0, x: -10, scale: 0.98 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex gap-2 md:gap-4"
                          >
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl overflow-hidden relative border border-white/5 shrink-0 shadow-sm aspect-square">
                                <Image src={msg.avatar} alt={msg.user} fill sizes="40px" className="object-cover" />
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

                   <div className="h-6 md:h-8 flex items-center shrink-0">
                     <AnimatePresence>
                       {isTyping && (
                         <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="flex items-center gap-2 text-slate-500"
                         >
                            <div className="flex gap-1">
                              <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-indigo-500/50 rounded-full animate-bounce" />
                              <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-indigo-500/50 rounded-full animate-bounce delay-75" />
                              <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-indigo-500/50 rounded-full animate-bounce delay-150" />
                            </div>
                            <span className="text-[9px] md:text-[10px] font-bold">Sarah is typing...</span>
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </div>

                   <div className="pt-2 flex gap-2 md:gap-3 shrink-0">
                      <div className="flex-1 h-9 md:h-11 rounded-lg md:rounded-xl bg-white/5 border border-white/10 flex items-center px-3 md:px-4 gap-2 md:gap-3">
                         <Plus className="w-3 h-3 md:w-4 md:h-4 text-slate-500" />
                         <span className="text-[10px] md:text-xs text-slate-500">Message...</span>
                      </div>
                      <div className="w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                         <Send className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                      </div>
                   </div>
                </div>
             </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-linear-to-tr from-indigo-500/5 via-transparent to-transparent" />
    </motion.div>
  );
}
