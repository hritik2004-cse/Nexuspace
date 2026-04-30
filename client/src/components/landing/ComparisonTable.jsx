"use client";

import { motion } from "framer-motion";
import { Check, X, Zap } from "lucide-react";

const features = [
  { name: "Real-time Sockets", nexus: true, slack: true, trello: false },
  { name: "Unified Single Canvas", nexus: true, slack: false, trello: false },
  { name: "Zero Latency Task Grids", nexus: true, slack: false, trello: true },
  { name: "Isolated Sandboxing (VPCs)", nexus: true, slack: false, trello: false },
  { name: "Edge-computed States", nexus: true, slack: false, trello: false },
  { name: "Sub-millisecond Typing", nexus: true, slack: true, trello: false },
];

export default function ComparisonTable() {
  return (
    <section className="relative z-10 py-16 md:py-24 bg-[#030014]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-4xl md:text-5xl font-black text-white mb-6"
          >
            Leave the legacy stack behind.
          </motion.h2>
          <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed">Why pay for 5 fragmented tools when your team only needs one engine?</p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative w-full rounded-3xl border border-white/10 bg-slate-950/50 backdrop-blur-3xl overflow-hidden shadow-2xl"
          >
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse min-w-[600px] md:min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/2">
                    <th className="p-4 md:p-6 text-[10px] md:text-sm font-semibold text-slate-400 tracking-wide uppercase w-2/5">Feature Matrix</th>
                    <th className="p-4 md:p-6 text-center w-1/5 bg-white/3 border-x border-white/5 relative">
                      <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                      <div className="inline-flex items-center gap-1.5 md:gap-2 text-indigo-400 font-bold text-xs md:text-base">
                        <Zap className="w-3 h-3 md:w-4 md:h-4 fill-indigo-400" /> Nexuspace
                      </div>
                    </th>
                    <th className="p-4 md:p-6 text-center text-slate-400 font-bold text-sm md:text-lg w-1/5">Slack</th>
                    <th className="p-4 md:p-6 text-center text-slate-400 font-bold text-sm md:text-lg w-1/5">Trello</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((row, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/4 transition-colors duration-200 group">
                      <td className="p-4 md:p-6 font-medium text-xs md:text-base text-white transition-colors">{row.name}</td>
                      <td className="p-4 md:p-6 text-center bg-white/3 border-x border-white/5">
                        <div className="flex justify-center">
                          {row.nexus ? <Check className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" /> : <X className="w-5 h-5 md:w-6 md:h-6 text-slate-600" />}
                        </div>
                      </td>
                      <td className="p-4 md:p-6 text-center">
                        <div className="flex justify-center">
                          {row.slack ? <Check className="w-5 h-5 md:w-6 md:h-6 text-slate-400" /> : <X className="w-5 h-5 md:w-6 md:h-6 text-slate-600" />}
                        </div>
                      </td>
                      <td className="p-4 md:p-6 text-center">
                        <div className="flex justify-center">
                          {row.trello ? <Check className="w-5 h-5 md:w-6 md:h-6 text-slate-400" /> : <X className="w-5 h-5 md:w-6 md:h-6 text-slate-600" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
          {/* Mobile Scroll Indicator */}
          <div className="flex md:hidden items-center justify-center gap-2 mt-4 text-slate-500">
            <div className="w-8 h-1 bg-white/10 rounded-full overflow-hidden">
               <motion.div animate={{ x: [-32, 32] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-full h-full bg-indigo-500/50" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Swipe to explore</span>
          </div>
        </div>
      </div>
    </section>
  );
}
