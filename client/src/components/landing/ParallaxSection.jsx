"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ParallaxSection({ children, speed = 1, className = "" }) {
  const sectionRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    
    gsap.to(el, {
      y: (i, target) => -ScrollTrigger.maxScroll(window) * (speed * 0.1),
      ease: "none",
      scrollTrigger: {
        trigger: triggerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [speed]);

  return (
    <div ref={triggerRef} className={`relative overflow-hidden ${className}`}>
      <div ref={sectionRef} className="will-change-transform">
        {children}
      </div>
    </div>
  );
}
