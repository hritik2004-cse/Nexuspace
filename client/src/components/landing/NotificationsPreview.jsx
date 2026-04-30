import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Hash, Sparkles, Activity } from "lucide-react";
import { useState, useRef } from "react";
import Image from "next/image";

export default function NotificationsPreview() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

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
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.1), transparent 80%)`
        }}
      />

      {/* Sidebar - Activity Focused */}
      <div className="w-14 md:w-64 border-r border-white/5 bg-white/2 flex flex-col p-2 md:p-4 shrink-0 relative z-10">
        <div className="flex items-center gap-3 mb-6 md:mb-8 px-1 md:px-2">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
            <Image src="/web-app-manifest-512x512.png" alt="Logo" width={20} height={20} />
          </div>
          <span className="font-black text-white hidden md:block text-lg">Nexuspace</span>
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3 p-3 rounded-xl text-slate-500 hover:bg-white/5 transition-colors">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-bold hidden md:block">Feed</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
            <Bell className="w-4 h-4" />
            <span className="text-sm font-bold hidden md:block">Notifications</span>
          </div>
        </div>

        <div className="mt-auto p-1 flex justify-center">
          <div className="w-10 h-10 md:w-full md:h-14 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center md:justify-start gap-2 md:gap-3 px-0 md:px-3">
             <div className="w-6 h-6 md:w-9 md:h-9 rounded-full border border-white/10 overflow-hidden relative shrink-0 aspect-square">
               <Image src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&auto=format&fit=crop" alt="User" fill sizes="36px" className="object-cover" />
             </div>
             <div className="hidden md:block">
               <div className="text-xs font-black text-white">Jane Doe</div>
               <div className="text-[10px] text-slate-500 font-bold">Admin</div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="h-12 md:h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-6 bg-white/1">
          <div className="flex items-center gap-3 md:gap-4">
            <Bell className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
            <h2 className="font-bold text-white text-xs md:text-base tracking-tight">Notification Mesh</h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-7 h-7 md:w-9 md:h-9 rounded-full border border-white/10 overflow-hidden relative shrink-0 aspect-square">
               <Image src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&auto=format&fit=crop" alt="User" fill sizes="36px" className="object-cover" />
               <span className="absolute bottom-0 right-0 w-2 md:w-2.5 md:h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-hidden flex flex-col items-center justify-center">
            <div className="relative">
                {/* Pulsing Ripple Effect */}
                <motion.div 
                    animate={{ scale: [1, 2.5, 1], opacity: [0.2, 0, 0.2] }} 
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl scale-[3]"
                />
                <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-slate-900/40 border border-white/10 flex items-center justify-center relative z-10 backdrop-blur-2xl shadow-[0_0_50px_-10px_rgba(16,185,129,0.2)] overflow-hidden"
                >
                    <div className="absolute inset-0 bg-linear-to-b from-emerald-500/10 to-transparent" />
                    <Bell className="w-10 h-10 md:w-16 md:h-16 text-emerald-400 animate-bounce" />
                    <motion.div 
                       animate={{ opacity: [0, 1, 0], y: [20, -20, -40] }}
                       transition={{ duration: 2, repeat: Infinity }}
                       className="absolute top-1/4 right-1/4"
                    >
                       <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-emerald-300 shadow-emerald-500" />
                    </motion.div>
                </motion.div>

                {/* Notification Badge */}
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 md:-top-4 md:-right-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-emerald-500 flex items-center justify-center text-sm md:text-lg font-black text-white border-2 md:border-4 border-slate-950 shadow-xl shadow-emerald-500/30 z-20"
                >
                    12
                </motion.div>

                {/* Orbital Dots */}
                {[0, 120, 240].map((angle, i) => (
                    <motion.div
                        key={i}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 pointer-events-none"
                    >
                        <div 
                            className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] translate-x-[70px] md:translate-x-[120px]"
                        />
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 text-center space-y-2 relative z-10">
                <h3 className="text-xl font-black text-white">Unified Pulse Engine</h3>
                <p className="text-slate-400 text-sm font-bold tracking-wide">Syncing globally across 12 clusters</p>
            </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-emerald-500/5 via-transparent to-transparent" />
    </motion.div>
  );
}
