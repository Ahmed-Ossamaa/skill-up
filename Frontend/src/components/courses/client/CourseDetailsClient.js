'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AiFillStar } from 'react-icons/ai';
import { HiOutlineUsers, HiOutlineClock, HiOutlineGlobeAlt } from 'react-icons/hi';
import { FiPlay, FiAward } from 'react-icons/fi';
import { formatNumber, formatDate, getCourseLevelLabel, getCourseLevelColor, cn } from '@/lib/utils';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CourseSidebar from '@/components/courses/CourseSidebar';
import CourseOverview from '@/components/courses/CourseOverview';
import CourseCurriculum from '@/components/courses/CourseCurriculum';
import CourseInstructor from '@/components/courses/CourseInstructor';
import CourseReviews from '@/components/courses/CourseReviews';
import ReviewForm from '@/components/form/ReviewForm';
import useAuthStore from '@/store/authStore';
import { courseAPI } from '@/lib/api';

export default function CourseDetailsClient({ course, initialReviews }) {
    const [reviews, setReviews] = useState(initialReviews);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const { user } = useAuthStore();

    //  enrollment check
    useEffect(() => {
        const checkEnrollment = async () => {
            if (user && course._id) {
                try {
                    const res = await courseAPI.checkEnrollment(course._id);
                    setIsEnrolled(res.data?.data?.isEnrolled);
                } catch (err) {
                    console.error('Error checking enrollment', err);
                }
            }
        };
        checkEnrollment();
    }, [user, course._id]);

    const handleReviewAdded = async () => {
        setActiveTab('reviews');
    };

    const isPermitted = user?._id === course.instructor._id || user?.role === 'admin';

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'content', label: 'Content' },
        { id: 'instructor', label: 'Instructor' },
        { id: 'reviews', label: 'Reviews' },
    ];

    return (
        <div className="min-h-screen">
            <Header />

            {/* Hero Section */}
            <section className="pt-32 pb-12 bg-linear-to-br from-gray-900 to-gray-800 text-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl">
                        {/* Breadcrumb */}
                        <div className="text-sm mb-4 text-gray-300">
                            <Link href="/courses" className="hover:text-white transition">Courses</Link>
                            <span className="mx-2">›</span>
                            <span>{course.category?.name || 'Category'}</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            {course.title}
                        </h1>

                        {/* Description */}
                        <p className="text-xl text-gray-300 mb-6">
                            {course.subtitle || course.description?.substring(0, 150)}...
                        </p>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            {course.rating > 0 && (
                                <div className="flex items-center space-x-2">
                                    <span className="font-bold text-yellow-400">{course.rating.toFixed(1)}</span>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <AiFillStar
                                                key={i}
                                                className={`w-5 h-5 ${i < Math.round(course.rating) ? 'text-yellow-400' : 'text-gray-600'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-gray-300">({formatNumber(course.ratingCount || 0)} ratings)</span>
                                </div>
                            )}

                            {course.enrollmentCount > 0 && (
                                <div className="flex items-center space-x-2">
                                    <HiOutlineUsers className="w-5 h-5" />
                                    <span>{formatNumber(course.enrollmentCount)} students</span>
                                </div>
                            )}

                            <span className={cn('px-3 py-1 rounded-full text-sm font-semibold', getCourseLevelColor(course.level))}>
                                {getCourseLevelLabel(course.level)}
                            </span>
                        </div>

                        {/* Instructor */}
                        <div className="flex items-center space-x-3">
                            <span className="text-gray-300">Created by</span>
                            <Link href={`/instructor/${course.instructor?._id}`}>
                                <span className="font-semibold hover:text-primary-500 hover:underline">
                                    {course.instructor?.name || 'Instructor'}
                                </span>
                            </Link>
                        </div>

                        {/* Last Updated */}
                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-300">
                            {course.updatedAt && (
                                <div className="flex items-center space-x-2">
                                    <FiAward className="w-4 h-4" />
                                    <span>Last updated {formatDate(course.updatedAt)}</span>
                                </div>
                            )}
                            <div className="flex items-center space-x-2">
                                <HiOutlineGlobeAlt className="w-4 h-4" />
                                <span>{course.language || 'English'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="py-12">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Content */}
                        <div className="lg:col-span-2">
                            {/* Tabs */}
                            <div className="flex space-x-1 glass-card p-1 mb-8 overflow-x-auto no-scrollbar">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            'px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 whitespace-nowrap',
                                            activeTab === tab.id
                                                ? 'bg-linear-to-r from-primary-500 to-secondary-500 text-white'
                                                : 'hover:bg-white/10'
                                        )}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div>
                                {activeTab === 'overview' && (
                                    <CourseOverview
                                        description={course.description}
                                        learningOutcomes={course.learningOutcomes}
                                        requirements={course.requirements}
                                        targetAudience={course.targetAudience}
                                    />
                                )}

                                {activeTab === 'content' && (
                                    <CourseCurriculum
                                        sections={course.sections || []}
                                        isEnrolled={isEnrolled}
                                        courseId={course._id}
                                        isPermitted={isPermitted}
                                    />
                                )}

                                {activeTab === 'instructor' && (
                                    <CourseInstructor instructor={course.instructor} />
                                )}

                                {activeTab === 'reviews' && (
                                    <>
                                        <CourseReviews
                                            reviews={reviews}
                                            averageRating={course.rating}
                                            totalReviews={course.ratingCount}
                                        />
                                        <ReviewForm
                                            courseId={course._id}
                                            isEnrolled={isEnrolled}
                                            onReviewAdded={handleReviewAdded}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div>
                            <CourseSidebar course={course} isEnrolled={isEnrolled} />
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}