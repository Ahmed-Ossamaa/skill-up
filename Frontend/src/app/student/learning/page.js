'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import useAuthStore from '@/store/authStore';
import { enrollmentAPI } from '@/lib/api';
import { FiSearch, FiBook } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import EnrolledCourseCard from '@/components/student/EnrolledCourseCard';

export default function MyLearningPage() {
    const router = useRouter();
    const { user, isAuthenticated, isReady } = useAuthStore();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (!isReady) return;
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        if (user && user.role !== 'student') {
            router.push('/');
            return;
        }

        const fetchEnrollments = async () => {
            try {
                setLoading(true);
                const { data: response } = await enrollmentAPI.getMyEnrollments();
                setEnrollments(response.data || []);
            } catch (error) {
                console.error('Error fetching enrollments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEnrollments();
    }, [isReady, isAuthenticated, user, router]);

    // --- Filter Logic ---
    const filteredCourses = enrollments.filter(enrollment => {
        // Search Filter
        const matchesSearch = enrollment.course.title.toLowerCase().includes(searchQuery.toLowerCase());

        //filter tabs
        const isCompleted = enrollment.progress?.percentage === 100 || enrollment.status === 'completed';
        let matchesTab = true;

        if (activeTab === 'in-progress') matchesTab = !isCompleted;
        if (activeTab === 'completed') matchesTab = isCompleted;

        return matchesSearch && matchesTab;
    });

    const tabs = [
        { id: 'all', label: 'All Courses' },
        { id: 'in-progress', label: 'In Progress' },
        { id: 'completed', label: 'Completed' },
    ];

    if (loading || !isReady) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="student">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase mb-3">My Learning</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Track your progress and continue where you left off.
                </p>
            </div>

            {/* filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                {/* Tabs */}
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full md:w-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all',
                                activeTab === tab.id
                                    ? 'bg-white dark:bg-gray-700 shadow-xs text-primary-600 dark:text-primary-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-80">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search your courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Course Grid */}
            {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((enrollment) => (
                        <div key={enrollment.course._id || enrollment._id}>
                            <EnrolledCourseCard enrollment={enrollment} />
                        </div>
                    ))}
                </div>
            ) : (
                // ... Empty State  ...
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiBook className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">No courses found</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        {searchQuery
                            ? `We couldn't find any courses matching "${searchQuery}"`
                            : activeTab === 'completed'
                                ? "You haven't completed any courses yet. Keep going!"
                                : "You haven't enrolled in any courses yet."}
                    </p>
                    {!searchQuery && activeTab !== 'completed' && (
                        <Link href="/courses" className="btn-primary">
                            Browse Courses
                        </Link>
                    )}
                    {(searchQuery || activeTab === 'completed') && (
                        <button
                            onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
                            className="text-primary-500 hover:text-primary-600 font-medium"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
}