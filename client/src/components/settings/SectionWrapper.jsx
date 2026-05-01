"use client";

import { motion } from 'framer-motion';

export default function SectionWrapper({ title, description, children, id }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-6"
    >
      <div className="space-y-1">
        <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight uppercase">{title}</h2>
        {description && <p className="text-[#64748B] text-sm font-medium">{description}</p>}
      </div>
      
      <div className="bg-surface border border-border/50 rounded-3xl p-4 md:p-8 shadow-sm relative overflow-hidden group/section">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 blur-3xl rounded-full group-hover/section:bg-primary/10 transition-colors duration-700"></div>
        
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </motion.section>
  );
}
