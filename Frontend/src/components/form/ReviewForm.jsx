'use client';
import { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import { enrollmentAPI, reviewAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ReviewForm({ courseId, isEnrolled, onReviewAdded }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    // Only show if the user is actually enrolled
    if (!isEnrolled) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return toast.error("Please select a rating");

        setLoading(true);
        try {
            await reviewAPI.create( { rating, comment },courseId,);
            toast.success("Review submitted! Thank you.");
            setRating(0);
            setComment("");
            if (onReviewAdded) onReviewAdded(); // Refresh the reviews list
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit review");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-black mb-4 tracking-tight">How was this course?</h3>
            
            {/* Star Selection */}
            <div className="flex mb-6 space-x-2">
                {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                        <button
                            type="button"
                            key={ratingValue}
                            className={`text-2xl transition-all duration-200 ${
                                ratingValue <= (hover || rating) ? "text-yellow-400 fill-yellow-400 scale-110" : "text-slate-300"
                            }`}
                            onClick={() => setRating(ratingValue)}
                            onMouseEnter={() => setHover(ratingValue)}
                            onMouseLeave={() => setHover(0)}
                        >
                            <FiStar />
                        </button>
                    );
                })}
            </div>

            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you think about the instructor, content, and quality?"
                className="w-full p-4 h-32 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            />

            <button
                disabled={loading}
                className="mt-4 px-8 py-3 bg-primary-500 text-white rounded-full font-bold hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 active:scale-95 disabled:opacity-50"
            >
                {loading ? "Posting..." : "Submit Review"}
            </button>
        </form>
    );
}