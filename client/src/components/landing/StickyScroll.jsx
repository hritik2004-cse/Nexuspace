"use client";

import { motion, useScroll, useMotionValueEvent, AnimatePresence, m } from "framer-motion";
import { useRef, useState } from "react";
import { MessageSquare, LayoutDashboard, Bell, Activity } from "lucide-react";
import ChannelsPreview from "./ChannelsPreview";
import WorkloadsPreview from "./WorkloadsPreview";
import NotificationsPreview from "./NotificationsPreview";

export default function StickyScroll() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ 
    target: targetRef, 
    offset: ["start start", "end end"] 
  });

  const content = [
    {
      title: "Instant Channels",
      description: "Launch secure chat threads natively coupled with your codebase. No context switching. Complete encapsulation.",
      icon: <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />,
      Preview: ChannelsPreview
    },
    {
      title: "Intelligent Workloads",
      description: "Tasks move dynamically at edge speed. Assign tickets without opening separate applications. Everything is in sync.",
      icon: <LayoutDashboard className="w-5 h-5 md:w-6 md:h-6 text-fuchsia-400" />,
      Preview: WorkloadsPreview
    },
    {
      title: "Unified Notification Mesh",
      description: "Ping, mention, and alert teams globally. The WebSocket engine resolves your latency bottlenecks.",
      icon: <Bell className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />,
      Preview: NotificationsPreview
    }
  ];

  const [activeCard, setActiveCard] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const index = Math.min(Math.floor(latest * 3), 2);
    if (index !== activeCard) setActiveCard(index);
  });

  return (
    <div ref={targetRef} className="relative w-full md:h-[400vh] bg-[#030014] z-10">
      {/* Desktop Sticky Version */}
      <div className="hidden md:flex sticky top-0 h-screen w-full items-center overflow-hidden z-20">
        <div className="max-w-[1400px] mx-auto px-6 w-full flex flex-row gap-16 items-stretch relative">
          
          {/* Left Column: Titles Stack */}
          <div className="w-[40%] flex flex-col justify-center relative">
             <div className="flex items-center gap-2 mb-12">
               <Activity className="text-indigo-500 w-5 h-5 animate-pulse" /> 
               <span className="text-sm font-bold uppercase tracking-widest text-slate-400">The Nexuspace Paradigm</span>
             </div>
             
              <div className="flex flex-col gap-12 relative">
                {content.map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={false}
                    animate={{ 
                      opacity: activeCard === idx ? 1 : 0.35,
                      x: activeCard === idx ? 0 : -8,
                      scale: activeCard === idx ? 1 : 0.98,
                      filter: activeCard === idx ? "blur(0px)" : "blur(1px)"
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex flex-col items-start relative"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-6 transition-all duration-500 ${activeCard === idx ? 'bg-indigo-500/20 border-indigo-500/40' : 'bg-white/5 border-white/5'} border`}>
                      {item.icon}
                    </div>
                    <h2 className={`text-4xl font-black mb-4 leading-tight tracking-tighter transition-colors duration-500 ${activeCard === idx ? 'text-white' : 'text-slate-500'}`}>
                      {item.title}
                    </h2>
                    <p className={`text-base font-light leading-relaxed transition-colors duration-500 ${activeCard === idx ? 'text-slate-300' : 'text-slate-600'}`}>
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </div>
          </div>

          {/* Right Column: Sticky Preview */}
          <div className="w-[60%] flex items-center justify-center relative">
             <div className="w-full h-[65vh] rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl shadow-indigo-500/10 bg-slate-950/20">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCard}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.02, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full relative"
                  >
                    {(() => {
                      const ActivePreview = content[activeCard].Preview;
                      return <ActivePreview key={`preview-${activeCard}`} />;
                    })()}
                  </motion.div>
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
