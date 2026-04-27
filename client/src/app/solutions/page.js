import MainLayout from "@/components/landing/MainLayout";
import { Code, Briefcase, Users, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Solutions | Nexuspace",
  description: "Tailored real-time solutions for Engineering, Product, and Agency teams.",
  openGraph: {
    title: "Solutions | Nexuspace",
    description: "Tailored real-time solutions for Engineering, Product, and Agency teams.",
  }
};

export default function SolutionsPage() {
  return (
    <MainLayout>
      <div className="relative z-10 pt-32 pb-20 overflow-hidden mt-10">
        <div className="absolute inset-0 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6">Solutions for every team.</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">Discover how Nexuspace adapts to your specific operational workflows.</p>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 mb-32 space-y-24">
        
        {/* Engineering */}
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2 order-2 md:order-1 relative">
            <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full"></div>
            <div className="w-full h-80 rounded-3xl border border-white/10 bg-[#0a0a0f] relative z-10 flex flex-col p-6 shadow-2xl">
              <div className="flex gap-2 mb-4 pb-4 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="flex-1 overflow-hidden">
                <pre className="text-xs font-mono text-blue-300">
                  <code>
{`// Auto-deployment hook triggered
function handleWebhook(event) {
  if (event.type === 'push') {
    nexuspace.kanban.moveTask({
      id: event.commit.taskId,
      column: 'review'
    });
    nexuspace.chat.send({
      channel: '#deployments',
      message: 'New code ready for review.'
    });
  }
}`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 order-1 md:order-2">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-8 border border-blue-500/30">
              <Code className="text-blue-400 w-8 h-8" />
            </div>
            <h2 className="text-4xl font-black text-white mb-6">For Engineering</h2>
            <p className="text-lg text-slate-400 leading-relaxed mb-8">Ship faster with integrated code discussions. Tie your GitHub commits directly to Kanban tasks, and let Nexuspace automatically move tickets across columns via webhooks.</p>
            <button className="text-white font-bold hover:text-blue-400 flex items-center gap-2 group transition-colors">
              Read the Engineering Guide <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Product */}
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-8 border border-orange-500/30">
              <Briefcase className="text-orange-400 w-8 h-8" />
            </div>
            <h2 className="text-4xl font-black text-white mb-6">For Product Teams</h2>
            <p className="text-lg text-slate-400 leading-relaxed mb-8">Align roadmaps with daily execution. Bridge the gap between high-level OKRs and granular daily tasks in a single interface. Use priority tags and custom views to see exactly what matters today.</p>
            <button className="text-white font-bold hover:text-orange-400 flex items-center gap-2 group transition-colors">
              Explore Product Workflows <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="md:w-1/2 relative">
             <div className="absolute inset-0 bg-orange-500/10 blur-[80px] rounded-full"></div>
             <div className="w-full h-80 rounded-3xl border border-white/10 bg-[#0a0a0f] relative z-10 p-6 flex flex-col gap-4 shadow-2xl">
               <div className="h-12 w-full border border-white/5 bg-white/[0.02] rounded-xl flex items-center px-4 gap-4">
                 <div className="w-4 h-4 rounded border border-orange-500/50 bg-orange-500/20"></div>
                 <div className="h-2 w-32 bg-white/20 rounded-full"></div>
                 <div className="ml-auto h-6 w-16 bg-white/5 rounded-full"></div>
               </div>
               <div className="h-12 w-full border border-white/5 bg-white/[0.02] rounded-xl flex items-center px-4 gap-4">
                 <div className="w-4 h-4 rounded border border-white/20"></div>
                 <div className="h-2 w-48 bg-white/20 rounded-full"></div>
                 <div className="ml-auto h-6 w-16 bg-white/5 rounded-full"></div>
               </div>
               <div className="h-12 w-full border border-white/5 bg-white/[0.02] rounded-xl flex items-center px-4 gap-4">
                 <div className="w-4 h-4 rounded border border-white/20"></div>
                 <div className="h-2 w-24 bg-white/20 rounded-full"></div>
                 <div className="ml-auto h-6 w-16 bg-white/5 rounded-full"></div>
               </div>
             </div>
          </div>
        </div>

        {/* Agencies */}
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2 order-2 md:order-1 relative">
             <div className="absolute inset-0 bg-purple-500/10 blur-[80px] rounded-full"></div>
             <div className="w-full h-80 rounded-3xl border border-white/10 bg-[#0a0a0f] relative z-10 p-8 flex items-center justify-center shadow-2xl overflow-hidden">
               <div className="absolute -left-10 -top-10 w-40 h-40 border border-white/5 rounded-3xl rotate-12"></div>
               <div className="absolute -right-10 -bottom-10 w-40 h-40 border border-white/5 rounded-3xl rotate-12"></div>
               <div className="flex flex-col items-center gap-4 relative z-10">
                 <div className="flex -space-x-4">
                   <div className="w-12 h-12 rounded-full border-2 border-[#0a0a0f] bg-purple-500/20"></div>
                   <div className="w-12 h-12 rounded-full border-2 border-[#0a0a0f] bg-indigo-500/20"></div>
                   <div className="w-12 h-12 rounded-full border-2 border-[#0a0a0f] bg-fuchsia-500/20 flex items-center justify-center text-xs font-bold">+5</div>
                 </div>
                 <span className="text-sm font-medium text-slate-400">Client Workspace A</span>
               </div>
             </div>
          </div>
          <div className="md:w-1/2 order-1 md:order-2">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-8 border border-purple-500/30">
              <Users className="text-purple-400 w-8 h-8" />
            </div>
            <h2 className="text-4xl font-black text-white mb-6">For Agencies</h2>
            <p className="text-lg text-slate-400 leading-relaxed mb-8">Client-isolated sandboxes and communications. Create infinite separate workspaces under your main agency account, ensuring clients never see each other's data.</p>
            <button className="text-white font-bold hover:text-purple-400 flex items-center gap-2 group transition-colors">
              See Agency Setup <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
