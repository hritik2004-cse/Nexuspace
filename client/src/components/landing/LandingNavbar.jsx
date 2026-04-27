"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowRight, Layout, MessageSquare, Shield, Zap, Code, Users, Briefcase } from "lucide-react";

export default function LandingNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  let timeoutId = null;

  useEffect(() => {
    const handleScroll = () => { setScrolled(window.scrollY > 50); };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnter = (menu) => {
    if (timeoutId) clearTimeout(timeoutId);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    timeoutId = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-slate-950/80 backdrop-blur-xl border-white/10 py-4 shadow-2xl' : 'bg-transparent border-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 cursor-pointer">
            <img src="/favicon.ico" alt="Nexuspace Logo" className="w-8 h-8 rounded-lg object-contain shadow-lg shadow-indigo-500/20" />
            <span className="text-2xl font-black tracking-tight text-white">Nexuspace</span>
          </Link>
          
          {/* Nav Links */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-300 relative">
            
            {/* Platform Dropdown */}
            <div 
              className="relative py-2"
              onMouseEnter={() => handleMouseEnter('platform')}
              onMouseLeave={handleMouseLeave}
            >
              <span className={`hover:text-white transition-colors cursor-pointer flex items-center gap-1 group ${(activeDropdown === 'platform' || pathname === '/platform') ? 'text-white' : ''}`}>
                Platform <ChevronRight className={`w-3 h-3 transition-transform ${activeDropdown === 'platform' ? 'rotate-90' : ''}`}/>
              </span>
              
              <AnimatePresence>
                {activeDropdown === 'platform' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[500px] bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden z-50"
                  >
                    <div className="p-6 grid grid-cols-2 gap-6 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
                      
                      <div className="flex flex-col gap-2 relative z-10">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Features</h4>
                        <Link href="/workspace" className="group flex items-start gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-slate-200 group-hover:text-white">Real-time Chat</h5>
                            <p className="text-xs text-slate-400 mt-0.5">Instant messaging & channels.</p>
                          </div>
                        </Link>
                        <Link href="/workspace" className="group flex items-start gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                          <div className="p-2 rounded-lg bg-fuchsia-500/10 text-fuchsia-400 group-hover:bg-fuchsia-500 group-hover:text-white transition-colors">
                            <Layout className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-slate-200 group-hover:text-white">Kanban Boards</h5>
                            <p className="text-xs text-slate-400 mt-0.5">Drag & drop visual tracking.</p>
                          </div>
                        </Link>
                      </div>

                      <div className="flex flex-col gap-2 relative z-10">
                         <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Infrastructure</h4>
                         <Link href="/" className="group flex items-start gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <Zap className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-slate-200 group-hover:text-white">Edge Sync</h5>
                            <p className="text-xs text-slate-400 mt-0.5">Sub-millisecond state updates.</p>
                          </div>
                        </Link>
                        <Link href="/" className="group flex items-start gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-slate-200 group-hover:text-white">Security</h5>
                            <p className="text-xs text-slate-400 mt-0.5">Enterprise-grade isolation.</p>
                          </div>
                        </Link>
                      </div>
                    </div>
                    <Link href="/platform" className="bg-white/[0.02] border-t border-white/5 p-4 flex justify-between items-center relative z-10 group cursor-pointer hover:bg-white/[0.04] transition-colors block">
                      <span className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors">View all platform capabilities</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors group-hover:translate-x-1" />
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Solutions Dropdown */}
            <div 
              className="relative py-2"
              onMouseEnter={() => handleMouseEnter('solutions')}
              onMouseLeave={handleMouseLeave}
            >
              <span className={`hover:text-white transition-colors cursor-pointer flex items-center gap-1 group ${(activeDropdown === 'solutions' || pathname === '/solutions') ? 'text-white' : ''}`}>
                Solutions <ChevronRight className={`w-3 h-3 transition-transform ${activeDropdown === 'solutions' ? 'rotate-90' : ''}`}/>
              </span>
              
              <AnimatePresence>
                {activeDropdown === 'solutions' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[400px] bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden z-50"
                  >
                    <div className="p-4 flex flex-col gap-1 relative z-10">
                       <Link href="/" className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                            <Code className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-slate-200 group-hover:text-white">For Engineering</h5>
                            <p className="text-xs text-slate-400 mt-0.5">Ship faster with integrated code discussions.</p>
                          </div>
                       </Link>
                       <Link href="/" className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 group-hover:scale-110 transition-transform">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-slate-200 group-hover:text-white">For Product Teams</h5>
                            <p className="text-xs text-slate-400 mt-0.5">Align roadmaps with daily execution.</p>
                          </div>
                       </Link>
                       <Link href="/" className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-slate-200 group-hover:text-white">For Agencies</h5>
                            <p className="text-xs text-slate-400 mt-0.5">Client-isolated sandboxes and comms.</p>
                          </div>
                       </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/pricing" className={`hover:text-white transition-colors py-2 ${pathname === '/pricing' ? 'text-white' : ''}`}>Pricing</Link>
            <Link href="/changelog" className={`hover:text-white transition-colors py-2 ${pathname === '/changelog' ? 'text-white' : ''}`}>Changelog</Link>
            <Link href="/docs" className={`hover:text-white transition-colors py-2 ${pathname === '/docs' ? 'text-white' : ''}`}>Docs</Link>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors hidden sm:block">Log in</Link>
            <Link href="/register">
              <button className="text-sm font-bold bg-gradient-to-r from-white to-slate-200 text-black px-6 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] flex items-center gap-2 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                Start Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
