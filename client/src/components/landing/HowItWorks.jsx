"use client";

import { motion } from "framer-motion";
import { UserPlus, LayoutDashboard, Rocket, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: <UserPlus className="w-8 h-8 text-indigo-400" />,
    title: "1. Create Your Scope",
    description: "Launch a totally isolated Workspace in seconds. No complex setups or rigid templates.",
  },
  {
    icon: <LayoutDashboard className="w-8 h-8 text-fuchsia-400" />,
    title: "2. Construct Flow",
    description: "Build custom Kanban boards and dedicated real-time chat channels instantly.",
  },
  {
    icon: <Rocket className="w-8 h-8 text-emerald-400" />,
    title: "3. Deploy Velocity",
    description: "Invite your teammates and synchronize your processes across our edge endpoints.",
  },
];

export default function HowItWorks() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 }
    }
  };

  return (
    <section className="relative z-0 py-32 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-4xl md:text-5xl font-black text-white mb-6"
          >
            How it works
          </motion.h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">From zero to synchronous flow state in three frictionless steps.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 relative"
        >
          {steps.map((step, idx) => (
            <motion.div key={idx} variants={itemVariants} className="flex flex-col items-center text-center group relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-white/2 border border-white/10 flex items-center justify-center shadow-xl group-hover:-translate-y-2 transition-transform duration-300">
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mt-8 mb-4">{step.title}</h3>
              <p className="text-slate-400 leading-relaxed max-w-sm">{step.description}</p>
            </motion.div>
          ))}
          
          {/* Animated Connectors - ONLY on Desktop */}
          <div className="hidden md:flex absolute top-10 left-[16.6%] right-[16.6%] justify-between pointer-events-none px-12 z-0">
             <motion.div 
               initial={{ width: 0, opacity: 0 }} 
               whileInView={{ width: "35%", opacity: 1 }} 
               viewport={{ once: true }}
               transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
               className="h-px bg-linear-to-r from-transparent via-indigo-500/50 to-transparent relative flex items-center"
             >
                <ArrowRight className="absolute -right-3 text-indigo-500/50 w-6 h-6" />
             </motion.div>
             <motion.div 
               initial={{ width: 0, opacity: 0 }} 
               whileInView={{ width: "35%", opacity: 1 }} 
               viewport={{ once: true }}
               transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
               className="h-px bg-linear-to-r from-transparent via-fuchsia-500/50 to-transparent relative flex items-center"
             >
                <ArrowRight className="absolute -right-3 text-fuchsia-500/50 w-6 h-6" />
             </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
