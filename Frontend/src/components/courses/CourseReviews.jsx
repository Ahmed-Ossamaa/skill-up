'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { formatDate } from '@/lib/utils';

export default function CourseReviews({ reviews = [], averageRating = 0, totalReviews = 0 }) {
  const [showAll, setShowAll] = useState(false);
  const displayedReviews = showAll ? reviews : reviews.slice(0, 5);

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => Math.floor(Number(r.rating)) === star).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <div className="glass-card p-6">
      <h2 className="text-2xl font-bold mb-6">Student Feedback</h2>

      {reviews.length > 0 ? (
        <>
          {/* Rating Overview */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Average Rating */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-5xl font-bold gradient-text mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  <StarRating rating={averageRating} size="large" />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Course Rating
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-20">
                    <span className="text-sm font-medium">{star}</span>
                    <AiFillStar className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {displayedReviews.map((review) => (
              <ReviewItem key={review._id} review={review} />
            ))}
          </div>

          {/* Show More Button */}
          {reviews.length > 5 && (
            <div className="text-center mt-6">
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-6 py-2 glass-button"
              >
                {showAll ? 'Show Less' : `Show All ${totalReviews} Reviews`}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
            <AiOutlineStar className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">No reviews yet</p>
          <p className="text-sm text-gray-500 mt-2">Be the first to review this course!</p>
        </div>
      )}
    </div>
  );
}

function ReviewItem({ review }) {
  return (
    <div className="border-b border-white/10 pb-6 last:border-b-0">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        {review.user?.avatar ? (
          <Image
            src={review.user.avatar}
            alt={review.user.name}
            width={48}
            height={48}
            className="rounded-full"
          />
        ) : (
          <div className="w-12 h-12 bg-linear-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold shrink-0">
            {review.user?.name?.charAt(0) || 'U'}
          </div>
        )}

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold">{review.user?.name || 'Anonymous'}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <StarRating rating={review.rating} />
                <span className="text-sm text-gray-500">
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Review Text */}
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-3">
            {review.comment}
          </p>

          {/* Helpful Button (Optional) */}
          <div className="flex items-center space-x-4 mt-4 text-sm">
            <button className="text-gray-500 hover:text-primary-500 transition-colors">
              Was this helpful?
            </button>
            {review.helpfulCount > 0 && (
              <span className="text-gray-500">
                {review.helpfulCount} people found this helpful
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StarRating({ rating, size = 'small' }) {
  const stars = [1, 2, 3, 4, 5];
  const iconSize = size === 'large' ? 'w-6 h-6' : 'w-4 h-4';

  return (
    <div className="flex">
      {stars.map((star) => (
        <div key={star}>
          {star <= rating ? (
            <AiFillStar className={`${iconSize} text-yellow-500`} />
          ) : (
            <AiOutlineStar className={`${iconSize} text-gray-300 dark:text-gray-600`} />
          )}
        </div>
      ))}
    </div>
  );
}