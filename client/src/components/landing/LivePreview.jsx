"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Command, CheckCircle2 } from "lucide-react";

export default function LivePreview() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [taskMoved, setTaskMoved] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    let cycleCount = 0;
    
    // Using sequenced recursive timeouts instead of setInterval for strict cleanup & performance
    const runSequence = () => {
      setMessages([]);
      setTaskMoved(false);
      setIsTyping(true);

      const now = Date.now();

      const t1 = setTimeout(() => {
        setIsTyping(false);
        setMessages([{ id: `1-${now}`, user: "Alex", text: "Just pushed the new Edge router configs.", color: "indigo" }]);
      }, 1500);

      const t2 = setTimeout(() => setIsTyping(true), 2500);

      const t3 = setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { id: `2-${now}`, user: "Sarah", text: "Deploying verifying clusters now. Moving ticket.", color: "emerald" }]);
      }, 4000);

      const t4 = setTimeout(() => setTaskMoved(true), 5000);

      // Loop sequence
      const tLoop = setTimeout(() => {
         if(cycleCount < 10) runSequence();
         cycleCount++;
      }, 9000);

      return () => { 
        clearTimeout(t1); 
        clearTimeout(t2); 
        clearTimeout(t3); 
        clearTimeout(t4); 
        clearTimeout(tLoop); 
      };
    };

    const cleanupSequence = runSequence();
    return () => cleanupSequence();
  }, []);

  if(!isMounted) return null; // Avoid hydration mismatch

  return (
    <div className="relative z-10 py-12 bg-[#030014] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Live Synchronization Engine</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">Experience sub-millisecond propagation across your entire workspace.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
           {/* Mock Chat Feed */}
           <div className="flex-1 border border-white/10 rounded-2xl bg-slate-950/80 backdrop-blur-xl p-4 md:p-6 shadow-2xl relative overflow-hidden h-[350px] md:h-[400px] flex flex-col">
             <div className="border-b border-white/5 pb-4 mb-4 flex items-center gap-3">
               <Command className="text-indigo-400 w-5 h-5" />
               <h3 className="font-bold text-white text-sm md:text-base"># deployment-logs</h3>
             </div>
             
             <div className="flex-1 flex flex-col gap-4 overflow-hidden">
               <AnimatePresence>
                 {messages.map(msg => (
                   <motion.div 
                     key={msg.id}
                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     transition={{ duration: 0.3 }}
                     className="flex gap-3"
                   >
                     <div className={`w-8 h-8 rounded-full bg-${msg.color}-500/20 text-${msg.color}-400 flex items-center justify-center font-bold text-xs shrink-0 tracking-widest`}>
                       {msg.user.charAt(0)}
                     </div>
                     <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-sm p-3 text-xs md:text-sm text-slate-300 relative group pointer-events-auto">
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl rounded-tl-sm"></div>
                        {msg.text}
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>

               {/* Typing Indicator */}
               <AnimatePresence>
                 {isTyping && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0 }}
                     className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-2"
                   >
                     <div className="flex gap-1">
                       <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                       <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                       <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                     </div>
                     Someone is typing...
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
           </div>

           {/* Mock Kanban Feed */}
           <div className="flex-1 w-full lg:w-96 border border-white/10 rounded-2xl bg-slate-950/80 backdrop-blur-xl p-4 md:p-6 shadow-2xl relative overflow-hidden h-[350px] md:h-[400px]">
             <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-sm md:text-base"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Live Kanban View</h3>
             <div className="space-y-4 relative h-full">
               
               <div className="absolute inset-0 left-1/2 md:left-1/2 border-r border-white/10 border-dashed pointer-events-none hidden xs:block"></div>
               <div className="flex justify-between text-[10px] md:text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                 <span>In Progress</span>
                 <span>Completed</span>
               </div>

               <motion.div 
                 animate={{ x: taskMoved ? "100%" : "0%" }}
                 transition={{ type: "spring", stiffness: 120, damping: 20 }}
                 className="w-[calc(50%-5px)] md:w-[calc(50%-10px)] bg-slate-900 border border-white/10 rounded-xl p-3 md:p-4 shadow-xl z-20 relative cursor-grab active:cursor-grabbing hover:border-white/20 transition-colors"
               >
                 <div className="flex gap-1 mb-3">
                   <div className="w-6 md:w-8 h-1.5 md:h-2 rounded-full bg-amber-500/50"></div>
                   <div className="w-3 md:w-4 h-1.5 md:h-2 rounded-full bg-fuchsia-500/50"></div>
                 </div>
                 <h4 className="text-white text-[11px] md:text-sm font-bold mb-2">Configure Edge</h4>
                 <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                   <motion.div animate={{ width: taskMoved ? "100%" : "50%" }} transition={{ duration: 1 }} className="h-full bg-emerald-500"></motion.div>
                 </div>
               </motion.div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
