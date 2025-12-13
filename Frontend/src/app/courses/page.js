'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Filters from '@/components/courses/Filters';
import CourseGrid from '@/components/courses/CourseGrid';
import { courseAPI } from '@/lib/api';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';


export default function CoursesPage() {
    const searchParams = useSearchParams();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [sortBy, setSortBy] = useState('-createdAt');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCourses: 0,
        limit: 12,
    });

    const [filters, setFilters] = useState({
        category: searchParams.get('category') || null,
        level: null,
        priceRange: null,
        rating: null,
    });


    const fetchCourses = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: pagination.limit,
                sort: sortBy,
                ...(searchQuery && { search: searchQuery }),
                ...(filters.category && { category: filters.category }),
                ...(filters.level && { level: filters.level }),
                ...(filters.rating && { rating: filters.rating }),
            };

            if (filters.priceRange) {
                if (filters.priceRange === 'free') params.isFree = true;
                else if (filters.priceRange === 'paid') params.isFree = false;
                else if (filters.priceRange.includes('-')) {
                    const [min, max] = filters.priceRange.split('-');
                    params.minPrice = min;
                    if (max !== '+') params.maxPrice = max;
                }
            }

            const response = await courseAPI.getPublished(params);
            const apiData = response.data?.data || {};
            const coursesData = apiData.data || [];

            setCourses(coursesData);

            setPagination(prev => ({
                ...prev,
                totalPages: apiData.pages || 1,
                totalCourses: apiData.total || 0,
                currentPage: page,
            }));
        } catch (error) {
            console.error('Error fetching courses:', error);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, [filters, sortBy, searchQuery, pagination.limit]); // removed currentPage


    useEffect(() => {
        fetchCourses(1);
    }, [fetchCourses, sortBy, filters, searchQuery]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleClearFilters = () => {
        setFilters({
            category: null,
            level: null,
            priceRange: null,
            rating: null,
        });
        setSearchQuery('');
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const sortOptions = [
        { value: '-createdAt', label: 'Newest First' },
        { value: 'createdAt', label: 'Oldest First' },
        { value: '-enrollmentCount', label: 'Most Popular' },
        { value: '-rating', label: 'Highest Rated' },
        { value: 'price', label: 'Price: Low to High' },
        { value: '-price', label: 'Price: High to Low' },
    ];

    return (
        <div className="min-h-screen">
            <Header />

            <main className="pt-32 pb-20">
                <div className="container mx-auto px-4">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Explore <span className="gradient-text">Courses</span>
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            {pagination.totalCourses > 0
                                ? `${pagination.totalCourses.toLocaleString()} courses available`
                                : 'Discover your next learning adventure'}
                        </p>
                    </div>

                    {/* Search and Sort Bar */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search courses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full glass rounded-full pl-12 pr-4 py-3 focus-ring"
                                />
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            </div>
                        </form>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="glass rounded-full px-6 py-3 focus-ring min-w-[200px]"
                        >
                            {sortOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="lg:hidden glass-button flex items-center justify-center space-x-2"
                        >
                            <FiFilter className="w-5 h-5" />
                            <span>Filters</span>
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="grid lg:grid-cols-4 gap-8">
                        {/* Filters Sidebar - Desktop */}
                        <div className="hidden lg:block">
                            <Filters
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onClearFilters={handleClearFilters}
                            />
                        </div>

                        {/* Mobile Filters */}
                        {showMobileFilters && (
                            <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setShowMobileFilters(false)}>
                                <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-gray-900 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                                        <h3 className="text-xl font-bold">Filters</h3>
                                        <button onClick={() => setShowMobileFilters(false)}>
                                            <FiX className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <Filters
                                            filters={filters}
                                            onFilterChange={handleFilterChange}
                                            onClearFilters={handleClearFilters}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Course Grid */}
                        <div className="lg:col-span-3">
                            <CourseGrid courses={courses} loading={loading} />

                            {/* Pagination */}
                            {!loading && courses.length > 0 && pagination.totalPages > 1 && (
                                <div className="flex justify-center mt-12 space-x-2">
                                    <button
                                        onClick={() => fetchCourses(Math.max(1, pagination.currentPage - 1))}
                                        disabled={pagination.currentPage === 1}
                                        className="px-4 py-2 glass-button disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    <div className="flex space-x-2">
                                        {[...Array(pagination.totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => fetchCourses(i + 1)}
                                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${pagination.currentPage === i + 1
                                                    ? 'bg-linear-to-r from-primary-500 to-secondary-500 text-white'
                                                    : 'glass-button'
                                                    }`}

                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => fetchCourses(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                                        disabled={pagination.currentPage === pagination.totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}