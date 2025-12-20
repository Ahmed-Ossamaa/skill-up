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
    const courseUrl = `/courses/${course._id || course.id}`;

    return (
        <div className="group block animate-fade-in h-full">
            <div className="glass-card overflow-hidden hover-lift h-full flex flex-col">

                {/* Thumbnail*/}
                <div className="relative aspect-video overflow-hidden">
                    {!disableLink ? (
                        <Link href={courseUrl} className="block w-full h-full">
                            <ThumbnailImage course={course} />
                        </Link>
                    ) : (
                        <div className="w-full h-full">
                            <ThumbnailImage course={course} />
                        </div>
                    )}

                    {/*Badges*/}
                    {onSale && discount > 0 && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold pointer-events-none">
                            {discount}% OFF
                        </div>
                    )}
                    <div className="absolute top-3 right-3 pointer-events-none">
                        <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', getCourseLevelColor(course.level))}>
                            {getCourseLevelLabel(course.level)}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                    <div className="text-xs font-semibold text-primary-500 uppercase tracking-wide mb-2">
                        {course.category?.name || 'General'}
                    </div>

                    {/* --- Title --- */}
                    {!disableLink ? (
                        <Link href={courseUrl}>
                            <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
                                {course.title}
                            </h3>
                        </Link>
                    ) : (
                        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                            {course.title}
                        </h3>
                    )}

                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                        {course.description}
                    </p>

                    {/*Instructor */}
                    <div className="flex items-center space-x-2 mb-4">
                        <span className="font-semibold">By</span>
                        <Link href={`/instructor/${course.instructor?._id}`} className="z-10">
                            <span className="font-semibold text-sm hover:text-primary-500 hover:underline text-gray-600 dark:text-gray-400">
                                {(course.instructor?.name).charAt(0).toUpperCase() + (course.instructor?.name).slice(1) || 'Instructor'}
                            </span>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-auto">
                        <div className="flex items-center space-x-4">
                            {/* Rating */}
                            <div className="flex items-center space-x-1">
                                <AiFillStar className={`w-4 h-4 ${course.rating > 0 ? "text-yellow-500" : "text-gray-400"}`} />
                                <span className="font-semibold">{course.rating > 0 ? course.rating.toFixed(1) : "0.0"}</span>
                                <span className="text-xs">({course.ratingCount || 0})</span>
                            </div>
                            {/* Students */}
                            {course.enrollmentCount > 0 && (
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

                    {/* --- Price & Action Button --- */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
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
                            <Link href={courseUrl}>
                                <button className="px-4 py-2 bg-linear-to-r from-primary-500 to-secondary-500 text-white rounded-lg text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg">
                                    View Course
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ThumbnailImage({ course }) {
    if (course.thumbnail?.url) {
        return (
            <Image
                src={course.thumbnail.url}
                alt={course.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
        );
    }
    return (
        <div className="w-full h-full bg-linear-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <HiOutlineBookOpen className="w-16 h-16 text-white/50" />
        </div>
    );
}