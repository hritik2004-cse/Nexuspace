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
    <section className="relative z-10 py-32 bg-[#030014]">
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
          <p className="text-xl text-slate-400 font-light">Why pay for 5 fragmented tools when your team only needs one engine?</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full rounded-3xl border border-white/10 bg-slate-950/50 backdrop-blur-3xl overflow-hidden shadow-2xl overflow-x-auto"
        >
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/2">
                <th className="p-6 text-sm font-semibold text-slate-400 tracking-wide uppercase w-2/5">Feature Matrix</th>
                <th className="p-6 text-center w-1/5 bg-white/3 border-x border-white/5 relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                  <div className="inline-flex items-center gap-2 text-indigo-400 font-bold">
                    <Zap className="w-4 h-4 fill-indigo-400" /> Nexuspace
                  </div>
                </th>
                <th className="p-6 text-center text-slate-400 font-bold text-lg w-1/5">Slack</th>
                <th className="p-6 text-center text-slate-400 font-bold text-lg w-1/5">Trello</th>
              </tr>
            </thead>
            <tbody>
              {features.map((row, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/4 transition-colors duration-200 group">
                  <td className="p-6 font-medium text-white transition-colors">{row.name}</td>
                  <td className="p-6 text-center bg-white/3 border-x border-white/5">
                    <div className="flex justify-center">
                      {row.nexus ? <Check className="w-6 h-6 text-indigo-400" /> : <X className="w-6 h-6 text-slate-600" />}
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex justify-center">
                      {row.slack ? <Check className="w-6 h-6 text-slate-400" /> : <X className="w-6 h-6 text-slate-600" />}
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex justify-center">
                      {row.trello ? <Check className="w-6 h-6 text-slate-400" /> : <X className="w-6 h-6 text-slate-600" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
