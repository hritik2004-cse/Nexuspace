"use client";

import { motion } from "framer-motion";
import { MessageSquare, LayoutDashboard, Bell, Hash, Search, User, Settings, Send, Plus, CheckCircle2, Clock } from "lucide-react";

export default function GlassDashboard({ activeScene = 0 }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="w-full h-full rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-3xl shadow-2xl overflow-hidden flex relative group text-left"
    >
      {/* Sidebar */}
      <motion.div variants={itemVariants} className="w-20 md:w-64 border-r border-white/5 bg-white/[0.02] flex flex-col p-4 shrink-0">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Hash className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-white hidden md:block">Nexuspace</span>
        </div>

        <div className="space-y-2 flex-1">
          {[
            { icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard", active: activeScene === 1 },
            { icon: <MessageSquare className="w-4 h-4" />, label: "Channels", active: activeScene === 0 },
            { icon: <Bell className="w-4 h-4" />, label: "Activity", active: activeScene === 2 },
            { icon: <User className="w-4 h-4" />, label: "Team" }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${item.active ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-white/5'}`}
            >
              {item.icon}
              <span className="text-sm font-bold hidden md:block">{item.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-auto p-2">
          <div className="w-full h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center md:justify-start gap-3 px-3">
             <Settings className="w-4 h-4 text-slate-400" />
             <span className="text-xs font-bold text-slate-400 hidden md:block">Settings</span>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <motion.header variants={itemVariants} className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <Hash className="w-5 h-5 text-slate-500" />
            <h2 className="font-bold text-white text-sm md:text-base tracking-tight">global-operations</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400">
              <Search className="w-3.5 h-3.5" />
              Search workspace...
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 border border-white/10 shadow-lg" />
          </div>
        </motion.header>

        {/* Dynamic Content */}
        <div className="flex-1 p-6 overflow-hidden">
          {activeScene === 0 && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full gap-4">
                <div className="flex-1 rounded-2xl border border-white/5 bg-white/[0.01] p-4 flex flex-col gap-6 overflow-hidden">
                   {[
                     { user: "Alex", text: "New edge router deployed to production.", time: "12:04 PM", color: "indigo" },
                     { user: "Sarah", text: "Verified. Latency is down 20% in US-East.", time: "12:05 PM", color: "fuchsia" },
                     { user: "System", text: "Security audit completed. No issues found.", time: "12:10 PM", color: "emerald" }
                   ].map((msg, i) => (
                     <motion.div key={i} variants={itemVariants} className="flex gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-${msg.color}-500/10 flex items-center justify-center text-${msg.color}-400 font-black text-xs shrink-0`}>
                          {msg.user[0]}
                        </div>
                        <div className="space-y-1">
                           <div className="flex items-center gap-2">
                             <span className="font-bold text-white text-sm">{msg.user}</span>
                             <span className="text-[10px] text-slate-500">{msg.time}</span>
                           </div>
                           <p className="text-sm text-slate-400 leading-relaxed">{msg.text}</p>
                        </div>
                     </motion.div>
                   ))}
                   <div className="mt-auto pt-4 flex gap-3">
                      <div className="flex-1 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center px-4 gap-3">
                         <Plus className="w-4 h-4 text-slate-500" />
                         <span className="text-xs text-slate-500">Message #global-operations</span>
                      </div>
                      <div className="w-11 h-11 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                         <Send className="w-4 h-4 text-white" />
                      </div>
                   </div>
                </div>
             </motion.div>
          )}

          {activeScene === 1 && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-4 h-full">
                <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 space-y-4">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-3 h-3 text-indigo-400" /> Backlog
                   </h3>
                   <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                           <div className="h-2 w-12 bg-white/10 rounded-full mb-2" />
                           <div className="h-1.5 w-full bg-white/5 rounded-full" />
                        </div>
                      ))}
                   </div>
                </div>
                <div className="rounded-2xl border border-white/5 bg-indigo-500/5 p-5 space-y-4">
                   <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                   </h3>
                   <div className="space-y-3">
                      {[1, 2].map(i => (
                        <motion.div 
                          key={i} 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: i * 0.2 }}
                          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                        >
                           <div className="h-2 w-8 bg-emerald-500/30 rounded-full mb-2" />
                           <div className="h-1.5 w-full bg-emerald-500/20 rounded-full" />
                        </motion.div>
                      ))}
                   </div>
                </div>
             </motion.div>
          )}

          {activeScene === 2 && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center h-full">
                <div className="relative">
                   <motion.div 
                     animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }} 
                     transition={{ duration: 2, repeat: Infinity }}
                     className="absolute inset-0 bg-emerald-500/20 rounded-full scale-[2]"
                   />
                   <div className="w-32 h-32 rounded-full bg-emerald-500/10 border-2 border-emerald-500/50 flex items-center justify-center relative z-10">
                      <Bell className="w-12 h-12 text-emerald-400 animate-bounce" />
                   </div>
                </div>
             </motion.div>
          )}
        </div>
      </div>

      {/* Glossy Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-indigo-500/5 via-transparent to-fuchsia-500/5" />
    </motion.div>
  );
}
