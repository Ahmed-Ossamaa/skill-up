import Image from 'next/image';
import Link from 'next/link';
import { HiOutlineAcademicCap, HiOutlineUsers, HiOutlineStar } from 'react-icons/hi';
import { FiPlay } from 'react-icons/fi';
import { formatNumber } from '@/lib/utils';

export default function CourseInstructor({ instructor }) {
    if (!instructor) return null;

    return (
        <div className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-6">Instructor</h2>

            <div className="flex items-start space-x-4 mb-6">
                {/* Avatar */}
                <Link href={`/instructor/${instructor._id}`} className="shrink-0">
                    {instructor.avatar ? (
                        <Image
                            src={instructor.avatar}
                            alt={instructor.name}
                            width={80}
                            height={80}
                            className="rounded-full ring-4 ring-primary-500/20"
                        />
                    ) : (
                        <div className="w-20 h-20 bg-linear-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold ring-4 ring-primary-500/20">
                            {instructor.name?.charAt(0) || 'I'}
                        </div>
                    )}
                </Link>

                {/* Info */}
                <div className="flex-1">
                    <Link href={`/instructor/${instructor._id}`} className="hover:text-primary-500 transition-colors">
                        <h3 className="text-xl font-bold mb-1">{instructor.name}</h3>
                    </Link>
                    {instructor.title && (
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{instructor.title}</p>
                    )}

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 text-sm">
                        {instructor.rating && (
                            <div className="flex items-center space-x-1">
                                <HiOutlineStar className="w-4 h-4 text-yellow-500" />
                                <span className="font-semibold">{instructor.rating.toFixed(1)}</span>
                                <span className="text-gray-500">Instructor Rating</span>
                            </div>
                        )}
                        {instructor.reviewCount && (
                            <div className="flex items-center space-x-1">
                                <span className="font-semibold">{formatNumber(instructor.reviewCount)}</span>
                                <span className="text-gray-500">Reviews</span>
                            </div>
                        )}
                        {instructor.studentsCount && (
                            <div className="flex items-center space-x-1">
                                <HiOutlineUsers className="w-4 h-4" />
                                <span className="font-semibold">{formatNumber(instructor.studentsCount)}</span>
                                <span className="text-gray-500">Students</span>
                            </div>
                        )}
                        {instructor.coursesCount && (
                            <div className="flex items-center space-x-1">
                                <HiOutlineAcademicCap className="w-4 h-4" />
                                <span className="font-semibold">{instructor.coursesCount}</span>
                                <span className="text-gray-500">Courses</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bio */}
            {instructor.bio && (
                <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {instructor.bio}
                    </p>
                </div>
            )}
        </div>
    );
}