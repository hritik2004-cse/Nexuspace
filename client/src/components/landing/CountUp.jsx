"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";

export default function CountUp({ end, suffix = "", decimals = 0 }) {
  const countRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const target = { value: 0 };
    const animation = anime({
      targets: target,
      value: end,
      round: Math.pow(10, decimals),
      easing: "easeOutExpo",
      duration: 2000,
      autoplay: false,
      update: () => {
        if (countRef.current) {
          countRef.current.innerHTML = target.value.toFixed(decimals) + suffix;
        }
      }
    });

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animation.play();
        observerRef.current.disconnect();
      }
    }, { threshold: 0.5 });

    if (countRef.current) {
      observerRef.current.observe(countRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [end, suffix, decimals]);

  return <span ref={countRef}>0{suffix}</span>;
}
