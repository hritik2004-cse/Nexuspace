"use client";

import { AnimatePresence, m } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";

export default function MobileMenu({ isMenuOpen, setIsMenuOpen, navItems }) {
  // Body scroll lock with original state preservation
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isMenuOpen]);

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] lg:hidden bg-slate-950 flex flex-col pointer-events-auto"
        >
          {/* Overlay Header */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-white/5 shrink-0">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 cursor-pointer">
              <Image src="/favicon.ico" width={32} height={32} alt="Nexuspace Logo" className="rounded-lg object-contain" />
              <span className="text-xl font-black tracking-tight text-white">Nexuspace</span>
            </Link>

            <button 
              className="w-10 h-10 flex items-center justify-center focus:outline-none relative"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
            >
              <m.span 
                initial={{ rotate: 0 }}
                animate={{ rotate: 45, y: 0 }}
                className="w-6 h-0.5 bg-white rounded-full absolute"
              />
              <m.span 
                initial={{ rotate: 0 }}
                animate={{ rotate: -45, y: 0 }}
                className="w-6 h-0.5 bg-white rounded-full absolute"
              />
            </button>
          </div>

          {/* Menu Links */}
          <div className="flex-1 overflow-y-auto px-6 py-10 flex flex-col">
            <nav className="flex flex-col gap-8">
              {navItems.map((item, i) => (
                <m.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link 
                    href={item.href} 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-bold text-slate-100 hover:text-indigo-400 transition-colors block"
                  >
                    {item.name}
                  </Link>
                </m.div>
              ))}
            </nav>

            <div className="mt-auto pt-10 border-t border-white/5 flex flex-col gap-4">
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link 
                  href="/login" 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full py-3 flex items-center justify-center rounded-2xl bg-white/5 text-white text-base font-bold hover:bg-white/10 transition-colors"
                >
                  Log in
                </Link>
              </m.div>
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link 
                  href="/register" 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full py-3 flex items-center justify-center rounded-2xl bg-white text-black text-base font-black hover:bg-slate-200 transition-colors shadow-[0_0_30px_-10px_rgba(255,255,255,0.5)]"
                >
                  Get Started Free
                </Link>
              </m.div>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
