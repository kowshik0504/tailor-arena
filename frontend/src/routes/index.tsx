import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Hero from "@/components/Hero";

export const Route = createFileRoute("/")({ component: LandingPage });

function LandingPage() {
  const [phase, setPhase] = useState("splash");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("transition"), 1500);
    const t2 = setTimeout(() => setPhase("hero"), 2100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="bg-navy-deep text-cream overflow-hidden relative min-h-screen font-sans">

      {/* 🚀 HERO ALWAYS MOUNTED */}
      <Hero phase={phase} />

      {/* 🎬 CINEMATIC SPLASH */}
      <AnimatePresence>
        {phase !== "hero" && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === "transition" ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="
              fixed inset-0 z-50
              flex items-center justify-center
              overflow-hidden
              bg-[#050816]
            "
          >
            {/* 🌟 Golden Background Glow (The "goldenish color at back") */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.76_0.13_80_/_0.2)_0%,transparent_70%)]" />

            {/* ✨ Animated Glow Effects */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-[600px] h-[600px] bg-gold/10 rounded-full blur-3xl" 
            />

            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-navy/20 rounded-full blur-3xl" />

            <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-gold/10 rounded-full blur-3xl" />

            {/* 🌟 Extra Light */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_60%)]" />

            {/* 🧵 LOGO TRANSITION */}
            <motion.div
              layoutId="logo-main"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <img
                  src="/logo1.jpeg"
                  className="
                    w-52 md:w-64
                    drop-shadow-[0_0_40px_rgba(197,160,89,0.2)]
                    relative z-10
                    rounded-full
                  "
                  alt="Logo"
                />
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}





