'use client';

import Link from 'next/link';
import { FiPlay, FiBook, FiCheckCircle } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { HiOutlineBookOpen } from 'react-icons/hi';

export default function EnrolledCourseCard({ enrollment }) {
    const { course, progress, status } = enrollment;
    if (!course) return null;

    const percentage = progress?.percentage || 0;
    const isCompleted = percentage === 100 || status === 'completed';

    return (
        <div className="group block animate-fade-in h-full">
            <div className="glass-card overflow-hidden hover-lift h-full flex flex-col">
                {/* Thumbnail */}
                <div className="relative aspect-video  overflow-hidden ">
                    {course.thumbnail?.url ? (
                        <Image
                            src={course.thumbnail.url}
                            alt={course.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className=" object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full bg-linear-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                            <HiOutlineBookOpen className="w-16 h-16 text-white/50" />
                        </div>
                    )}

                    {/*Play Btn*/}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Link
                            href={`/courses/${course._id}`}
                            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary-600 hover:scale-110 transition-transform shadow-lg"
                        >
                            <FiPlay className="w-5 h-5 ml-1" />
                        </Link>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-1">
                    <div className="mb-2">
                        <h3 className="font-bold text-lg  group-hover:text-primary-500 transition-colors">
                            {course.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {course.instructor?.name || 'Instructor'}
                        </p>
                    </div>

                    {/* Progress Section */}
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-2 text-sm">
                            <span className={cn(
                                "font-medium",
                                isCompleted ? "text-green-500" : "text-gray-600 dark:text-gray-300"
                            )}>
                                {isCompleted ? "Completed" : `${Math.round(percentage)}% Complete`}
                            </span>
                            {isCompleted && <FiCheckCircle className="text-green-500" />}
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                            <div
                                className={cn(
                                    "h-full transition-all duration-500 ease-out",
                                    isCompleted ? "bg-green-500" : "bg-linear-to-r from-primary-500 to-secondary-500"
                                )}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>

                        {/* Action Button */}
                        <Link
                            href={`/courses/${course._id}`}
                            className={cn(
                                "block w-full py-2.5 rounded-lg text-center text-sm font-semibold ",
                                isCompleted
                                    ? "border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10"
                                    : "bg-primary-500 border-transparent text-white hover:bg-primary-600 shadow-lg shadow-primary-500/20"
                            )}
                        >
                            {isCompleted ? 'Watch Again' : (percentage > 0 ? 'Continue Learning' : 'Start Course')}
                        </Link>
                    </div>
                </div>
            </div>
        </div >
    );
}