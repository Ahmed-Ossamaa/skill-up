'use client';

import { useState, useEffect } from 'react';
import { reviewAPI } from '@/lib/api';
import { AiFillStar } from 'react-icons/ai';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function InstructorReviewFeed() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await reviewAPI.getMyReviews();
                setReviews(res.data?.data || []);
            } catch (err) {
                console.error('Error fetching instructor reviews:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    if (loading) return <div className="animate-pulse space-y-4">{/* Skeleton rows */}</div>;

    if (reviews.length === 0) return (
        <div className="glass-card p-10 text-center">
            <p className="text-gray-500">No reviews yet. Keep building great content!</p>
        </div>
    );

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold mb-4">Recent Feedback</h3>
            {reviews.map((review) => (
                <div key={review._id} className="glass-card p-5 border border-transparent hover:border-primary-500/30 transition-all">
                    <div className="flex items-start gap-4">
                        {/* Avatar / Initial */}
                        <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold shrink-0">
                            {review.user?.name?.charAt(0) || 'U'}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 mb-2">
                                <div>
                                    <span className="font-bold text-gray-900 dark:text-white mr-2">
                                        {review.user?.name || 'Anonymous Student'}
                                    </span>
                                    {/* The "Course Badge" - Vital for organization */}
                                    <Link
                                        href={`/courses/${review.course?.id}`}
                                        className="text-[10px] px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full font-bold uppercase tracking-tight hover:underline"
                                    >
                                        {review.course?.title}
                                    </Link>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {formatDate(review.createdAt)}
                                </span>
                            </div>

                            {/* Stars */}
                            <div className="flex gap-0.5 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <AiFillStar
                                        key={i}
                                        className={i < review.rating ? "text-yellow-400" : "text-gray-200 dark:text-gray-700"}
                                    />
                                ))}
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                                {review.comment}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}