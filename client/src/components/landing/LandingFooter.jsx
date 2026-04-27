import { ArrowRight, Github, Twitter, Linkedin } from "lucide-react";
import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#030014] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 auto-rows-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-20">
          {/* Branding Column */}
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src="/favicon.ico" alt="Nexuspace Logo" className="w-8 h-8 rounded-lg object-contain shadow-lg shadow-indigo-500/20" />
              <span className="text-2xl font-black tracking-tight text-white">Nexuspace</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-8">
              The world's most performant real-time operating system for teams. Engineered to unify communication and process.
            </p>
            {/* Newsletter */}
            <div className="flex flex-col gap-3 max-w-xs">
              <span className="text-sm font-semibold text-white">Subscribe to the Changelog</span>
              <form className="flex border border-white/10 rounded-xl overflow-hidden focus-within:border-indigo-500 transition-colors">
                <input type="email" placeholder="Email address..." className="bg-white/5 w-full px-4 py-3 text-sm text-white focus:outline-none placeholder:text-slate-500" />
                <button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 hover:from-indigo-500 hover:to-purple-500 transition-colors">
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </form>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-bold text-white mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-slate-400 flex flex-col">
              <Link href="/platform" className="hover:text-indigo-400 transition-colors">Platform</Link>
              <Link href="/solutions" className="hover:text-indigo-400 transition-colors">Solutions</Link>
              <Link href="/pricing" className="hover:text-indigo-400 transition-colors">Pricing</Link>
              <Link href="/changelog" className="hover:text-indigo-400 transition-colors">Changelog</Link>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-slate-400 flex flex-col">
              <Link href="/docs" className="hover:text-indigo-400 transition-colors">Documentation</Link>
              <Link href="#" className="hover:text-indigo-400 transition-colors">API Reference</Link>
              <Link href="#" className="hover:text-indigo-400 transition-colors">Community</Link>
              <Link href="#" className="hover:text-indigo-400 transition-colors">Blog</Link>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-slate-400 flex flex-col">
              <Link href="#" className="hover:text-indigo-400 transition-colors">About Us</Link>
              <Link href="#" className="hover:text-indigo-400 transition-colors">Careers 🚀</Link>
              <Link href="#" className="hover:text-indigo-400 transition-colors">Contact</Link>
              <Link href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
             © {new Date().getFullYear()} Nexuspace Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-slate-400 border border-white/5 py-2 px-6 rounded-full bg-white/[0.01]">
             <div className="flex items-center gap-2 text-xs font-bold"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> All Systems Operational</div>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"><Github className="w-4 h-4" /></a>
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"><Linkedin className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
