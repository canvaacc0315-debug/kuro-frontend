import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { useState } from "react";

export default function ReviewModal({ isOpen, onClose }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState("");

    const handleSubmit = () => {
        // In a real app, send to backend
        console.log("Submitted review", { rating, reviewText });
        // Show a success state or just close
        setRating(0);
        setReviewText("");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="hp-modal-overlay" onClick={onClose}>
                    <motion.div
                        className="hp-modal-content"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="hp-modal-header">
                            <h2>Got a second? We'd love your feedback.</h2>
                        </div>

                        <div className="hp-modal-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="hp-modal-star-btn"
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                >
                                    <Star
                                        size={40}
                                        fill={(hoverRating || rating) >= star ? "#eab308" : "transparent"}
                                        color={(hoverRating || rating) >= star ? "#eab308" : "currentColor"}
                                        strokeWidth={1.5}
                                    />
                                </button>
                            ))}
                        </div>

                        <textarea
                            className="hp-modal-textarea"
                            placeholder="Tell us what you think (optional)..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            rows={4}
                        />

                        <div className="hp-modal-actions">
                            <button className="hp-modal-btn-cancel" onClick={onClose}>
                                Cancel
                            </button>
                            <button
                                className={`hp-modal-btn-submit ${rating > 0 ? "active" : ""}`}
                                onClick={handleSubmit}
                                disabled={rating === 0}
                            >
                                Submit Review
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
