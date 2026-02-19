"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitReview } from "@/lib/firebase";

const QUICK_REVIEWS = [
    "Great driver, smooth ride! 🚗",
    "Very punctual and friendly 👍",
    "Clean car, safe driving 🌟",
    "Good conversation, would ride again!",
    "Professional and courteous 🎯",
];

export default function FeedbackModal({ open, onClose, rideId, targetId, reviewerId, reviewerName, reviewerPhoto, targetName }: {
    open: boolean; onClose: () => void;
    rideId: string; targetId: string;
    reviewerId: string; reviewerName: string; reviewerPhoto: string;
    targetName: string;
}) {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await submitReview({
                rideId, targetId, reviewerId, reviewerName, reviewerPhoto,
                rating, comment: comment || QUICK_REVIEWS[0],
            });
            setSubmitted(true);
            setTimeout(() => { onClose(); setSubmitted(false); setRating(5); setComment(""); }, 1500);
        } catch (err) { console.error(err); alert("Failed to submit review"); }
        finally { setSubmitting(false); }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 z-[70] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-background p-6 shadow-2xl">

                        {submitted ? (
                            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center py-8">
                                <div className="text-6xl mb-4">🎉</div>
                                <h3 className="text-xl font-bold">Thanks for your feedback!</h3>
                                <p className="text-muted-foreground mt-1">Your review helps the community</p>
                            </motion.div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold">Rate your ride</h2>
                                    <button onClick={onClose} className="rounded-full p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
                                </div>

                                <p className="text-center text-muted-foreground mb-4">How was your experience with <span className="font-semibold text-foreground">{targetName}</span>?</p>

                                {/* Star Rating */}
                                <div className="flex justify-center gap-2 mb-6">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <motion.button key={star} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                                            onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(star)} className="transition-colors">
                                            <Star className={`h-10 w-10 ${(hoverRating || rating) >= star
                                                ? "fill-amber-400 text-amber-400"
                                                : "text-muted-foreground/30"}`} />
                                        </motion.button>
                                    ))}
                                </div>

                                <p className="text-center text-sm font-medium mb-4">
                                    {rating === 5 ? "⭐ Excellent!" : rating === 4 ? "👍 Great" : rating === 3 ? "😊 Good" : rating === 2 ? "😐 Okay" : "😞 Poor"}
                                </p>

                                {/* Quick Reviews */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {QUICK_REVIEWS.map((review) => (
                                        <button key={review} onClick={() => setComment(review)}
                                            className={`rounded-full px-3 py-1.5 text-xs border transition-all ${comment === review
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-border hover:bg-muted"}`}>
                                            {review}
                                        </button>
                                    ))}
                                </div>

                                {/* Custom Comment */}
                                <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                                    placeholder="Write your review (optional)..."
                                    className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4" />

                                <Button onClick={handleSubmit} disabled={submitting} className="w-full h-12 rounded-xl text-base font-semibold">
                                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> :
                                        <><Send className="mr-2 h-4 w-4" /> Submit Review</>}
                                </Button>
                            </>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
