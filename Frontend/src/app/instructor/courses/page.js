'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import InstructorCourseCard from '@/components/instructor/InstructorCourseCard';
import ConfirmModal from '@/components/ui/ConfirmModal';
import useConfirmModal from '@/hooks/useConfirmModal';
import toast from 'react-hot-toast';
import { courseAPI } from '@/lib/api';
import useAuthStore from '@/store/authStore';

export default function MyCoursesPage() {
    const router = useRouter();
    const { user, isAuthenticated, isReady } = useAuthStore();
    const [courses, setCourses] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const { isOpen, config, openConfirm, closeConfirm, handleConfirm } = useConfirmModal();


    const limit = 9;

    const fetchPage = async (p = 1) => {
        try {
            setLoading(true);
            const res = await courseAPI.getInstructorCourses({ page: p, limit });
            const payload = res.data.data;
            // console.log("payload", payload);
            setCourses(payload?.data || []);
            setPage(payload?.page || p);
            setPages(payload?.pages || 1);
        } catch (err) {
            console.error('Error fetching instructor courses:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isReady) return;
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        if (user && user.role !== 'instructor') {
            router.push('/');
            return;
        }
        fetchPage(page);
    }, [isReady, isAuthenticated, user, page, router]);

    // Publish / Unpublish
    const handleTogglePublish = async (courseId, currentStatus) => {
        try {
            setLoading(true);
            const newStatus = currentStatus === 'published' ? 'draft' : 'published';
            await courseAPI.publish(courseId, newStatus);
            await fetchPage(page);
        } catch (error) {
            console.error('Error toggling publish status:', error);
        } finally {
            setLoading(false);
        }
    };


    // Delete a course
    const handleDeleteCourse = (courseId) => {
        openConfirm({
            title: 'Delete Course',
            message: 'Are you sure you want to delete this course? This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    setLoading(true);
                    await courseAPI.delete(courseId);
                    await fetchDashboardData();
                } catch (error) {
                    toast.error('Error deleting course');
                    console.error('Error deleting course:', error);
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    if (!isReady || loading) {
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
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black  tracking-tight italic uppercase">My Courses</h1>
                </div>
                <Link href="/instructor/courses/create" className="px-4 py-2 bg-primary-500 text-white rounded-md">Create Course</Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {courses.map((course) => (
                    <InstructorCourseCard
                        key={course.id || course._id}
                        course={course}
                        editHref={`/instructor/courses/${course.id || course._id}/curriculum`}
                        viewHref={`/courses/${course.id || course._id}`}
                        onTogglePublish={handleTogglePublish}
                        onDelete={handleDeleteCourse}
                        loading={loading}
                    />
                ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Page {page} of {pages}</div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 rounded-md bg-white/5 disabled:opacity-50"
                    >
                        Prev
                    </button>

                    <div className="flex items-center space-x-1">
                        {Array.from({ length: pages }, (_, i) => i + 1).map((pn) => (
                            <button
                                key={pn}
                                onClick={() => setPage(pn)}
                                aria-current={pn === page ? 'page' : undefined}
                                className={`px-3 py-1 rounded-md text-sm ${pn === page ? 'bg-primary-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}
                            >
                                {pn}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setPage((p) => Math.min(pages, p + 1))}
                        disabled={page === pages}
                        className="px-3 py-1 rounded-md bg-primary-500 text-white disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
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