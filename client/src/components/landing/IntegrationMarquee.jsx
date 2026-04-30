"use client";

// Industry-standard high-fidelity tech symbols (Clean & Sharp)
const LOGOS = [
  { 
    name: "Next.js", 
    svg: (props) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <title>Next.js</title>
        <path d="M18.665 21.978l-10.987-14.534v14.534h-1.146v-15.956h1.146l10.987 14.534v-14.534h1.146v15.956z" />
      </svg>
    )
  },
  { 
    name: "React", 
    svg: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <title>React</title>
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
        <ellipse rx="11" ry="4.2" cx="12" cy="12" transform="rotate(0 12 12)" />
        <ellipse rx="11" ry="4.2" cx="12" cy="12" transform="rotate(60 12 12)" />
        <ellipse rx="11" ry="4.2" cx="12" cy="12" transform="rotate(120 12 12)" />
      </svg>
    )
  },
  { 
    name: "Node.js", 
    svg: (props) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <title>Node.js</title>
        <path d="M11.968 0L2 5.688v11.378l9.968 5.688 9.968-5.688V5.688L11.968 0zm7.152 15.706l-7.152 4.081-7.152-4.081V7.048l7.152-4.081 7.152 4.081v8.658z"/>
      </svg>
    )
  },
  { 
    name: "MongoDB", 
    svg: (props) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <title>MongoDB</title>
        <path d="M11.637 22s-4.103-2.91-4.103-10.428c0-4.633 2.463-8.8 4.515-10.573.137-.137.548-.137.685 0 2.052 1.773 4.515 5.94 4.515 10.573 0 7.518-4.103 10.428-4.103 10.428h-1.509zm.822-17.81c-1.37 1.532-2.878 4.596-2.878 7.354 0 4.904 1.919 7.662 2.878 8.734.822-.92 2.878-3.678 2.878-8.734 0-2.912-1.507-5.975-2.878-7.354z"/>
      </svg>
    )
  },
  { 
    name: "Socket.io", 
    svg: (props) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <title>Socket.io</title>
        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 21.6c-5.302 0-9.6-4.298-9.6-9.6S6.698 2.4 12 2.4s9.6 4.298 9.6 9.6-4.298 9.6-9.6 9.6zm4.8-13.2l-6 6-2.4-2.4-1.2 1.2 3.6 3.6 7.2-7.2-1.2-1.2z"/>
      </svg>
    )
  },
  { 
    name: "Tailwind CSS", 
    svg: (props) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <title>Tailwind CSS</title>
        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"/>
      </svg>
    )
  },
  { 
    name: "Framer Motion", 
    svg: (props) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <title>Framer Motion</title>
        <path d="M0 0l12 12L24 0H0zm0 12l12 12V12H0z"/>
      </svg>
    )
  }
];

export default function IntegrationMarquee() {
  return (
    <section aria-label="Our Technology Stack" className="relative z-10 w-full overflow-hidden py-12 border-y border-white/5 bg-slate-950/30 backdrop-blur-md">
      <div className="absolute left-0 w-32 h-full bg-gradient-to-r from-[#030014] to-transparent z-10 top-0"></div>
      <div className="absolute right-0 w-32 h-full bg-gradient-to-l from-[#030014] to-transparent z-10 top-0"></div>
      
      <div className="flex gap-20 whitespace-nowrap px-8 w-[200%] animate-marquee">
        {[...LOGOS, ...LOGOS, ...LOGOS].map((tech, i) => (
          <div key={i} className="flex items-center gap-3 text-slate-300 opacity-80 font-black text-2xl tracking-tighter uppercase grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
            <tech.svg className="w-7 h-7 shrink-0" role="img" aria-label={tech.name} /> {tech.name}
          </div>
        ))}
      </div>
    </section>
  );
}
