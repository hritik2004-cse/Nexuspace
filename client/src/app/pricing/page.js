import MainLayout from "@/components/landing/MainLayout";
import { CheckCircle2, Shield } from "lucide-react";

export const metadata = {
  title: "Pricing | Nexuspace",
  description: "Predictable scaling for individuals and global enterprises alike.",
  openGraph: {
    title: "Pricing | Nexuspace",
    description: "Predictable scaling for individuals and global enterprises alike.",
  }
};

export default function PricingPage() {
  return (
    <MainLayout>
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 mt-10">
        <div className="text-center mb-24">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6">Pricing built for flow.</h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto">Predictable scaling for individuals and global enterprises alike. Start free, upgrade when you need to.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          
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
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> {feat}
                </li>
              ))}
            </ul>
            <button className="w-full py-4 mt-auto rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 transition-colors">Get Started Free</button>
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
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" /> {feat}
                </li>
              ))}
            </ul>
            <button className="w-full py-4 mt-auto rounded-xl bg-white text-black hover:bg-slate-200 font-bold transition-all shadow-lg hover:scale-[1.02]">Start Pro Trial</button>
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
                  <Shield className="w-5 h-5 text-indigo-400 shrink-0" /> {feat}
                </li>
              ))}
            </ul>
            <button className="w-full py-4 mt-auto rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 transition-colors">Contact Sales</button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
