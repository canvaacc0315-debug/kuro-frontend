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
    <div className="animated-hero-container">
      {/* Dynamic Background Blobs */}
      <motion.div 
        className="blob blob-red"
        animate={{
          x: mousePosition.x * 100,
          y: mousePosition.y * 100,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 50 }}
      />
      <motion.div 
        className="blob blob-dark"
        animate={{
          x: mousePosition.x * -80,
          y: mousePosition.y * -80,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 50 }}
      />
      
      {/* Overlay to give space depth */}
      <div className="hero-overlay" />

      {/* Content */}
      <div className="hero-content">
        <motion.div 
          className="hero-badge-container"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {badges?.map((badge, idx) => (
             <span key={idx} className="hero-badge">{badge}</span>
          ))}
        </motion.div>

        <motion.h1 
          className="hero-animated-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          {title}
        </motion.h1>

        <motion.p 
          className="hero-animated-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          {subtitle}
        </motion.p>

        <motion.div 
          className="hero-animated-children"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
