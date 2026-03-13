import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TextRotator({
    words = [],
    interval = 2500,
    className = "",
}) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, interval);
        return () => clearInterval(timer);
    }, [words.length, interval]);

    return (
        <span
            className={`text-rotator ${className}`}
            style={{
                display: "inline-grid",
                position: "relative",
            }}
        >
            {/* Hidden sizer — forces width to longest word */}
            {words.map((w) => (
                <span
                    key={w}
                    aria-hidden="true"
                    style={{
                        visibility: "hidden",
                        gridArea: "1/1",
                        whiteSpace: "nowrap",
                        justifySelf: "start"
                    }}
                >
                    {w}
                </span>
            ))}

            <AnimatePresence mode="wait">
                <motion.span
                    key={words[index]}
                    initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    style={{
                        gridArea: "1/1",
                        justifySelf: "start",
                        display: "inline-block",
                        background: "var(--accent-gradient)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}
                >
                    {words[index]}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}
