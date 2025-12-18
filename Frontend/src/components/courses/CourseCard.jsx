import Link from 'next/link';
import Image from 'next/image';
import { AiFillStar } from 'react-icons/ai';
import { HiOutlineUsers, HiOutlineClock, HiOutlineBookOpen } from 'react-icons/hi';
import { formatPrice, getCourseLevelLabel, getCourseLevelColor, getFinalPrice, isOnSale } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function CourseCard({ course, disableLink = false }) {
    const finalPrice = getFinalPrice(course);
    const onSale = isOnSale(course);
    const discount = course.discount;

    const CardContent = (
        <div className="glass-card overflow-hidden hover-lift h-full">
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden">
                {course.thumbnail ? (
                    <Image
                        src={course.thumbnail.url}
                        alt={course.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                        <HiOutlineBookOpen className="w-16 h-16 text-white/50" />
                    </div>
                )}

                {/* Discount Badge */}
                {onSale && discount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {discount}% OFF
                    </div>
                )}

                {/* Level Badge */}
                <div className="absolute top-3 right-3">
                    <span className={cn(
                        'px-3 py-1 rounded-full text-xs font-semibold',
                        getCourseLevelColor(course.level)
                    )}>
                        {getCourseLevelLabel(course.level)}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Category */}
                <div className="text-xs font-semibold text-primary-500 uppercase tracking-wide mb-2">
                    {course.category?.name || 'General'}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
                    {course.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                    {course.description}
                </p>

                {/* Instructor */}
                <div className="flex items-center space-x-2 mb-4">
                    <span className="font-semibold">By</span>
                    <span className="font-semibold text-sm text-gray-600 dark:text-gray-400">
                        {course.instructor?.name || 'Instructor'}
                    </span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 ">
                    <div className="flex items-center space-x-4">
                        {/* Rating */}
                        {course.rating >0 ? (
                            <div className="flex items-center space-x-1">
                                <AiFillStar className="w-4 h-4 text-yellow-500" />
                                <span className="font-semibold">{course.rating.toFixed(1)}</span>
                                <span className="text-xs">({course.ratingCount || 0})</span>
                            </div>
                        ):
                        <div className="flex items-center space-x-1">
                            <AiFillStar className="w-4 h-4 text-gray-400" />
                            <span className="font-semibold">0.0</span>
                            <span className="text-xs">({course.reviewCount || 0})</span>
                        </div>
                    }

                        {/* Students */}
                        {course.enrollmentCount && (
                            <div className="flex items-center space-x-1">
                                <HiOutlineUsers className="w-4 h-4" />
                                <span>{course.enrollmentCount.toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    {/* Duration */}
                    {course.duration && (
                        <div className="flex items-center space-x-1">
                            <HiOutlineClock className="w-4 h-4" />
                            <span>{Math.floor(course.duration / 60)}h</span>
                        </div>
                    )}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-bold text-primary-500">
                            {course.isFree ? 'Free' : formatPrice(finalPrice)}
                        </span>
                        {onSale && (
                            <span className="text-sm text-gray-500 line-through">
                                {formatPrice(course.price)}
                            </span>
                        )}
                    </div>

                    {!disableLink && (
                        <button className="px-4 py-2 bg-linear-to-r from-primary-500 to-secondary-500 text-white rounded-lg text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            View Course
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    // If disableLink >> render static div
    if (disableLink) {
        return <div className="group block animate-fade-in">{CardContent}</div>;
    }

    // Normal behavior >> wrapped with Link
    return (
        <Link href={`/courses/${course._id || course.id}`} className="group block animate-fade-in">
            {CardContent}
        </Link>
    );
}
