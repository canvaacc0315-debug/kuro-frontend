import { motion } from "framer-motion";

export default function GlassCard({
    icon,
    title,
    description,
    children,
    delay = 0,
    className = "",
}) {
    return (
        <motion.div
            className={`glass-card ${className}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ y: -6, transition: { duration: 0.25 } }}
            style={{
                background: "var(--bg-card)",
                backdropFilter: "var(--backdrop-blur)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-card)",
                padding: "2rem",
                cursor: "pointer",
                transition:
                    "box-shadow var(--transition-base), border-color var(--transition-base), background var(--transition-base)",
            }}
        >
            {icon && (
                <div
                    style={{
                        width: 52,
                        height: 52,
                        borderRadius: "var(--radius-md)",
                        background: "var(--accent-subtle)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "1.2rem",
                        color: "var(--accent)",
                        fontSize: "1.4rem",
                    }}
                >
                    {icon}
                </div>
            )}
            <h3
                style={{
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    marginBottom: "0.6rem",
                    color: "var(--text-primary)",
                }}
            >
                {title}
            </h3>
            <p
                style={{
                    fontSize: "0.92rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.65,
                    margin: 0,
                }}
            >
                {description}
            </p>
            {children}
        </motion.div>
    );
}
