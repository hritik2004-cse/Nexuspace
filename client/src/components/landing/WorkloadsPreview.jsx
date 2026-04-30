import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Bell, Search, User, Hash, CheckCircle2, Clock, MoreHorizontal, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const BACKLOG_TASKS = [
  { id: 1, title: "Optimize DB Index", priority: "High" },
  { id: 2, title: "Refactor Auth Middleware", priority: "Medium" },
  { id: 3, title: "Update API Docs", priority: "Low" }
];

export default function WorkloadsPreview() {
  const [tasks, setTasks] = useState(BACKLOG_TASKS);
  const [completedTasks, setCompletedTasks] = useState([{ id: 0, title: "Initial Deploy" }]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const taskInterval = setInterval(() => {
      setTasks(prev => {
        if (prev.length === 0) {
          // Reset backlog with unique IDs
          return BACKLOG_TASKS.map(t => ({ 
            ...t, 
            id: `backlog-${t.id}-${Math.random().toString(36).substr(2, 9)}` 
          }));
        }
        const taskToMove = prev[0];
        setCompletedTasks(c => [
          { ...taskToMove, id: `done-${taskToMove.id}-${Math.random().toString(36).substr(2, 9)}` },
          ...c
        ].slice(0, 3));
        return prev.slice(1);
      });
    }, 5000);

    return () => clearInterval(taskInterval);
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-full rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-3xl shadow-2xl overflow-hidden flex relative group text-left"
    >
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(168, 85, 247, 0.1), transparent 80%)`
        }}
      />

      {/* Sidebar - Workload Focused */}
      <div className="w-14 md:w-64 border-r border-white/5 bg-white/2 flex flex-col p-2 md:p-4 shrink-0 relative z-10">
        <div className="flex items-center gap-3 mb-6 md:mb-8 px-1 md:px-2">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
            <Image src="/web-app-manifest-512x512.png" alt="Logo" width={20} height={20} />
          </div>
          <span className="font-black text-white hidden md:block text-lg">Nexuspace</span>
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/20 shadow-lg shadow-fuchsia-500/5">
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-sm font-bold hidden md:block">Workloads</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl text-slate-500 hover:bg-white/5 transition-colors">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-bold hidden md:block">Timeline</span>
          </div>
        </div>

        <div className="mt-auto p-1 flex justify-center">
          <div className="w-10 h-10 md:w-full md:h-14 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center md:justify-start gap-2 md:gap-3 px-0 md:px-3">
             <div className="w-6 h-6 md:w-9 md:h-9 rounded-full border border-white/10 overflow-hidden relative shrink-0 aspect-square">
               <Image src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&auto=format&fit=crop" alt="User" fill sizes="36px" className="object-cover" />
             </div>
             <div className="hidden md:block">
               <div className="text-xs font-black text-white">Jane Doe</div>
               <div className="text-[10px] text-slate-500 font-bold">Manager</div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="h-12 md:h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-6 bg-white/1">
          <div className="flex items-center gap-3 md:gap-4">
            <LayoutDashboard className="w-4 h-4 md:w-5 md:h-5 text-fuchsia-400" />
            <h2 className="font-bold text-white text-xs md:text-base tracking-tight">System Deployment</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400">
              <Search className="w-3.5 h-3.5" />
              <span>Tasks...</span>
            </div>
            <div className="w-7 h-7 md:w-9 md:h-9 rounded-full border border-white/10 overflow-hidden relative shrink-0 aspect-square">
               <Image src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&auto=format&fit=crop" alt="User" fill sizes="36px" className="object-cover" />
               <span className="absolute bottom-0 right-0 w-2 md:w-2.5 md:h-2.5 bg-emerald-500 rounded-full border border-slate-950" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-3 md:p-6 overflow-hidden md:overflow-y-auto">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 h-auto md:h-full">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-5 flex flex-col gap-5 overflow-hidden shadow-inner">
                 <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 md:gap-2 shrink-0">
                    <Clock className="w-3 md:w-3.5 h-3 md:h-3.5 text-fuchsia-400" /> Active Backlog
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
                          className="p-3 md:p-5 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 group/card relative shadow-sm"
                        >
                           <div className="text-[10px] md:text-xs font-bold text-white mb-1.5 md:mb-2">{task.title}</div>
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               <div className="h-1 w-8 md:h-1.5 md:w-10 bg-fuchsia-500/40 rounded-full" />
                               <span className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wider">{task.priority}</span>
                             </div>
                           </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                 </div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-fuchsia-500/5 p-5 flex flex-col gap-5 relative overflow-hidden shadow-inner">
                 <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Successfully Completed
                 </h3>
                 <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
                    <AnimatePresence mode="popLayout">
                      {completedTasks.map(task => (
                        <motion.div 
                          key={task.id} 
                          layout
                          initial={{ scale: 0.9, opacity: 0, y: 10 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          className="p-3 md:p-5 rounded-xl md:rounded-2xl bg-emerald-500/10 border border-emerald-500/20 relative overflow-hidden shadow-sm"
                        >
                           <div className="text-[10px] md:text-xs font-bold text-emerald-400 mb-1 md:mb-2">{task.title}</div>
                           <div className="text-[8px] md:text-[10px] text-emerald-500/60 font-black uppercase tracking-widest flex items-center gap-1">
                             <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3" /> Sync
                           </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-linear-to-tr from-fuchsia-500/5 via-transparent to-indigo-500/5" />
    </motion.div>
  );
}
