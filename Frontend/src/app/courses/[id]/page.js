'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CourseSidebar from '@/components/courses/CourseSidebar';
import CourseOverview from '@/components/courses/CourseOverview';
import CourseCurriculum from '@/components/courses/CourseCurriculum';
import CourseInstructor from '@/components/courses/CourseInstructor';
import CourseReviews from '@/components/courses/CourseReviews';
import { courseAPI, reviewAPI } from '@/lib/api';
import { AiFillStar } from 'react-icons/ai';
import { HiOutlineUsers, HiOutlineClock, HiOutlineGlobeAlt } from 'react-icons/hi';
import { FiPlay, FiAward } from 'react-icons/fi';
import { formatNumber, formatDate, getCourseLevelLabel, getCourseLevelColor } from '@/lib/utils';
import { cn } from '@/lib/utils';


export default function CourseDetailPage() {
    const params = useParams();
    const [course, setCourse] = useState(null);
    const [sections, setSections] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        let isMounted = true;

        const fetchCourseData = async () => {
            try {
                setLoading(true);

                // Fetch course details
                const courseRes = await courseAPI.getCourseContent(params.id);
                const courseData = courseRes.data?.data || courseRes.data;
                console.log('Course:', courseData);

                // Fetch enrollment status
                let enrolled = false;
                try {
                    const enrollmentRes = await courseAPI.checkEnrollment(params.id);
                    enrolled = enrollmentRes.data?.data?.isEnrolled;
                    console.log('Enrollment:', enrolled);
                } catch (err) {
                    console.error('Error checking enrollment:', err);
                }

                // Fetch reviews
                let reviewsData = [];
                try {
                    const reviewsRes = await reviewAPI.getAll({ courseId: params.id });
                    reviewsData =
                        reviewsRes.data?.data?.data ||
                        reviewsRes.data?.data ||
                        reviewsRes.data ||
                        [];
                } catch (err) {
                    console.error('Error fetching reviews:', err);
                }

                // Update state only if component is still mounted
                if (isMounted) {
                    setCourse(courseData);
                    setSections(courseData.sections || []);
                    setIsEnrolled(enrolled);
                    setReviews(reviewsData);
                }
            } catch (err) {
                console.error('Error fetching course data:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchCourseData();

        return () => {
            isMounted = false; // cleanup
        };
    }, [params.id]);

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'content', label: 'Content' },
        { id: 'instructor', label: 'Instructor' },
        { id: 'reviews', label: 'Reviews' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen">
                <Header />
                <main className="pt-32 pb-20">
                    <div className="container mx-auto px-4">
                        {/* Loading Skeleton */}
                        <div className="animate-pulse space-y-6">
                            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                            <div className="grid lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-4">
                                    <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                    <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                </div>
                                <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded"></div>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen">
                <Header />
                <main className="pt-32 pb-20">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
                        <p className="text-gray-600 dark:text-gray-400">The course you are looking for doest exist.</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header />

            {/* Hero Section */}
            <section className="pt-32 pb-12 bg-linear-to-br from-gray-900 to-gray-800 text-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl">
                        {/* Breadcrumb */}
                        <div className="text-sm mb-4 text-gray-300">
                            <span>Courses</span>
                            <span className="mx-2">›</span>
                            <span>{course.category?.name || 'Category'}</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            {course.title}
                        </h1>

                        {/* Description */}
                        <p className="text-xl text-gray-300 mb-6">
                            {course.subtitle || course.description?.substring(0, 150)}
                        </p>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            {/* Rating */}
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
                                    <span className="text-gray-300">({formatNumber(course.reviewCount || 0)} ratings)</span>
                                </div>
                            )}

                            {/* Students */}
                            {course.enrollmentCount > 0 && (
                                <div className="flex items-center space-x-2">
                                    <HiOutlineUsers className="w-5 h-5" />
                                    <span>{formatNumber(course.enrollmentCount)} students</span>
                                </div>
                            )}

                            {/* Level */}
                            <div>
                                <span className={cn('px-3 py-1 rounded-full text-sm font-semibold', getCourseLevelColor(course.level))}>
                                    {getCourseLevelLabel(course.level)}
                                </span>
                            </div>
                        </div>

                        {/* Instructor */}
                        <div className="flex items-center space-x-3">
                            <span className="text-gray-300">Created by</span>
                            <span className="font-semibold">{course.instructor?.name || 'Instructor'}</span>
                        </div>

                        {/* Last Updated & Language */}
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
                                        sections={sections}
                                        isEnrolled={isEnrolled}
                                        courseId={params.id}

                                    />
                                )}

                                {activeTab === 'instructor' && (
                                    <CourseInstructor instructor={course.instructor} />
                                )}

                                {activeTab === 'reviews' && (
                                    <CourseReviews
                                        reviews={reviews}
                                        averageRating={course.rating}
                                        totalReviews={course.reviewCount}
                                    />
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