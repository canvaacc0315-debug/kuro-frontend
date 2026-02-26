import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './AnimatedHero.css';

export default function AnimatedHero({ title, subtitle, badges, children }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) - 0.5,
        y: (e.clientY / window.innerHeight) - 0.5,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="premium-hero-container">
      {/* 
        A true dark mode aesthetic uses extremely subtle ambient lighting 
        rather than large colorful blobs 
      */}
      <div className="hero-grid-pattern" />

      <motion.div
        className="ambient-glow ambient-glow-red"
        animate={{
          x: mousePosition.x * 60,
          y: mousePosition.y * 60,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 40 }}
      />

      <div className="hero-content">
        <motion.div
          className="hero-badge-container"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {badges?.map((badge, idx) => (
            <span key={idx} className="premium-badge">{badge}</span>
          ))}
        </motion.div>

        <motion.h1
          className="premium-hero-title"
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {title}
        </motion.h1>

        <motion.p
          className="premium-hero-subtitle"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {subtitle}
        </motion.p>

        <motion.div
          className="hero-animated-children"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
