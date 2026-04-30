"use client";

import { m } from "framer-motion";

// --- Apple-Style Background Rings ---
export function BackgroundRings() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
      {/* Central Base Glow */}
      <m.div 
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_70%)]" 
      />
      
      {/* Rotating Rings */}
      {[...Array(3)].map((_, i) => (
        <m.div
          key={i}
          initial={{ rotate: 0, scale: 1 }}
          animate={{ 
            rotate: i % 2 === 0 ? 360 : -360,
            scale: [1, 1.05, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            rotate: { duration: 30 + i * 10, repeat: Infinity, ease: "linear" },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute border border-white/3 rounded-full will-change-transform"
          style={{
            width: `${500 + i * 200}px`,
            height: `${500 + i * 200}px`,
          }}
        />
      ))}
    </div>
  );
}

// --- Animated Gradient Text Component ---
export function AnimatedGradientText({ children, className = "" }) {
  return (
    <m.span
      animate={{ 
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        textShadow: ["0 0 20px rgba(129,140,248,0)", "0 0 20px rgba(129,140,248,0.4)", "0 0 20px rgba(129,140,248,0)"]
      }}
      transition={{ 
        duration: 8, 
        repeat: Infinity, 
        ease: "linear" 
      }}
      className={`bg-linear-to-r from-indigo-400 via-fuchsia-400 to-indigo-400 bg-size-[200%_auto] bg-clip-text text-transparent will-change-[background-position] ${className}`}
    >
      {children}
    </m.span>
  );
}

// --- CTA Button with Apple-Style Physics ---
export function PremiumCTA({ href, children }) {
  return (
    <m.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <m.a
        href={href}
        className="group relative inline-flex h-16 items-center justify-center px-12 bg-white text-black font-black rounded-2xl text-xl overflow-hidden transition-all shadow-[0_0_0_rgba(255,255,255,0)] hover:shadow-[0_20px_50px_-10px_rgba(255,255,255,0.3)] will-change-transform"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ 
          boxShadow: [
            "0 0 0px 0px rgba(99,102,241,0)", 
            "0 0 20px 2px rgba(99,102,241,0.2)", 
            "0 0 0px 0px rgba(99,102,241,0)"
          ] 
        }}
        transition={{
          boxShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <span className="relative z-10">{children}</span>
        
        {/* Subtle Hover Glow */}
        <div className="absolute inset-0 bg-linear-to-r from-indigo-50/0 via-indigo-50/30 to-indigo-50/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      </m.a>
    </m.div>
  );
}
