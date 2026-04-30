"use client";

import { ArrowRight, Github, Twitter, Linkedin, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const API_BASE =
    process.env.NODE_ENV === "production"
      ? "/api"
      : "http://localhost:5000/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;

    setStatus("loading");

    try {
      const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        toast.success(data.message || "Welcome to the inner circle! 🚀", {
          position: "bottom-right",
          autoClose: 5000,
          theme: "dark",
        });
        setEmail(""); // Clear the input on success
      } else {
        setStatus("error");
        toast.error(data.message || "Something went wrong. Please try again.", {
          position: "bottom-right",
          theme: "dark",
        });
      }
    } catch (err) {
      setStatus("error");
      toast.error("Network error. Please check your connection.", {
        position: "bottom-right",
        theme: "dark",
      });
    }

    // Reset status after a delay so button becomes usable again
    setTimeout(() => {
      setStatus("idle");
    }, 5000);
  };

  return (
    <div className="flex flex-col gap-3 max-w-xs">
      <span className="text-sm font-semibold text-white">Subscribe to the Changelog</span>

      <form
        onSubmit={handleSubmit}
        className={`flex border rounded-xl overflow-hidden transition-all duration-200 ${
          status === "error"
            ? "border-red-500/50 focus-within:border-red-400"
            : "border-white/10 focus-within:border-indigo-500"
        }`}
        noValidate
      >
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") {
              setStatus("idle");
            }
          }}
          placeholder="Email address..."
          className="bg-white/5 w-full px-4 py-3 text-sm text-white focus:outline-none placeholder:text-slate-500 min-w-0"
          disabled={status === "loading"}
          aria-label="Email address for newsletter"
          autoComplete="email"
        />
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          aria-label="Subscribe to newsletter"
          className="bg-linear-to-r from-indigo-600 to-purple-600 px-4 py-3 hover:from-indigo-500 hover:to-purple-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
        >
          {status === "loading" ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight className="w-4 h-4 text-white" aria-hidden="true" />
          )}
        </button>
      </form>
    </div>
  );
}

export default function LandingFooter() {
  return (
    <footer className="relative z-0 border-t border-white/10 bg-[#030014] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 auto-rows-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 mb-20">
          {/* Branding Column */}
          <div className="col-span-1 sm:col-span-2 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src="/favicon.ico" alt="Nexuspace Logo" width="32" height="32" className="w-8 h-8 rounded-lg object-contain shadow-lg shadow-indigo-500/20" />
              <span className="text-2xl font-black tracking-tight text-white">Nexuspace</span>
            </div>
            <p className="text-slate-300 text-sm max-w-sm leading-relaxed mb-8">
              The world's most performant real-time operating system for teams. Engineered to unify communication and process.
            </p>

            {/* Live Newsletter Form */}
            <NewsletterForm />
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest opacity-50">Product</h4>
            <ul className="space-y-4 text-sm text-slate-300 flex flex-col">
              <li><Link href="/platform" className="hover:text-indigo-400 transition-colors">Platform</Link></li>
              <li><Link href="/solutions" className="hover:text-indigo-400 transition-colors">Solutions</Link></li>
              <li><Link href="/pricing" className="hover:text-indigo-400 transition-colors">Pricing</Link></li>
              <li><Link href="/changelog" className="hover:text-indigo-400 transition-colors">Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest opacity-50">Resources</h4>
            <ul className="space-y-4 text-sm text-slate-300 flex flex-col">
              <li><Link href="/docs" className="hover:text-indigo-400 transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-indigo-400 transition-colors">API Reference</Link></li>
              <li><Link href="#" className="hover:text-indigo-400 transition-colors">Community</Link></li>
              <li><Link href="#" className="hover:text-indigo-400 transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest opacity-50">Company</h4>
            <ul className="space-y-4 text-sm text-slate-300 flex flex-col">
              <li><Link href="#" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-indigo-400 transition-colors">Careers 🚀</Link></li>
              <li><Link href="#" className="hover:text-indigo-400 transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
             © {new Date().getFullYear()} Nexuspace Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-slate-400 border border-white/5 py-2 px-6 rounded-full bg-white/1">
             <div className="flex items-center gap-2 text-xs font-bold"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> All Systems Operational</div>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" aria-label="GitHub" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"><Github className="w-4 h-4" aria-hidden="true" /></a>
            <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"><Twitter className="w-4 h-4" aria-hidden="true" /></a>
            <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"><Linkedin className="w-4 h-4" aria-hidden="true" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
