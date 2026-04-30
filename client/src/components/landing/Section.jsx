"use client";

import { m } from "framer-motion";

export default function Section({ 
  children, 
  className = "", 
  id, 
  ariaLabel, 
  stagger = false,
  background = "transparent",
  padding = "py-12 md:py-20"
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.21, 0.45, 0.32, 0.9]
      }
    }
  };

  return (
    <section 
      id={id}
      aria-label={ariaLabel}
      className={`relative w-full overflow-hidden ${background} ${padding} ${className}`}
    >
      <m.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={stagger ? containerVariants : itemVariants}
        className="max-w-7xl mx-auto px-6"
      >
        {children}
      </m.div>
    </section>
  );
}
