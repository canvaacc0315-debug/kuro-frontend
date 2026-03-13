import { motion } from "framer-motion";

export default function AnimatedSection({
    children,
    className = "",
    delay = 0,
    direction = "up",
    style,
}) {
    const dirMap = {
        up: { y: 40, x: 0 },
        down: { y: -40, x: 0 },
        left: { x: 60, y: 0 },
        right: { x: -60, y: 0 },
    };

    const offset = dirMap[direction] || dirMap.up;

    return (
        <motion.div
            className={className}
            style={style}
            initial={{ opacity: 0, ...offset }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
                duration: 0.7,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
        >
            {children}
        </motion.div>
    );
}
