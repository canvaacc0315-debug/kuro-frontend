import React from 'react';
import { motion } from 'framer-motion';
import './AnimatedCard.css';

export default function AnimatedCard({ icon, title, description, badge, onClick, delay = 0 }) {
    return (
        <motion.div
            className="animated-card"
            whileHover={{ y: -8, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay }}
            onClick={onClick}
        >
            <div className="card-glass-layer" />

            {badge && <span className="card-badge">{badge}</span>}

            <div className="card-icon-wrapper">
                <div className="card-icon-glow" />
                <span className="card-icon">{icon}</span>
            </div>

            <h3 className="card-title">{title}</h3>
            <p className="card-description">{description}</p>

            {onClick && (
                <div className="card-footer">
                    <span className="card-action">Get Started &rarr;</span>
                </div>
            )}
        </motion.div>
    );
}
