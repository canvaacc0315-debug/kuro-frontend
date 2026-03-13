import { motion } from "framer-motion";

export default function FloatingCard({
    icon,
    label,
    className = "",
    delay = 0,
    style,
}) {
    return (
        <motion.div
            className={`floating-badge ${className}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
            style={style}
        >
            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: delay * 2,
                }}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 20px",
                    background: "var(--bg-card)",
                    backdropFilter: "var(--backdrop-blur)",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid var(--border-color)",
                    boxShadow: "var(--shadow-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                }}
            >
                {icon && <span style={{ fontSize: "1.1rem" }}>{icon}</span>}
                <span>{label}</span>
                <span
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#22c55e",
                        display: "inline-block",
                    }}
                />
            </motion.div>
        </motion.div>
    );
}
