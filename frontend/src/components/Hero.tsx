import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero({ phase }: { phase: string }) {
  return (
    <section className="h-screen relative overflow-hidden flex flex-col items-center justify-center">
      {/* 🎥 VIDEO BACKGROUND */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/video.mp4" type="video/mp4" />
      </video>

      {/* 🌑 OVERLAY */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* 🧵 LOGO TRANSITION */}
      {phase !== "splash" && (
        <motion.div 
          layoutId="logo-main"
          className="fixed z-40 top-6 right-6"
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
           <img src="/logo.jpeg" className="w-14 h-14 rounded-full shadow-lg border border-gold/30" alt="Logo" />
        </motion.div>
      )}

      {/* 🔥 HERO CONTENT */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: phase === "hero" ? 1 : 0,
          y: phase === "hero" ? 0 : 20
        }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-20 flex flex-col items-center justify-center text-center px-4"
      >
        <h1 className="text-5xl md:text-8xl font-display font-light tracking-[0.2em] text-gold uppercase">
          Tailor Arena
        </h1>

        <p className="mt-6 text-cream/80 text-lg md:text-xl font-sans tracking-wide max-w-2xl">
          Discover India's most refined ateliers and bring your fashion visions to life.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <Link to="/login">
                <Button className="px-10 py-7 rounded-full bg-gradient-gold text-navy-deep shadow-glow hover:opacity-90 text-lg font-bold gap-3">
                    <Sparkles className="h-5 w-5" /> Explore Now
                </Button>
            </Link>
        </div>
      </motion.div>
    </section>
  );
}




