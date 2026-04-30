"use client";

import { useRef } from "react";
import { AnimatePresence, m } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function NavDropdown({ title, activeDropdown, setActiveDropdown, children }) {
  const timeoutRef = useRef(null);
  const isOpen = activeDropdown === title.toLowerCase();

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(title.toLowerCase());
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 100); // Optimized delay
  };

  const handleClick = () => {
    setActiveDropdown(isOpen ? null : title.toLowerCase());
  };

  return (
    <div 
      className="relative py-2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span 
        onClick={handleClick}
        className={`hover:text-white transition-colors cursor-pointer flex items-center gap-1 group ${isOpen ? 'text-white' : ''}`}
      >
        {title} <ChevronRight className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-90' : ''}`}/>
      </span>
      
      <AnimatePresence>
        {isOpen && (
          <m.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden z-50"
          >
            {children}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
