import React from 'react';
import { motion } from 'framer-motion';
import './AnimatedCard.css';

export default function AnimatedCard({ icon, title, description, badge, onClick, delay = 0, className = '' }) {
    // A premium dark-mode approach: A sleek card that glows slightly on hover
    // The structure mimics a "glowing border wrap" mentioned in the theme
    return (
        <motion.div
            className={`premium-bento-card ${className}`}
            whileHover={{ y: -4, scale: 1.01 }}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }} // Custom smooth easing
            onClick={onClick}
        >
            {/* Subtle top border highlight mimicking light reflection */}
            <div className="card-top-light" />

            {badge && <span className="card-badge">{badge}</span>}

            <div className="card-icon-wrapper">
                <div className="card-icon-glow" />
                <span className="card-icon">{icon}</span>
            </div>

            <h3 className="card-title">{title}</h3>
            <p className="card-description">{description}</p>

            {onClick && (
                <div className="card-footer">
                    <span className="card-action">Launch Tool &rarr;</span>
                </div>
            )}
        </motion.div>
    );
}
