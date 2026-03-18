import { motion } from "framer-motion";

export default function GradientButton({
    children,
    onClick,
    variant = "primary",
    className = "",
    style,
}) {
    const isPrimary = variant === "primary";

    return (
        <motion.button
            className={`gradient-btn ${variant} ${className}`}
            onClick={onClick}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: isPrimary ? "14px 32px" : "14px 28px",
                borderRadius: "var(--radius-full)",
                border: isPrimary ? "none" : "2px solid var(--accent)",
                background: isPrimary ? "var(--accent-gradient)" : "transparent",
                color: isPrimary ? "#fff" : "var(--accent)",
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                fontFamily: "inherit",
                transition: "all var(--transition-base)",
                ...style,
            }}
        >
            {/* Shimmer overlay */}
            {isPrimary && (
                <span
                    style={{
                        position: "absolute",
                        top: 0,
                        left: "-100%",
                        width: "100%",
                        height: "100%",
                        background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                        transition: "left 0.5s ease",
                        pointerEvents: "none",
                    }}
                    className="shimmer-overlay"
                />
            )}
            <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
        </motion.button>
    );
}
