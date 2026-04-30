"use client";

import { m, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { MessageSquare, LayoutDashboard, Bell, Activity } from "lucide-react";
import ChannelsPreview from "./ChannelsPreview";
import WorkloadsPreview from "./WorkloadsPreview";
import NotificationsPreview from "./NotificationsPreview";

const content = [
  {
    title: "Instant Channels",
    description: "Launch secure chat threads natively coupled with your codebase. No context switching. Complete encapsulation.",
    icon: <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />,
    preview: <ChannelsPreview />
  },
  {
    title: "Intelligent Workloads",
    description: "Tasks move dynamically at edge speed. Assign tickets without opening separate applications. Everything is in sync.",
    icon: <LayoutDashboard className="w-5 h-5 md:w-6 md:h-6 text-fuchsia-400" />,
    preview: <WorkloadsPreview />
  },
  {
    title: "Unified Notification Mesh",
    description: "Ping, mention, and alert teams globally. The WebSocket engine resolves your latency bottlenecks.",
    icon: <Bell className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />,
    preview: <NotificationsPreview />
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
      {/* Desktop Sticky Version */}
      <div className="hidden md:flex sticky top-0 h-screen w-full items-center overflow-hidden z-20">
        <div className="max-w-[1400px] mx-auto px-6 w-full flex flex-row gap-16 items-stretch">
          <div className="w-[35%] flex flex-col justify-center">
             <div className="flex items-center gap-2 mb-8">
               <Activity className="text-indigo-500 w-5 h-5 animate-pulse" /> 
               <span className="text-sm font-bold uppercase tracking-widest text-slate-400">The Nexuspace Paradigm</span>
             </div>
             
              <div className="relative min-h-[400px] w-full">
                {content.map((item, idx) => (
                  <m.div 
                    key={idx}
                    initial={false}
                    animate={{ 
                      opacity: activeCard === idx ? 1 : 0, 
                      y: activeCard === idx ? 0 : 20,
                      scale: activeCard === idx ? 1 : 0.95,
                      filter: activeCard === idx ? "blur(0px)" : "blur(8px)"
                    }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className={`absolute top-0 left-0 w-full flex flex-col items-start ${activeCard === idx ? 'pointer-events-auto' : 'pointer-events-none'}`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-lg shadow-indigo-500/5">
                      {item.icon}
                    </div>
                    <h2 className="text-5xl font-black text-white mb-6 leading-tight tracking-tighter">{item.title}</h2>
                    <p className="text-xl text-slate-400 font-light leading-relaxed">{item.description}</p>
                  </m.div>
                ))}
              </div>
          </div>

          <div className="w-[65%] flex items-center justify-center relative">
             <div className="w-full h-[68vh] rounded-4xl overflow-hidden relative group border border-white/10 shadow-2xl shadow-indigo-500/10 transition-all duration-500">
                <AnimatePresence mode="wait">
                  <m.div
                    key={activeCard}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full"
                  >
                    {content[activeCard].preview}
                  </m.div>
                </AnimatePresence>
             </div>
          </div>
        </div>
      </div>

      {/* Mobile Vertical Flow Version */}
      <div className="md:hidden w-full px-6 py-10 space-y-16">
        {content.map((item, idx) => (
          <div key={idx} className="space-y-8">
            <div className="space-y-4 text-center">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
                  <div className="w-5 h-5">{item.icon}</div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.title}</span>
               </div>
               <h3 className="text-4xl font-black text-white tracking-tight">{item.title}</h3>
               <p className="text-slate-400 text-base font-light leading-relaxed max-w-xs mx-auto">{item.description}</p>
            </div>
            <div className="w-full h-[450px] rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl">
               {item.preview}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
