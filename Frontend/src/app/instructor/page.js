'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import ConfirmModal from '@/components/ui/ConfirmModal';
import useConfirmModal from '@/hooks/useConfirmModal';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import { useInstructorStore } from '@/store/instructorStore'; // Unified Store
import { FiUsers, FiDollarSign, FiStar, FiPlus, FiBook } from 'react-icons/fi';
import InstructorCourseCard from '@/components/instructor/InstructorCourseCard';
import { courseAPI } from '@/lib/api';

export default function InstructorDashboard() {
    const router = useRouter();
    const { user, isAuthenticated, isReady } = useAuthStore();
    const { isOpen, config, openConfirm, closeConfirm, handleConfirm } = useConfirmModal();
    const { stats, loading: statsLoading, fetchDashboardData } = useInstructorStore();

    const [courses, setCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(true);

    const loadDashboard = useCallback(async () => {
        try {
            setCoursesLoading(true);
            // Fetch Analytics
            await fetchDashboardData();

            // Fetch Course List
            const res = await courseAPI.getInstructorCourses();
            const coursesData = res.data.data || [];
            // console.log("coursesData", coursesData);

            setCourses(coursesData?.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setCoursesLoading(false);
        }
    }, [fetchDashboardData]);

    useEffect(() => {
        if (!isReady) return;
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        if (user?.role !== 'instructor') {
            router.push('/');
            return;
        }

        loadDashboard();
    }, [isReady, isAuthenticated, user, router, loadDashboard]);
    const handleTogglePublish = async (courseId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'published' ? 'draft' : 'published';
            await courseAPI.publish(courseId, newStatus);
            toast.success(`Course ${newStatus}`);
            loadDashboard();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDeleteCourse = (courseId) => {
        openConfirm({
            title: 'Delete Course',
            message: 'Are you sure? This action cannot be undone.',
            confirmText: 'Delete',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await courseAPI.delete(courseId);
                    toast.success('Course deleted');
                    loadDashboard();
                } catch (error) {
                    toast.error('Error deleting course');
                }
            }
        });
    };

    if (!isReady || (statsLoading && courses.length === 0)) {
        return (
            <DashboardLayout role="instructor">
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="instructor">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Instructor Dashboard</h1>
                        <p className="text-slate-500">Welcome back, {user?.name}. Here is your current performance.</p>
                    </div>
                    <Link
                        href="/instructor/courses/create"
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-linear-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95"
                    >
                        <FiPlus size={20} />
                        <span>Create New Course</span>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatsCard
                    icon={FiBook}
                    label="Total Courses"
                    value={statsLoading ? "..." : stats.courses}
                    color="primary"
                />
                <StatsCard
                    icon={FiUsers}
                    label="Total Students"
                    value={statsLoading ? "..." : stats.students?.toLocaleString()}
                    change={stats.studentTrend}
                    trend={stats.studentTrendDir}
                    color="secondary"
                />
                <StatsCard
                    icon={FiDollarSign}
                    label="Total Revenue"
                    value={statsLoading ? "..." : `$${stats.revenue?.toLocaleString()}`}
                    change={stats.revenueTrend}
                    trend={stats.revenueTrendDir}
                    color="success"
                />
                <StatsCard
                    icon={FiStar}
                    label="Avg Rating"
                    value={statsLoading ? "..." : stats.rating}
                    color="warning"
                />
            </div>

            {/* My Courses Section */}
            <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">Recent Courses</h2>
                    <Link href="/instructor/courses" className="text-sm font-bold text-primary-500 hover:underline">
                        View All
                    </Link>
                </div>

                {courses.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.slice(0, 3).map((course) => (
                            <InstructorCourseCard
                                key={course.id}
                                course={course}
                                editHref={`/instructor/courses/${course.id}/curriculum`}
                                viewHref={`/courses/${course.id}`}
                                onTogglePublish={handleTogglePublish}
                                onDelete={handleDeleteCourse}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-400">You haven&apos;t created any courses yet.</p>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={isOpen}
                onClose={closeConfirm}
                onConfirm={handleConfirm}
                {...config}
            />
        </DashboardLayout>
    );
}