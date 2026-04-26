# Nexuspace Client | Next.js 14 Engine

This is the highly optimized Single Page Application logic driving Nexuspace. Rendered heavily through Next.js 14 and structured strictly with `framer-motion` rendering layers to ensure native 60fps animations.

## 🎨 Design Philosophy

Nexuspace explicitly targets a "Vercel / Linear" UI aesthetic. We prioritize:
- **Spatial Storytelling:** Deep integration of `Position: Sticky` CSS loops combined with `useMotionValueEvent` and `useScroll` framer physics to create interactive narratives without polluting vertical layouts.
- **Micro-Interactions:** Subtle DOM feedback (ghosting outlines, fast `0.2s` interpolations, tracking cursors) over huge neon gradients.
- **SSR Fallbacks:** Implementing `next/dynamic` rendering over heavy animated abstractions like `<LivePreview />` ensuring initial hydration operates at breakneck TTFB (Time-to-First-Byte).

## 📂 Component Ecosystem (`/src`)

- `/app/`: Master Next.js 14 routing systems, `globals.css` base layers stripped of OS-level scrollbars, and core layout injection.
- `/components/landing/`: High-end SaaS marketing structures (`StickyScroll.jsx`, `HowItWorks.jsx`, `ComparisonTable.jsx`) isolated entirely from main application logic to block DOM bloat.
- `/components/`: Live Dashboard abstractions like `ChatWindow.jsx` and `KanbanBoard.jsx`.
- `/context/`: Heavy React Providers securely tracking Workspace data contexts mapping variables deep into nested tree routes.

---
### Script Definitions
- `npm run dev`: Fires dev compiler locally.
- `npm run build`: Maps static traces for Vercel/Node deployment edges.
