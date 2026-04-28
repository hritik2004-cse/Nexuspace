"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Layout, MessageSquare, Trello, Zap, ChevronRight, Activity, Globe, Cpu, CheckCircle2, Star, Shield, Command, Github, Twitter, Linkedin, Hexagon, Triangle } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { TESTIMONIALS, INTEGRATION_LOGOS } from "@/constants/assets";

// --- Lazy Loaded Heavy Landing Components ---
const LivePreview = dynamic(() => import('@/components/landing/LivePreview'), { ssr: false });
import MainLayout from "@/components/landing/MainLayout";
import HowItWorks from "@/components/landing/HowItWorks";
import ComparisonTable from "@/components/landing/ComparisonTable";
import StickyScroll from "@/components/landing/StickyScroll";
import TrustMetrics from "@/components/landing/TrustMetrics";

// --- Custom Spotlight Card Component ---
function SpotlightCard({ children, className = "" }) {
  const divRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current || isFocused) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => { setIsFocused(true); setOpacity(1); };
  const handleBlur = () => { setIsFocused(false); setOpacity(0); };
  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/2 ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-500"
        style={{
          opacity,
          background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(120,119,198,0.15), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
}

// --- Main Landing Page ---
export default function Home() {
  const containerRef = useRef(null);

  // Advanced Scroll Transforms wrapped in smooth Springs
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  
  const heroOpacity = useTransform(smoothProgress, [0, 0.1], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.1], [1, 0.9]);
  
  // 3D Dashboard Perspective Roll
  const dashboardY = useTransform(smoothProgress, [0, 0.25], [0, -100]);
  const dashboardRotateX = useTransform(smoothProgress, [0, 0.25], [30, 0]);
  const dashboardScale = useTransform(smoothProgress, [0, 0.25], [0.9, 1]);

  // Subtle Global Hover Cursor
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const handleGlobalMouseMove = (e) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  };
  useEffect(() => {
    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, []);

  return (
    <MainLayout>
      <div ref={containerRef} className="relative w-full overflow-clip">
      
      {/* Subtle Global Cursor Glow */}
      <motion.div 
        animate={{ x: cursorPos.x - 300, y: cursorPos.y - 300 }}
        transition={{ type: "tween", ease: "backOut", duration: 0 }}
        className="fixed top-0 left-0 w-[600px] h-[600px] bg-white/2 rounded-full blur-[100px] pointer-events-none z-0 hidden lg:block"
      />

      {/* Hyper-Minimal Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>

      {/* Hero Master */}
      <section aria-labelledby="hero-heading" className="relative z-10 pt-48 pb-10 flex flex-col items-center justify-center min-h-[90vh]">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="w-full flex flex-col items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md mb-8 shadow-[0_0_30px_-5px_rgba(79,70,229,0.3)] cursor-pointer hover:bg-indigo-500/20 transition-colors"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-indigo-200 text-xs font-bold tracking-widest uppercase">Nexuspace Edge 2.0 is live</span>
          </motion.div>

          <motion.h1 
            id="hero-heading"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-6xl sm:text-7xl md:text-[8rem] font-black tracking-tighter leading-[0.95] text-center text-white max-w-5xl"
          >
             Synchronize 
             <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-purple-300 to-white block px-4">
               your flow state.
             </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mt-8 text-xl text-slate-400 max-w-2xl text-center font-light leading-relaxed px-4"
          >
            The world's most agonizingly fast command center. Real-time tasks, instant messaging, and isolated scopes in a brutally minimal engine.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/workspace">
              <button aria-label="Start Building Your Workspace" className="group flex items-center justify-center gap-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-5 rounded-full text-lg lg:text-xl font-bold transition-all shadow-[0_0_50px_-10px_rgba(79,70,229,0.6)] hover:shadow-[0_0_80px_-15px_rgba(79,70,229,0.8)]">
                Start Building Your Workspace in 10 Seconds
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </button>
            </Link>
            <button aria-label="Book a Demo" className="group flex items-center justify-center gap-2 bg-linear-to-b from-[#1a1a24] to-[#0a0a0f] border border-white/10 hover:from-white/10 hover:to-white/5 text-white px-10 py-5 rounded-full text-xl font-bold transition-all">
              Book a Demo
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Infinite Marquee Logos */}
      <section aria-label="Integration Partners" className="relative z-10 w-full overflow-hidden py-10 border-y border-white/5 bg-slate-950/30 backdrop-blur-md">
        <div className="absolute left-0 w-32 h-full bg-linear-to-r from-[#030014] to-transparent z-10 top-0"></div>
        <div className="absolute right-0 w-32 h-full bg-linear-to-l from-[#030014] to-transparent z-10 top-0"></div>
        
        <div className="flex gap-20 whitespace-nowrap px-8 w-[200%] animate-[marquee_20s_linear_infinite]">
          {[...INTEGRATION_LOGOS, ...INTEGRATION_LOGOS].map((company, i) => (
            <div key={i} className="flex items-center gap-3 text-slate-500 opacity-60 font-black text-xl tracking-tighter uppercase grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
              <Command className="w-6 h-6" aria-hidden="true" /> {company}
            </div>
          ))}
        </div>
      </section>

      {/* 3D Masterpiece Mockup */}
      <section aria-label="Dashboard Preview" className="relative z-10 w-full flex justify-center pb-32">
        <motion.div 
          style={{ y: dashboardY, rotateX: dashboardRotateX, scale: dashboardScale }}
          className="mt-24 w-full max-w-6xl px-6 perspective-1000 origin-top"
        >
          <div className="w-full aspect-video rounded-2xl border border-white/10 bg-slate-950/80 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] overflow-hidden backdrop-blur-2xl relative custom-3d-shadow">
            {/* Mock Header */}
            <div className="h-12 border-b border-white/5 flex items-center px-4 gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="h-6 w-64 bg-white/5 rounded-full border border-white/5 flex items-center px-3">
                  <div className="w-3 h-3 rounded-sm bg-white/20 mr-2"></div>
                  <div className="w-32 h-2 rounded-full bg-white/10"></div>
                </div>
              </div>
            </div>
            
            {/* Mock Body */}
            <div className="flex h-[calc(100%-3rem)]">
              <div className="w-64 border-r border-white/5 p-4 flex flex-col gap-6">
                <div>
                  <div className="w-32 h-4 rounded bg-indigo-500/20 mb-3"></div>
                  <div className="space-y-2">
                    <div className="w-full h-8 rounded bg-white/5"></div>
                    <div className="w-4/5 h-8 rounded bg-transparent border border-white/5"></div>
                  </div>
                </div>
                <div className="mt-auto flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-linear-to-tr from-purple-500 to-indigo-500"></div>
                   <div className="w-24 h-3 rounded bg-white/10"></div>
                </div>
              </div>
              <div className="flex-1 p-8 grid grid-cols-3 gap-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-blend-overlay">
                 <div className="flex flex-col gap-4">
                   <div className="w-24 h-4 rounded bg-white/20 mb-2"></div>
                   <div className="w-full h-24 rounded-lg bg-white/3 border border-white/10 animate-pulse delay-75"></div>
                   <div className="w-full h-32 rounded-lg bg-white/3 border border-white/10"></div>
                 </div>
                 <div className="flex flex-col gap-4">
                   <div className="w-32 h-4 rounded bg-indigo-400 mb-2 shadow-[0_0_20px_rgba(129,140,248,0.5)]"></div>
                   <div className="w-full h-40 rounded-lg bg-indigo-500/10 border border-indigo-500/20 shadow-lg relative overflow-hidden flex items-center justify-center">
                     <Triangle className="absolute text-indigo-500/20 w-32 h-32 rotate-180 mix-blend-screen" />
                     <Hexagon className="absolute text-purple-500/20 w-24 h-24 rotate-45 mix-blend-screen" />
                     <motion.div animate={{y: [0, 40, 0]}} transition={{repeat: Infinity, duration: 4}} className="absolute inset-0 bg-linear-to-b from-transparent via-white/5 to-transparent w-full h-full"></motion.div>
                   </div>
                 </div>
                 <div className="flex flex-col gap-4">
                   <div className="w-20 h-4 rounded bg-white/20 mb-2"></div>
                   <div className="w-full h-20 rounded-lg bg-white/3 border border-white/10"></div>
                 </div>
              </div>
            </div>
            
            <div className="absolute inset-0 bg-linear-to-tr from-indigo-500/10 via-transparent to-transparent pointer-events-none"></div>
          </div>
        </motion.div>
      </section>

      <TrustMetrics />
      
      <StickyScroll />

      <LivePreview />
      
      <HowItWorks />
      
      <ComparisonTable />

      {/* Master Grid Spotlight Features */}
      <section aria-labelledby="infrastructure-heading" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-20">
          <h2 id="infrastructure-heading" className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">Unrivaled Infrastructure.</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">We ripped out the legacy stacks. Nexuspace is built entirely on edge-rendered WebSockets and highly available NoSQL layers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Large Card */}
          <SpotlightCard className="md:col-span-2 md:row-span-2 p-10 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                <Globe className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-3xl font-bold text-white tracking-tight mb-4">Edge Synchronized States</h3>
              <p className="text-lg text-slate-400 max-w-md">Your entire workspace shares a singular source of truth. The millisecond a task moves or a letter is typed, our backend propagates the event worldwide.</p>
            </div>
            <div className="mt-12 h-64 border border-white/10 rounded-2xl bg-[#0a0a0f] p-4 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent)]"></div>
              <div className="flex flex-col sm:flex-row items-center gap-12 w-full justify-center">
                <div className="flex flex-col gap-6">
                  <div className="w-40 h-12 border border-white/10 rounded-lg flex items-center pl-4 gap-3 bg-white/5 shadow-xl"><div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div> User Alpha</div>
                  <div className="w-40 h-12 border border-white/10 rounded-lg flex items-center pl-4 gap-3 bg-white/5 shadow-xl"><div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping"></div> User Beta</div>
                </div>
                <div className="h-px bg-linear-to-r from-transparent via-indigo-500 to-transparent flex-1 relative hidden sm:block">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_20px_#6366f1] animate-[ping_2s_infinite]"></div>
                </div>
                <div className="w-40 h-40 border-4 border-indigo-500/30 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.2)] relative z-10 bg-[#0a0a0f]">
                  <Cpu className="text-indigo-400 w-12 h-12" />
                </div>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-8 group">
             <Layout className="text-purple-400 w-10 h-10 mb-6 group-hover:scale-110 transition-transform" />
             <h3 className="text-2xl font-bold text-white mb-3">Modular Sandboxing</h3>
             <p className="text-slate-400 leading-relaxed font-medium">Instantly branch off entirely separate Workspaces for private clients or secure internal ops without cross-pollution.</p>
          </SpotlightCard>

          <SpotlightCard className="p-8 group">
             <Activity className="text-emerald-400 w-10 h-10 mb-6 group-hover:scale-110 transition-transform" />
             <h3 className="text-2xl font-bold text-white mb-3">Live Presence</h3>
             <p className="text-slate-400 leading-relaxed font-medium">View granular user activity. Offline checks, typing events, and active-read states handled efficiently.</p>
          </SpotlightCard>
        </div>
      </section>

      {/* New Major Visual Section */}
      <section aria-labelledby="sync-heading" className="relative z-10 w-full py-32 border-y border-white/5 bg-[#030014]/50 backdrop-blur-3xl overflow-hidden mt-32">
         <div className="max-w-7xl mx-auto px-6 relative flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2 relative z-10">
               <div className="w-16 h-16 rounded-2xl bg-fuchsia-500/20 flex items-center justify-center mb-8 border border-fuchsia-500/30">
                 <Activity className="text-fuchsia-400 w-8 h-8" />
               </div>
               <h2 id="sync-heading" className="text-4xl md:text-6xl font-black text-white leading-tight mb-8">
                 Uncompromising <br /><span className="text-transparent bg-clip-text bg-linear-to-r from-fuchsia-400 to-indigo-400">Data Synchronization</span>
               </h2>
               <p className="text-slate-400 text-xl font-light leading-relaxed mb-10">
                 Our real-time engine pipes millions of WebSockets across geographic zones globally. Whether you are typing a paragraph or dragging a heavy Kanban card, your team perceives it identically sub-millisecond.
               </p>
               <button aria-label="Explore the infrastructure" className="text-white font-bold tracking-wide hover:text-fuchsia-400 flex items-center gap-2 group transition-colors">
                 Explore the Infrastructure <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" aria-hidden="true" />
               </button>
            </div>
            <div className="md:w-1/2 relative">
               <div className="absolute inset-0 bg-fuchsia-500/10 blur-[100px] rounded-full scale-150"></div>
               <Image src="/realtime_sync.png" alt="Illustration of realtime synchronization nodes connected globally" width={800} height={600} sizes="(max-width: 768px) 100vw, 50vw" className="w-full h-auto rounded-3xl relative z-10 border border-white/10 shadow-[0_0_80px_rgba(192,38,211,0.2)] object-cover mix-blend-screen scale-110" />
            </div>
         </div>
      </section>

      {/* Pricing Section */}
      <section aria-labelledby="pricing-heading" className="relative z-10 max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 id="pricing-heading" className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">Pricing built for flow.</h2>
          <p className="text-slate-400 text-lg">Predictable scaling for individuals and global enterprises alike.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Free Tier */}
          <div className="p-8 rounded-3xl border border-white/10 bg-white/2 flex flex-col items-start hover:border-white/20 transition-colors">
            <h3 className="text-2xl font-bold text-white font-sans">Starter</h3>
            <div className="mt-4 flex items-end gap-1">
              <span className="text-5xl font-black text-white">$0</span>
              <span className="text-slate-400 mb-1">/ forever</span>
            </div>
            <p className="mt-4 text-slate-400 h-12">Essential tools for independent developers.</p>
            <div className="w-full h-px bg-white/10 my-6"></div>
            <ul className="space-y-4 mb-8 w-full">
              {['1 Workspace', 'Unlimited Channels', 'Basic Kanban', '1 Week Message History'].map(feat => (
                <li key={feat} className="flex gap-3 text-slate-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" aria-hidden="true" /> {feat}
                </li>
              ))}
            </ul>
            <button aria-label="Get started with starter plan for free" className="w-full py-4 mt-auto rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 transition-colors">Get Started Free</button>
          </div>

          {/* Pro Tier */}
          <div className="p-8 rounded-3xl border border-white/20 bg-white/3 flex flex-col items-start relative shadow-2xl scale-105 z-10 backdrop-blur-md">
            <div className="absolute top-0 right-0 py-1.5 px-4 bg-white/10 text-white text-xs font-bold rounded-bl-xl rounded-tr-3xl uppercase tracking-widest border-b border-l border-white/10">Most Popular</div>
            <h3 className="text-2xl font-bold text-white font-sans">Professional</h3>
            <div className="mt-4 flex items-end gap-1">
              <span className="text-5xl font-black text-white">$12</span>
              <span className="text-slate-400 mb-1">/ user / mo</span>
            </div>
            <p className="mt-4 text-slate-400 h-12">The complete toolkit for scaling teams.</p>
            <div className="w-full h-px bg-white/10 my-6"></div>
            <ul className="space-y-4 mb-8 w-full">
              {['Unlimited Workspaces', 'Unlimited History', 'Advanced Kanban Analytics', 'Priority WebSocket Lanes', 'Custom Role RBAC'].map(feat => (
                <li key={feat} className="flex gap-3 text-white font-medium">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" aria-hidden="true" /> {feat}
                </li>
              ))}
            </ul>
            <button aria-label="Start professional plan trial" className="w-full py-4 mt-auto rounded-xl bg-white text-black hover:bg-slate-200 font-bold transition-all shadow-lg hover:scale-[1.02]">Start Pro Trial</button>
          </div>

          {/* Enterprise Tier */}
          <div className="p-8 rounded-3xl border border-white/10 bg-white/2 flex flex-col items-start hover:border-white/20 transition-colors">
            <h3 className="text-2xl font-bold text-white font-sans">Enterprise</h3>
            <div className="mt-4 flex items-end gap-1">
              <span className="text-5xl font-black text-white">Custom</span>
            </div>
            <p className="mt-4 text-slate-400 h-12">Dedicated support and unmetered limits.</p>
            <div className="w-full h-px bg-white/10 my-6"></div>
            <ul className="space-y-4 mb-8 w-full">
              {['Dedicated VPC', 'SSO & SAML', 'Unlimited Everything', '99.99% SLA', '24/7 Phone Support'].map(feat => (
                <li key={feat} className="flex gap-3 text-slate-300 font-medium">
                  <Shield className="w-5 h-5 text-indigo-400 shrink-0" aria-hidden="true" /> {feat}
                </li>
              ))}
            </ul>
            <button aria-label="Contact sales for enterprise plan" className="w-full py-4 mt-auto rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 transition-colors">Contact Sales</button>
          </div>
        </div>
      </section>

      {/* Social / Testimonial Wall Carousel */}
      <section aria-labelledby="testimonials-heading" className="relative z-10 border-y border-white/5 bg-slate-950/50 backdrop-blur-md py-24 overflow-hidden">
         <div className="text-center mb-16">
            <h2 id="testimonials-heading" className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Loved by engineering teams.</h2>
         </div>
         {/* Marquee Reverse */}
         <div className="flex gap-6 whitespace-nowrap px-8 w-max animate-[marquee_40s_linear_infinite_reverse] items-stretch">
           {[...TESTIMONIALS, ...TESTIMONIALS].map((review, i) => (
             <div key={`${review.id}-${i}`} className="w-96 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm shrink-0 flex flex-col hover:bg-white/10 transition-colors shadow-xl shadow-black/50">
               <div className="flex items-center gap-1 mb-4" aria-label={`Rating: ${review.rating} out of 5 stars`}>
                 {[...Array(review.rating)].map((_, s) => <Star key={s} className="w-4 h-4 fill-amber-500 text-amber-500" aria-hidden="true" />)}
               </div>
               <p className="text-lg text-slate-300 font-medium whitespace-normal mb-8 flex-1 italic relative z-10">"{review.quote}"</p>
               <div className="flex items-center gap-4 mt-auto border-t border-white/5 pt-4">
                 <Image src={review.avatar} alt={`Avatar of ${review.name}`} width={48} height={48} className="w-12 h-12 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)] object-cover border border-white/10" />
                 <div>
                   <h4 className="font-bold text-white text-sm tracking-wide">{review.name}</h4>
                   <p className="text-xs text-slate-400">{review.role}</p>
                 </div>
               </div>
               
               {/* Decorative Graphic Element relative to box */}
               <div className="absolute right-0 bottom-0 pointer-events-none opacity-[0.03]">
                  <Hexagon className="w-48 h-48 translate-x-12 translate-y-12" aria-hidden="true" />
               </div>
             </div>
           ))}
         </div>
      </section>

      </div>
      {/* Global Style overrides for Tailwind arbitrary animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
      `}} />
    </MainLayout>
  );
}
