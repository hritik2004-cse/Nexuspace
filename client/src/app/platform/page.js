import MainLayout from "@/components/landing/MainLayout";
import { Globe, Cpu, Layout, Activity, MessageSquare, Zap, Shield, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Platform | Nexuspace",
  description: "Explore the unrivaled infrastructure and features behind Nexuspace.",
  openGraph: {
    title: "Platform | Nexuspace",
    description: "Explore the unrivaled infrastructure and features behind Nexuspace.",
  }
};

export default function PlatformPage() {
  return (
    <MainLayout>
      <div className="relative z-10 pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-8 border border-indigo-500/30 mx-auto">
            <Cpu className="text-indigo-400 w-8 h-8" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6">The Nexuspace Platform.</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">Built entirely on edge-rendered WebSockets and highly available NoSQL layers. Uncompromising performance.</p>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="p-10 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all hover:border-indigo-500/30 group">
            <MessageSquare className="w-10 h-10 text-indigo-400 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold text-white mb-4">Real-time Chat Engine</h3>
            <p className="text-slate-400 leading-relaxed mb-8">Instant messaging distributed across edge nodes. Create infinite channels, direct messages, and secure client-facing threads without a single millisecond of lag.</p>
            <ul className="space-y-3 mb-8">
              <li className="text-sm text-slate-300 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Threaded conversations</li>
              <li className="text-sm text-slate-300 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> End-to-end file encryption</li>
              <li className="text-sm text-slate-300 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Rich text & code blocks</li>
            </ul>
          </div>

          <div className="p-10 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all hover:border-fuchsia-500/30 group">
            <Layout className="w-10 h-10 text-fuchsia-400 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold text-white mb-4">Predictive Kanban Boards</h3>
            <p className="text-slate-400 leading-relaxed mb-8">Visual project management rendered using optimistic UI. Drag and drop thousands of tasks seamlessly while the backend resolves conflict states automatically.</p>
            <ul className="space-y-3 mb-8">
              <li className="text-sm text-slate-300 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500"></div> Virtualized infinite scrolling</li>
              <li className="text-sm text-slate-300 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500"></div> Custom column workflows</li>
              <li className="text-sm text-slate-300 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500"></div> Automated sprint rollovers</li>
            </ul>
          </div>

          <div className="p-10 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all hover:border-emerald-500/30 group">
            <Zap className="w-10 h-10 text-emerald-400 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold text-white mb-4">Edge Sync Subsystem</h3>
            <p className="text-slate-400 leading-relaxed mb-8">Your entire workspace shares a singular source of truth. The millisecond a task moves or a letter is typed, our backend propagates the event worldwide.</p>
          </div>

          <div className="p-10 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all hover:border-rose-500/30 group">
            <Shield className="w-10 h-10 text-rose-400 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold text-white mb-4">Enterprise Security</h3>
            <p className="text-slate-400 leading-relaxed mb-8">Instantly branch off entirely separate Workspaces for private clients or secure internal ops without cross-pollution. Compliant with strict SOC2 standards.</p>
          </div>

        </div>
      </div>
      
      <div className="relative z-10 py-24 text-center">
         <button className="bg-white text-black px-8 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2 mx-auto group">
           Start Building Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
         </button>
      </div>
    </MainLayout>
  );
}
