"use client";

import MainLayout from "@/components/landing/MainLayout";
import { useState, useEffect, useRef } from "react";
import { Copy, Check, Terminal, ChevronRight, Hash } from "lucide-react";

const SECTIONS = [
  { id: "getting-started", title: "Getting Started" },
  { id: "authentication", title: "Authentication" },
  { id: "realtime-sync", title: "Real-time Sync" },
  { id: "kanban-api", title: "Kanban API" },
];

const CodeBlock = ({ code, language = "bash" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative mt-4 mb-6 rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0f] group">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-mono text-slate-400">{language}</span>
        </div>
        <button 
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-indigo-200">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default function DocsClient() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading for Skeleton loaders request
    const timer = setTimeout(() => setLoading(false), 800);
    
    // Intersection Observer for scroll spy
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { rootMargin: "-20% 0px -80% 0px" });

    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [loading]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <MainLayout>
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 mt-10 w-full flex gap-12">
        {/* Sticky Sidebar */}
        <div className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-32">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-3">On this page</h4>
            <nav className="flex flex-col gap-1">
              {loading ? (
                // Skeleton Loader for Sidebar
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-8 w-full bg-white/5 animate-pulse rounded-lg mb-1"></div>
                ))
              ) : (
                SECTIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left ${activeSection === s.id ? 'bg-indigo-500/10 text-indigo-400 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                  >
                    <Hash className="w-3 h-3 opacity-50" />
                    {s.title}
                  </button>
                ))
              )}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-3xl">
          {loading ? (
            // Skeleton Loader for Content
            <div className="space-y-12">
              <div>
                <div className="h-12 w-3/4 bg-white/5 animate-pulse rounded-xl mb-6"></div>
                <div className="h-4 w-full bg-white/5 animate-pulse rounded mb-3"></div>
                <div className="h-4 w-5/6 bg-white/5 animate-pulse rounded mb-8"></div>
                <div className="h-40 w-full bg-white/5 animate-pulse rounded-xl"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-24">
              <div className="border-b border-white/10 pb-12">
                <h1 className="text-4xl font-black text-white mb-6 tracking-tight">Documentation</h1>
                <p className="text-xl text-slate-400 leading-relaxed">Welcome to the Nexuspace developer documentation. Learn how to integrate, authenticate, and build with our real-time synchronization engine.</p>
              </div>

              <section id="getting-started" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  Getting Started <ChevronRight className="w-5 h-5 text-indigo-400" />
                </h2>
                <p className="text-slate-400 mb-6 leading-relaxed">To start interacting with the Nexuspace infrastructure, you'll need our official SDK. It automatically handles WebSocket connection drops, state syncing, and authentication.</p>
                <CodeBlock code="npm install @nexuspace/sdk" language="bash" />
                <p className="text-slate-400 mt-6 leading-relaxed">Once installed, initialize the client globally within your application.</p>
                <CodeBlock code={`import { NexusClient } from '@nexuspace/sdk';\n\nconst client = new NexusClient({\n  apiKey: process.env.NEXUS_API_KEY,\n  environment: 'production'\n});`} language="javascript" />
              </section>

              <section id="authentication" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  Authentication <ChevronRight className="w-5 h-5 text-indigo-400" />
                </h2>
                <p className="text-slate-400 mb-6 leading-relaxed">We use JWT-based authentication for securing WebSocket connections. You must pass a valid token when connecting.</p>
                <CodeBlock code={`// Generate a session token\nconst token = await client.auth.createSession({\n  userId: 'user_123',\n  workspaceId: 'ws_abc'\n});\n\n// Connect socket\nclient.connect(token);`} language="javascript" />
              </section>

              <section id="realtime-sync" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  Real-time Sync <ChevronRight className="w-5 h-5 text-indigo-400" />
                </h2>
                <p className="text-slate-400 mb-6 leading-relaxed">Listen to events globally across your workspace. The SDK automatically batches events to save bandwidth.</p>
                <CodeBlock code={`client.on('task.moved', (event) => {\n  console.log(\`Task \${event.taskId} moved to \${event.newColumn}\`);\n  // Update UI instantly\n});`} language="javascript" />
              </section>

              <section id="kanban-api" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  Kanban API <ChevronRight className="w-5 h-5 text-indigo-400" />
                </h2>
                <p className="text-slate-400 mb-6 leading-relaxed">Programmatically create, move, or delete Kanban tasks.</p>
                <CodeBlock code={`const newTask = await client.kanban.createTask({\n  title: 'Optimize Database Queries',\n  column: 'todo',\n  assignee: 'user_123',\n  priority: 'high'\n});`} language="javascript" />
              </section>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
