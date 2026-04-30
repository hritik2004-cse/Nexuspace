"use client";

import { m, useScroll, useMotionValueEvent } from "framer-motion";
import { useRef, useState } from "react";
import { MessageSquare, LayoutDashboard, Bell, Activity } from "lucide-react";
import GlassDashboard from "./GlassDashboard";

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

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cards = content.length;
    const breakPoint = 1 / cards;
    let index = Math.floor(latest / breakPoint);
    if (index >= cards) index = cards - 1;
    if (index < 0) index = 0;
    setActiveCard(index);
  });

  return (
    <div ref={targetRef} className="relative z-10 w-full md:h-[300vh] bg-[#030014]">
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden z-20">
        <div className="max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row gap-8 md:gap-20 items-center md:items-stretch">
          
          <div className="w-full md:w-[45%] flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-8">
               <Activity className="text-indigo-500 w-5 h-5 animate-pulse" /> 
               <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-300">The Nexuspace Paradigm</span>
             </div>
             
             <div className="relative md:min-h-[350px] w-full">
               {content.map((item, idx) => (
                 <m.div 
                   key={idx}
                   initial={false}
                   animate={{ 
                     opacity: activeCard === idx ? 1 : 0, 
                     y: activeCard === idx ? 0 : 20,
                     scale: activeCard === idx ? 1 : 0.95
                   }}
                   transition={{ duration: 0.5, ease: "easeOut" }}
                   className={`md:absolute top-0 left-0 w-full ${activeCard === idx ? 'pointer-events-auto' : 'pointer-events-none'}`}
                 >
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        {item.icon}
                      </div>
                   </div>
                   <h2 className="text-2xl md:text-5xl font-black text-white mb-6 leading-tight">{item.title}</h2>
                   <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed">{item.description}</p>
                 </m.div>
               ))}
             </div>
          </div>

          <div className="w-full md:w-[55%] flex items-center justify-center relative">
             <div className="w-full aspect-square md:aspect-video rounded-3xl overflow-hidden relative group">
                <GlassDashboard activeScene={activeCard} />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
