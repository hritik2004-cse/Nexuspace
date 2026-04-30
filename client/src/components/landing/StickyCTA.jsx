"use client";

import { AnimatePresence, m } from "framer-motion";
import Link from "next/link";

export default function StickyCTA({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <m.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-4 left-0 right-0 z-[60] px-6 lg:hidden"
        >
          <div className="max-w-md mx-auto bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 flex gap-1.5 shadow-2xl shadow-indigo-500/30">
            <Link href="/register" className="flex-1">
              <button className="w-full h-12 bg-white text-black font-black rounded-xl active:scale-95 transition-transform">
                Start Free
              </button>
            </Link>
            <Link href="/demo" className="flex-1">
              <button className="w-full h-12 bg-slate-900 border border-white/10 text-white font-bold rounded-xl active:scale-95 transition-transform">
                Book Demo
              </button>
            </Link>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
