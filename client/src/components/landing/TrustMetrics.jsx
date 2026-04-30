"use client";

import { motion } from "framer-motion";
import CountUp from "./CountUp";

export default function TrustMetrics() {
  return (
    <section className="relative z-10 py-12 border-y border-white/5 bg-[#030014]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-black text-white mb-2">Enterprise Grade.</h3>
            <p className="text-slate-300 font-medium">Metrics that back our infrastructure.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-12 lg:gap-24">
            <div className="flex flex-col items-center">
               <motion.span 
                 initial={{ opacity: 0, scale: 0.5 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.5 }}
                 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500 mb-2"
               >
                 <CountUp end={99.9} suffix="%" decimals={1} />
               </motion.span>
               <span className="text-sm font-bold tracking-widest uppercase text-slate-400">Uptime SLA</span>
            </div>

            <div className="w-px h-16 bg-white/10 hidden sm:block"></div>

            <div className="flex flex-col items-center">
               <motion.span 
                 initial={{ opacity: 0, scale: 0.5 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.5, delay: 0.1 }}
                 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-500 mb-2"
               >
                 <CountUp end={50} suffix="ms" />
               </motion.span>
               <span className="text-sm font-bold tracking-widest uppercase text-slate-400">Global Latency</span>
            </div>

            <div className="w-px h-16 bg-white/10 hidden sm:block"></div>

            <div className="flex flex-col items-center">
               <motion.span 
                 initial={{ opacity: 0, scale: 0.5 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.5, delay: 0.2 }}
                 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-500 mb-2"
               >
                 <CountUp end={10} suffix="k+" />
               </motion.span>
               <span className="text-sm font-bold tracking-widest uppercase text-slate-400">Messages / Day</span>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
