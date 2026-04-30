"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { LazyMotion, domAnimation, m, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, MessageSquare, Zap, CheckCircle2, Globe, Cpu, Shield, Users, Activity } from "lucide-react";
import { useRef, useState, useEffect } from "react";

import MainLayout from "@/components/landing/MainLayout";
import Section from "@/components/landing/Section";
import StickyCTA from "@/components/landing/StickyCTA";
import { BackgroundRings, AnimatedGradientText, PremiumCTA } from "@/components/landing/EnergyEffects";
import GlassDashboard from "@/components/landing/GlassDashboard";

// --- Lazy Loaded Heavy Landing Components ---
const LivePreview = dynamic(() => import('@/components/landing/LivePreview'), { ssr: false });
const HowItWorks = dynamic(() => import('@/components/landing/HowItWorks'), { ssr: false });
const ComparisonTable = dynamic(() => import('@/components/landing/ComparisonTable'), { ssr: false });
const StickyScroll = dynamic(() => import('@/components/landing/StickyScroll'), { ssr: false });
const IntegrationMarquee = dynamic(() => import('@/components/landing/IntegrationMarquee'), { ssr: false });
const TrustMetrics = dynamic(() => import('@/components/landing/TrustMetrics'), { ssr: false });
const HeroScene = dynamic(() => import('@/components/landing/HeroScene'), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#030014]" />
});
const ParallaxSection = dynamic(() => import('@/components/landing/ParallaxSection'), { ssr: false });

