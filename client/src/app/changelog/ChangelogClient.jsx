"use client";

import MainLayout from "@/components/landing/MainLayout";
import { useState } from "react";
import { ChevronDown, ChevronUp, Star, Zap, Bug, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CHANGELOG_DATA = [
  {
    version: "v2.0.0",
    date: "April 26, 2026",
    title: "Nexuspace Edge 2.0 is Live",
    latest: true,
    description: "The complete rewrite of our real-time engine is finally here. We've dropped latency by 80% globally and introduced modular sandboxes.",
    tags: ["feature", "performance"],
    details: [
      "Completely rewritten WebSocket architecture using Edge workers.",
      "Introduced Modular Sandboxes for isolated client environments.",
      "New Kanban Board drag-and-drop system using predictive UI rendering.",
      "UI redesign matching a hyper-minimal, premium aesthetic."
    ]
  },
  {
    version: "v1.4.2",
    date: "April 15, 2026",
    title: "Presence & Offline Checks",
    latest: false,
    description: "Added granular presence indicators to see exactly when someone is typing or reading a thread.",
    tags: ["feature"],
    details: [
      "Typing indicators are now synced at 16ms intervals.",
      "Added 'last read' watermarks to channels.",
      "Fixed an issue where presence would drop on mobile Safari."
    ]
  },
  {
    version: "v1.4.1",
    date: "April 02, 2026",
    title: "Kanban Performance Fixes",
    latest: false,
    description: "Resolved several memory leaks in large Kanban boards with over 500 tasks.",
    tags: ["fix", "performance"],
    details: [
      "Virtualization applied to Kanban columns to reduce DOM nodes.",
      "Fixed dragging lag when multiple users dragged simultaneously.",
      "Optimized task query caching."
    ]
  }
];

const TagIcon = ({ tag }) => {
  if (tag === "feature") return <Star className="w-3 h-3 text-fuchsia-400" />;
  if (tag === "performance") return <Zap className="w-3 h-3 text-emerald-400" />;
  if (tag === "fix") return <Bug className="w-3 h-3 text-rose-400" />;
  return <Wrench className="w-3 h-3 text-slate-400" />;
};

export default function ChangelogClient() {
  const [expanded, setExpanded] = useState("v2.0.0");

  return (
    <MainLayout>
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-32 mt-10">
        <div className="mb-20">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6">Changelog</h1>
          <p className="text-slate-400 text-xl max-w-2xl">A history of updates, improvements, and fixes to the Nexuspace engine.</p>
        </div>

        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-white/10 before:to-transparent mb-32">
          {CHANGELOG_DATA.map((item, idx) => {
            const isExpanded = expanded === item.version;
            return (
              <div key={item.version} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-slate-950 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <div className={`w-3 h-3 rounded-full ${item.latest ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'bg-white/20'}`}></div>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl border border-white/10 bg-white/2 hover:bg-white/4 transition-colors cursor-pointer" onClick={() => setExpanded(isExpanded ? null : item.version)}>
                  <div className="flex items-center justify-between mb-2">
                    <time className="text-sm font-medium text-slate-400">{item.date}</time>
                    <div className="flex items-center gap-2">
                       {item.latest && <span className="px-2 py-0.5 text-xs font-bold bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">Latest</span>}
                       <span className="text-xs font-mono text-slate-500">{item.version}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <div className="flex gap-2 mb-4">
                    {item.tags.map(t => (
                      <span key={t} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5 text-xs font-medium text-slate-300 capitalize">
                        <TagIcon tag={t} /> {t}
                      </span>
                    ))}
                  </div>
                  <p className="text-slate-400 leading-relaxed text-sm mb-2">{item.description}</p>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-4 border-t border-white/10">
                          <ul className="space-y-3">
                            {item.details.map((detail, i) => (
                              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/20 shrink-0"></span>
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="mt-4 flex justify-center w-full">
                    <button className="text-slate-500 group-hover:text-white transition-colors">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
