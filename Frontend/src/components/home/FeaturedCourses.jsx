'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { courseAPI } from '@/lib/api';
import CourseCard from '@/components/courses/CourseCard';
import { AiOutlineArrowRight } from 'react-icons/ai';

export default function FeaturedCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('popular');


    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);

                const sortMapping = {
                    popular: '-studentsCount',
                    new: '-createdAt',
                    "Top Rated": '-rating'
                };

                const params = {
                    limit: 8,
                    sort: sortMapping[activeTab] || '-createdAt',
                };

                const response = await courseAPI.getPublished(params);
                const apiData = response.data?.data || {};
                const coursesData = apiData.data || [];
                setCourses(coursesData || []);
            } catch (error) {
                console.error('Error fetching courses:', error);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [activeTab]);


    const tabs = [
        { id: 'popular', label: 'Most Popular' },
        { id: 'new', label: 'New Courses' },
        { id: 'top-rated', label: 'Top Rated' },
    ];

    return (
        <section className="py-5 bg-linear-to-b from-transparent to-gray-50/50 dark:to-gray-900/50">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                    <div className="text-center md:text-left mb-6 md:mb-0">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Featured <span className="gradient-text">Courses</span>
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Explore our most popular and highly-rated courses
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center space-x-2 glass-card p-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300',
                                    activeTab === tab.id
                                        ? 'bg-linear-to-r from-primary-500 to-secondary-500 text-white'
                                        : 'hover:bg-white/10'
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="glass-card overflow-hidden animate-pulse">
                                <div className="aspect-video bg-gray-300 dark:bg-gray-700"></div>
                                <div className="p-5 space-y-3">
                                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : courses.length > 0 ? (
                    <>
                        {/* Courses Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {courses.map((course, index) => (
                                <div key={course._id || course.id} >
                                    <CourseCard course={course} />
                                </div>
                            ))}
                        </div>

                        {/* View All Button */}
                        <div className="text-center mt-12">
                            <Link
                                href="/courses"
                                className="inline-flex items-center space-x-2 px-8 py-4 glass-button text-lg font-semibold hover:scale-105 transition-all duration-300 group"
                            >
                                <span>View All Courses</span>
                                <AiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            No courses available at the moment.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}

