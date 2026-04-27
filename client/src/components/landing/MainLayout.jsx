"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import LandingNavbar from "./LandingNavbar";
import LandingFooter from "./LandingFooter";

export default function MainLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-[#030014] font-sans text-slate-100 selection:bg-indigo-500/30">
      <LandingNavbar />
      
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-1 flex flex-col relative z-10"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      <LandingFooter />
    </div>
  );
}
