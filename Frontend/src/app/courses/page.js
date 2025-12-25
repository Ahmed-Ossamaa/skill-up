'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Filters from '@/components/courses/Filters';
import CourseGrid from '@/components/courses/CourseGrid';
import { courseAPI } from '@/lib/api';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

function CoursesContent() {
    const searchParams = useSearchParams();

    // --- State Management ---
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Search & Sort State
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [sortBy, setSortBy] = useState('-createdAt');

    // Pagination State
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCourses: 0,
        limit: 12,
    });

    // Filter State
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || null,
        level: null,
        priceRange: null,
        rating: null,
    });


    // --- Memoized Options ---
    const sortOptions = useMemo(() => [
        { value: '-createdAt', label: 'Newest First' },
        { value: '-studentsCount', label: 'Most Popular' },
        { value: '-rating', label: 'Highest Rated' },
        { value: 'price', label: 'Price: Low to High' },
        { value: '-price', label: 'Price: High to Low' },
    ], []);

    // --- Data Fetching ---
    const fetchCourses = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: pagination.limit,
                sort: sortBy,
                ...(searchQuery && { search: searchQuery }),
                ...(filters.category && { category: filters.category }),
                ...(filters.level && { level: filters.level }),
                ...(filters.rating && { rating: filters.rating }),
            };

            // Price range parsing logic
            if (filters.priceRange) {
                if (filters.priceRange === 'free') {
                    params.isFree = true;
                } else if (filters.priceRange === 'paid') {
                    params.isFree = false;
                } else if (filters.priceRange.includes('-')) {
                    const [min, max] = filters.priceRange.split('-');
                    params.priceMin = min;
                    if (max !== '+') params.priceMax = max;
                } else if (filters.priceRange.includes('+')) {
                    const min = filters.priceRange.replace('+', '');
                    params.priceMin = min;
                }
            }

            const { data: response } = await courseAPI.getPublished(params);
            const apiData = response?.data || {};

            setCourses(apiData.data || []);
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
    }, [filters, sortBy, searchQuery, pagination.limit]);

    useEffect(() => {
        fetchCourses(1);
    }, [fetchCourses]);

    // --- Handlers ---
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleClearFilters = () => {
        setFilters({ category: null, level: null, priceRange: null, rating: null });
        setSearchQuery('');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Header />

            <main className="pt-32 pb-20 container mx-auto px-4">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter  dark:text-white italic">
                        EXPLORE <span className="text-primary-500">COURSES</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">
                        {pagination.totalCourses.toLocaleString()} masterclasses ready for you.
                    </p>
                </div>

                {/* Control Bar */}
                <div className="flex flex-col lg:flex-row gap-4 mb-10">
                    <div className="relative flex-1 group">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="What do you want to learn today?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex gap-3">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="h-14 px-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-700 dark:text-slate-200 outline-none shadow-sm cursor-pointer appearance-none "
                        >
                            {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)} j
                        </select>

                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="lg:hidden h-14 px-6 bg-primary-500 text-white rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-primary-500/20"
                        >
                            <FiFilter /> Filters
                        </button>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid lg:grid-cols-4 gap-10">
                    {/* Filters Sidebar */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-32">
                            <Filters
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onClearFilters={handleClearFilters}
                            />
                        </div>
                    </aside>

                    {/* Course Display */}
                    <div className="lg:col-span-3">
                        <CourseGrid courses={courses} loading={loading} />

                        {!loading && courses.length > 0 && (
                            <div className="mt-16 flex items-center justify-center gap-4">
                                <button
                                    onClick={() => fetchCourses(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                    className="px-6 py-3 rounded-xl font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                                >
                                    Prev
                                </button>
                                <span className="font-black text-slate-400 uppercase tracking-widest text-xs">
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => fetchCourses(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                    className="px-6 py-3 rounded-xl font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />

            {/* Mobile Filter Overlay */}
            <AnimatePresence>
                {showMobileFilters && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 lg:hidden bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setShowMobileFilters(false)}
                    >
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute right-0 top-0 bottom-0 w-[85%] bg-white dark:bg-slate-950 p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black italic">FILTERS</h3>
                                <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                                    <FiX size={20} />
                                </button>
                            </div>
                            <Filters filters={filters} onFilterChange={handleFilterChange} onClearFilters={handleClearFilters} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function CoursesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading courses...</div>}>
            <CoursesContent />
        </Suspense>
    );
}