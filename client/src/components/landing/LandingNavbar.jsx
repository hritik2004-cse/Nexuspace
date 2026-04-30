"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { m } from "framer-motion";
import { ArrowRight, MessageSquare, Layout, Zap, Shield, Code, Briefcase, Users } from "lucide-react";
import NavDropdown from "./NavDropdown";
import MobileMenu from "./MobileMenu";

const NAV_ITEMS = [
  { name: "Pricing", href: "/pricing" },
  { name: "Changelog", href: "/changelog" },
  { name: "Docs", href: "/docs" }
];

const MOBILE_NAV_ITEMS = [
  { name: "Platform", href: "/platform" },
  { name: "Solutions", href: "/solutions" },
  ...NAV_ITEMS
];

export default function LandingNavbar({ scrolled }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-100 transition-all duration-300 border-b ${
        scrolled 
          ? 'bg-slate-950/80 backdrop-blur-xl border-white/10 py-4 shadow-2xl' 
          : 'bg-transparent border-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 cursor-pointer relative z-50">
              <Image 
                src="/favicon.ico" 
                alt="Nexuspace Logo" 
                width={32} 
                height={32} 
                className="rounded-lg object-contain shadow-lg shadow-indigo-500/20" 
              />
              <span className="text-xl md:text-2xl font-black tracking-tight text-white">Nexuspace</span>
            </Link>
            
            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-300 relative">
              <NavDropdown 
                title="Platform" 
                activeDropdown={activeDropdown} 
                setActiveDropdown={setActiveDropdown}
              >
                <div className="p-6 grid grid-cols-2 gap-6 relative w-[500px]">
                  <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
                  
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
                  
                  <Link href="/platform" className="col-span-2 bg-white/2 border-t border-white/5 p-4 -mx-6 -mb-6 flex justify-between items-center relative z-10 group cursor-pointer hover:bg-white/4 transition-colors">
                    <span className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors">View all platform capabilities</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors group-hover:translate-x-1" />
                  </Link>
                </div>
              </NavDropdown>

              <NavDropdown 
                title="Solutions" 
                activeDropdown={activeDropdown} 
                setActiveDropdown={setActiveDropdown}
              >
                <div className="p-4 flex flex-col gap-1 relative z-10 w-[400px]">
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
              </NavDropdown>

              {NAV_ITEMS.map(item => (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={`hover:text-white transition-colors py-2 ${activeDropdown === item.name.toLowerCase() ? 'text-white' : ''}`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4 md:gap-6 relative z-50">
              <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors hidden sm:block">Log in</Link>
              <div className="hidden sm:flex">
                <Link href="/register">
                  <button className="text-sm font-bold bg-linear-to-r from-white to-slate-200 text-black px-4 md:px-6 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] flex items-center gap-2 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                    <span className="hidden xs:inline">Start Free</span><span className="xs:hidden">Join</span> <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
              
              {/* Mobile Menu Toggle */}
              <button 
                className="lg:hidden w-10 h-10 flex items-center justify-center focus:outline-none relative z-50"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle Menu"
              >
                <m.span 
                  layout
                  animate={isMenuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-6 h-0.5 bg-white rounded-full absolute"
                />
                <m.span 
                  layout
                  animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="w-6 h-0.5 bg-white rounded-full absolute"
                />
                <m.span 
                  layout
                  animate={isMenuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-6 h-0.5 bg-white rounded-full absolute"
                />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <MobileMenu 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
        navItems={MOBILE_NAV_ITEMS} 
      />
    </>
  );
}
