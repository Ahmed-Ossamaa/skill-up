'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiPlay, FiClock, FiFileText, FiDownload, FiInbox, FiAward, FiSmartphone } from 'react-icons/fi';
import { HiOutlineBookOpen, HiOutlineUsers } from 'react-icons/hi';
import { AiFillStar } from 'react-icons/ai';
import { formatPrice, formatDuration, isOnSale, getFinalPrice } from '@/lib/utils';
import { courseAPI } from '@/lib/api';
import useAuthStore from '@/store/authStore';
import { toast } from 'react-hot-toast';

export default function CourseSidebar({ course, isEnrolled = false, onEnroll }) {
    const [enrolled, setEnrolled] = useState(isEnrolled);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { accessToken } = useAuthStore();

    const finalPrice = getFinalPrice(course);
    const onSale = isOnSale(course);
    const discount = course.discount;
    const sections = course.sections;
    const videoCount = sections.reduce((total, section) => {
        return total + (section.lessons?.filter(l => l.type === 'video').length || 0);
    }, 0);
    const documentsCount = sections.reduce((total, section) => {
        return total + (section.lessons?.filter(l => l.type === 'document' || l.type === 'raw').length || 0);
    }, 0);
    const totalDuration = sections.reduce((acc, section) => {
        const sectionTime = section.lessons?.reduce((sum, lesson) => sum + (lesson.duration || 0), 0) || 0;
        return acc + sectionTime;
    }, 0);

    const features = [
        { icon: FiClock, label: `${videoCount || 0} on-demand video` },
        { icon: FiFileText, label: `${documentsCount|| 0} articles` },
        { icon: FiInbox, label: 'Full lifetime access' },
        { icon: FiSmartphone, label: 'Access on mobile and TV' },
        { icon: FiAward, label: 'Certificate of completion' },
    ];

    const handleEnroll = async () => {
        if (!accessToken) {
            toast.error('You must be logged in to enroll');
            return;
        } else if (enrolled) {
            toast.error('You are already enrolled in this course');
            return;
        } else if (!course.isFree) {
            router.push(`/checkout/${course._id || course.id}`);
            return;
        }

        try {
            setLoading(true);
            await courseAPI.enroll(course._id);
            setEnrolled(true);
            toast.success('Enrolled successfully');
            if (onEnroll) onEnroll();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Enrollment failed');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="lg:sticky lg:top-24">
            <div className="glass-card overflow-hidden">
                {/* Video Preview */}
                <div className="relative aspect-video bg-gray-900">
                    {course.thumbnail?.url ? (
                        <Image 
                        src={course.thumbnail.url} 
                        alt={course.title} 
                        fill 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={true}
                        className="object-cover" />
                    ) : (
                        <div className="w-full h-full bg-linear-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                            <HiOutlineBookOpen className="w-16 h-16 text-white/50 " />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Price */}
                    <div className="mb-6">
                        {course.isFree ? (
                            <div className="text-3xl font-bold gradient-text">Free</div>
                        ) : (
                            <div className="flex items-baseline space-x-3">
                                <div className="text-3xl font-bold">{formatPrice(finalPrice)}</div>
                                {onSale && (
                                    <>
                                        <div className="text-lg text-gray-500 line-through">{formatPrice(course.price)}</div>
                                        <div className="px-2 py-1 bg-red-500 text-white text-sm font-bold rounded">{discount}% OFF</div>
                                    </>
                                )}
                            </div>
                        )}
                        {onSale && course.saleEndsAt && (
                            <div className="text-sm text-red-500 mt-2">
                                ⏰ Sale ends {new Date(course.saleEndsAt).toLocaleDateString()}
                            </div>
                        )}
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-3 mb-6">
                        {enrolled ? (
                            <button
                                disabled={true}
                                className="w-full py-3 bg-linear-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold cursor-not-allowed">
                                Enrolled
                            </button>
                        ) : (
                            <button
                                onClick={handleEnroll}
                                disabled={loading}
                                className="w-full py-3 bg-linear-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                            >
                                {course.isFree ? 'Enroll for Free' : 'Enroll'}
                            </button>
                        )}
                    </div>

                    {/* 30-Day Money Back */}
                    {!course.isFree && (
                        <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
                            30-Day Money-Back Guarantee
                        </div>
                    )}

                    {/* This Course Includes */}
                    <div className="border-t border-white/10 pt-6">
                        <h3 className="font-semibold mb-4">This course includes:</h3>
                        <div className="space-y-3">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-center space-x-3 text-sm">
                                    <feature.icon className="w-5 h-5 text-gray-500 shrink-0" />
                                    <span className="text-gray-600 dark:text-gray-300">{feature.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Card */}
            <div className="glass-card p-6 mt-6">
                <h3 className="font-semibold mb-4">Course Stats</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <AiFillStar className="w-5 h-5 text-yellow-500" />
                            <span className="text-sm">Rating</span>
                        </div>
                        <span className="font-semibold">{course.rating?.toFixed(1) || 'N/A'} ({course.ratingCount || 0})</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <HiOutlineUsers className="w-5 h-5" />
                            <span className="text-sm">Students</span>
                        </div>
                        <span className="font-semibold">{course.students.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <FiClock className="w-5 h-5" />
                            <span className="text-sm">Duration</span>
                        </div>
                        <span className="font-semibold">{formatDuration(totalDuration) || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