// --- Optimized Spotlight Card Component ---
function SpotlightCard({ children, className = "" }) {
  const divRef = useRef(null);
  const rectRef = useRef(null);
  const [opacity, setOpacity] = useState(0);

  const handleMouseEnter = () => {
    if (divRef.current) {
      rectRef.current = divRef.current.getBoundingClientRect();
      setOpacity(1);
    }
  };

  const handleMouseMove = (e) => {
    if (!rectRef.current || !divRef.current) return;
    const { left, top } = rectRef.current;
    divRef.current.style.setProperty("--mouse-x", `${e.clientX - left}px`);
    divRef.current.style.setProperty("--mouse-y", `${e.clientY - top}px`);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
    rectRef.current = null;
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/2 hover:border-white/20 active:scale-[0.98] transition-all duration-300 ${className}`}
      style={{ "--mouse-x": "0px", "--mouse-y": "0px" }}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500"
        style={{
          opacity,
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(120,119,198,0.15), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
}

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  
  const heroOpacity = useTransform(smoothProgress, [0, 0.1], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.1], [1, 0.95]);
  
  const dashboardY = useTransform(smoothProgress, [0, 0.25], [0, -40]);
  const dashboardRotateX = useTransform(smoothProgress, [0, 0.25], [15, 0]);
  const dashboardScale = useTransform(smoothProgress, [0, 0.25], [0.98, 1]);

  const [isStickyCTAVisible, setIsStickyCTAVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsStickyCTAVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <MainLayout>
        <div ref={containerRef} className="relative w-full overflow-clip bg-[#030014]">
          
          {/* Background Scene */}
          <HeroScene />
          
          {/* Hero Section */}
          <Section className="min-h-[70vh] md:min-h-[90vh] flex flex-col items-center justify-start md:justify-center pt-20 md:pt-32 pb-12 relative z-10">
            <ParallaxSection speed={-0.5} className="w-full">
              <m.div style={{ opacity: heroOpacity, scale: heroScale }} className="w-full flex flex-col items-center text-center">
                <m.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-8 uppercase tracking-widest"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  v2.0 is now live
                </m.div>

                <m.h1 
                  initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9] max-w-5xl"
                >
                  The Operating System for <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-fuchsia-400 to-indigo-400 animate-gradient-x">Modern Teams.</span>
                </m.h1>

                <m.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="text-base md:text-2xl text-slate-400 max-w-2xl font-light mb-12 leading-relaxed"
                >
                  Unify your communication, tasks, and documentation in a single, lightning-fast workspace.
                </m.p>

                <m.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 w-full max-w-md md:max-w-none mx-auto"
                >
                  <Link href="/register" className="w-full sm:w-auto">
                    <m.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full px-8 py-3.5 md:py-4 bg-linear-to-r from-indigo-600 to-purple-600 rounded-xl md:rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
                    >
                      Get Started Now <ArrowRight className="w-5 h-5" />
                    </m.button>
                  </Link>
                  <Link href="/demo" className="w-full sm:w-auto">
                    <m.button 
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full px-8 py-3.5 md:py-4 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-white font-bold transition-colors"
                    >
                      Book a Demo
                    </m.button>
                  </Link>
                </m.div>
              </m.div>
            </ParallaxSection>
          </Section>

          <TrustMetrics />
          
          <StickyScroll />

          {/* Featured Dashboard Preview */}
          <Section padding="py-12 md:py-32 overflow-visible">
             <ParallaxSection speed={typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 0.3}>
                <m.div 
                  style={{ 
                    y: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : dashboardY, 
                    rotateX: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : dashboardRotateX, 
                    scale: dashboardScale 
                  }}
                  className="relative mx-auto max-w-6xl perspective-[1500px] z-20"
                >
                  <div className="relative rounded-2xl md:rounded-3xl border border-white/10 bg-slate-950 p-1 shadow-2xl shadow-indigo-500/20 overflow-hidden group">
                     <div className="absolute inset-0 bg-linear-to-tr from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 pointer-events-none"></div>
                     <div className="rounded-xl md:rounded-2xl border border-white/5 overflow-hidden">
                       <GlassDashboard />
                     </div>
                  </div>
                </m.div>
             </ParallaxSection>
          </Section>

          <IntegrationMarquee />


          <LivePreview />

          {/* Middle CTA */}
          <Section padding="py-16 md:py-48" className="text-center relative overflow-hidden bg-[#030014]">
            <BackgroundRings />
            
            <m.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.15, delayChildren: 0.2 }
                }
              }}
              className="relative z-10 max-w-4xl mx-auto px-6"
            >
              <m.h2 
                variants={{
                  hidden: { opacity: 0, y: 40, scale: 0.96 },
                  visible: { opacity: 1, y: 0, scale: 1 }
                }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl md:text-7xl font-black text-white mb-10 tracking-tighter leading-[1.1]"
              >
                Build the future of your <br /> team in <AnimatedGradientText>seconds.</AnimatedGradientText>
              </m.h2>

              <PremiumCTA href="/register">
                Get Started Now — It's Free
              </PremiumCTA>
            </m.div>
          </Section>

          <Section padding="py-12 md:py-16">
            <HowItWorks />
          </Section>

          <Section padding="py-12 md:py-16">
            <ComparisonTable />
          </Section>

          {/* Infrastructure Grid */}
          <Section id="infrastructure" stagger background="bg-slate-950/20" padding="py-20 md:py-32">
            <div className="text-center mb-16 px-4">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Unrivaled Infrastructure.</h2>
              <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">Nexuspace is built on edge-rendered WebSockets and highly available NoSQL layers for sub-millisecond sync.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <SpotlightCard className="md:col-span-2 p-8 md:p-12 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-6">
                    <Globe className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Edge Synchronized States</h3>
                  <p className="text-slate-300 font-light leading-relaxed">Your entire workspace shares a singular source of truth globally.</p>
                </div>
                <div className="mt-8 h-40 rounded-2xl bg-slate-950/50 border border-white/5 flex items-center justify-center overflow-hidden">
                   <m.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 4 }} className="w-24 h-24 rounded-full bg-indigo-500/10 blur-xl" />
                   <Cpu className="w-10 h-10 text-indigo-500/40 relative z-10" />
                </div>
              </SpotlightCard>

              <SpotlightCard className="p-8">
                 <Shield className="text-purple-400 w-10 h-10 mb-6" />
                 <h3 className="text-xl font-bold text-white mb-3">Enterprise Security</h3>
                 <p className="text-slate-300 text-sm font-light leading-relaxed">Bank-grade isolation for every single workspace shard.</p>
              </SpotlightCard>

              <SpotlightCard className="p-8">
                 <Zap className="text-amber-400 w-10 h-10 mb-6" />
                 <h3 className="text-xl font-bold text-white mb-3">99.9% Uptime</h3>
                 <p className="text-slate-300 text-sm font-light leading-relaxed">Zero-latency failover across all geographic regions.</p>
              </SpotlightCard>

              <SpotlightCard className="md:col-span-2 p-8 flex flex-col justify-center">
                 <div className="flex items-center gap-6">
                   <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                     <Activity className="w-6 h-6 text-emerald-400" />
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-white mb-1">Sub-millisecond Sync</h3>
                     <p className="text-slate-400 text-sm font-light leading-relaxed">Proprietary transport layer optimized for high-frequency updates.</p>
                   </div>
                 </div>
              </SpotlightCard>
            </div>
          </Section>

          {/* Final CTA Section */}
          <Section padding="py-16 md:py-48" className="text-center relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.08),transparent_70%)] pointer-events-none" />
            <div className="relative inline-block mb-10">
               <h2 className="text-4xl md:text-8xl font-black text-white leading-none tracking-tighter px-4">
                 Escape <br />
                 <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-purple-400 to-fuchsia-400">velocity.</span>
               </h2>
            </div>
            
            <p className="text-slate-300 text-base md:text-xl max-w-xl mx-auto mb-16 px-6 font-light leading-relaxed">
              Stop juggling fragmented tools. Build the future of your engineering team on the world's fastest engine.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto px-6">
              <Link href="/register" className="flex-1">
                <button className="w-full py-3.5 md:py-4 bg-white text-black font-black rounded-xl md:rounded-2xl text-base md:text-lg shadow-[0_20px_50px_-10px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all">
                  Get Started Free
                </button>
              </Link>
              <button className="flex-1 py-3.5 md:py-4 bg-slate-900 border border-white/10 text-white font-bold rounded-xl md:rounded-2xl text-base hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center gap-2">
                Founders Demo <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </Section>

          <StickyCTA visible={isStickyCTAVisible} />

        </div>
      </MainLayout>
    </LazyMotion>
  );
}
