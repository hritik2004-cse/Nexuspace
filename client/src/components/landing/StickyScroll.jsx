"use client";

import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { MessageSquare, LayoutDashboard, Bell, Activity } from "lucide-react";

const content = [
  {
    title: "Instant Channels",
    description: "Launch secure chat threads natively coupled with your codebase. No context switching. Complete encapsulation.",
    icon: <MessageSquare className="w-6 h-6 text-indigo-400" />
  },
  {
    title: "Intelligent Workloads",
    description: "Tasks move dynamically at edge speed. Assign tickets without opening separate applications. Everything is in sync.",
    icon: <LayoutDashboard className="w-6 h-6 text-fuchsia-400" />
  },
  {
    title: "Unified Notification Mesh",
    description: "Ping, mention, and alert teams globally. The WebSocket engine resolves your latency bottlenecks.",
    icon: <Bell className="w-6 h-6 text-emerald-400" />
  }
];

export default function StickyScroll() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end end"] });
  const [activeCard, setActiveCard] = useState(0);

  // Derive active index based on robust scroll observer
  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((latest) => {
      const cards = content.length;
      const breakPoint = 1 / cards;
      let index = Math.floor(latest / breakPoint);
      if (index >= cards) index = cards - 1;
      
      setActiveCard((prev) => (prev === index ? prev : index));
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <section ref={targetRef} className="relative z-10 w-full h-[300vh] bg-[#030014]">
      
      <div className="sticky top-0 min-h-screen py-24 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row gap-8 md:gap-20 items-center md:items-stretch">
          
          {/* Left Text Block mapping Narrative */}
          <div className="w-full md:w-[45%] flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-6 md:mb-8">
               <Activity className="text-indigo-500 w-5 h-5 animate-pulse" /> 
               <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-500 line-clamp-1">The Nexuspace Paradigm</span>
             </div>
             
             <div className="relative h-[200px] md:h-[250px] w-full">
               {content.map((item, idx) => (
                 <motion.div 
                   key={idx}
                   initial={false}
                   animate={{ opacity: activeCard === idx ? 1 : 0, y: activeCard === idx ? 0 : 20, scale: activeCard === idx ? 1 : 0.95 }}
                   transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                   className={`absolute top-0 left-0 w-full ${activeCard === idx ? 'pointer-events-auto' : 'pointer-events-none'}`}
                 >
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        {item.icon}
                      </div>
                   </div>
                   <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">{item.title}</h2>
                   <p className="text-xl text-slate-400 font-light leading-relaxed">{item.description}</p>
                 </motion.div>
               ))}
             </div>
          </div>

          {/* Right Imagery Swapper Block */}
          <div className="w-full md:w-[55%] flex items-center justify-center relative">
             <div className="w-full aspect-square md:aspect-[4/3] rounded-3xl border border-white/10 bg-[#0a0a0f] shadow-2xl overflow-hidden relative group">
                
                {/* Scene 1: Chat */}
                <motion.div 
                  initial={false} animate={{ opacity: activeCard === 0 ? 1 : 0 }} transition={{ duration: 0.5 }}
                  className="absolute inset-0 bg-[#0a0a0f] p-8 flex flex-col justify-end gap-3"
                >
                  <div className="w-3/4 bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-sm text-sm text-white/80 self-start shadow-xl backdrop-blur-3xl"><div className="w-4 h-4 rounded-full bg-indigo-500 mb-2"></div>System initialized. Sockets active.</div>
                  <div className="w-5/6 bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl rounded-tr-sm text-sm text-indigo-200 self-end shadow-xl backdrop-blur-3xl"><div className="w-4 h-4 rounded-full bg-indigo-400 mb-2"></div>Routing endpoints confirmed. Awaiting inputs.</div>
                </motion.div>

                {/* Scene 2: Tasks */}
                <motion.div 
                  initial={false} animate={{ opacity: activeCard === 1 ? 1 : 0 }} transition={{ duration: 0.5 }}
                  className="absolute inset-0 bg-[#0a0a0f] p-8 flex gap-4"
                >
                   <div className="flex-1 border border-white/10 rounded-xl bg-white/5 p-4 flex flex-col gap-3">
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Backlog</span>
                     <div className="w-full h-16 rounded-lg border border-white/10 bg-white/5 shadow-xl"></div>
                   </div>
                   <div className="flex-1 border border-white/10 rounded-xl bg-white/5 p-4 flex flex-col gap-3">
                     <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Done</span>
                     <div className="w-full h-24 rounded-lg border border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]"></div>
                   </div>
                </motion.div>

                {/* Scene 3: Notifications */}
                <motion.div 
                  initial={false} animate={{ opacity: activeCard === 2 ? 1 : 0 }} transition={{ duration: 0.5 }}
                  className="absolute inset-0 bg-[#0a0a0f] flex items-center justify-center"
                >
                  <div className="w-64 h-64 relative">
                     <div className="absolute inset-0 rounded-full border border-emerald-500/20 scale-[1.5] animate-[ping_3s_infinite]"></div>
                     <div className="absolute inset-0 rounded-full border border-emerald-500/40 scale-125 animate-[ping_2s_infinite]"></div>
                     <div className="absolute inset-0 rounded-full bg-emerald-500/10 border border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)] flex items-center justify-center">
                       <Bell className="w-12 h-12 text-emerald-400" />
                       <div className="absolute top-10 right-10 w-4 h-4 bg-red-500 rounded-full border border-[#0a0a0f]"></div>
                     </div>
                  </div>
                </motion.div>

             </div>
          </div>

        </div>
      </div>

    </section>
  );
}
