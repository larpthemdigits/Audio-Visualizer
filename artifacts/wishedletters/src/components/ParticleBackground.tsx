import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ParticleBackground() {
  const [particles, setParticles] = useState<{ id: number; top: number; left: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      top: i * 5 + 5,
      left: i * 5 + 2,
      delay: -i * 0.4,
      duration: 7 + Math.random() * 4,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" id="particles">
      {particles.map((p, i) => (
        <motion.div
          key={p.id}
          className="particle absolute rounded-full bg-white/40 animate-float"
          style={{
            width: i % 2 !== 0 ? '4px' : i % 3 === 0 ? '2px' : '3px',
            height: i % 2 !== 0 ? '4px' : i % 3 === 0 ? '2px' : '3px',
            top: `${p.top}%`,
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            backgroundColor: i % 2 !== 0 ? 'rgba(255,255,255,0.6)' : i % 3 === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.4)',
          }}
        />
      ))}
    </div>
  );
}
