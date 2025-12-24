'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ConfirmModal from '@/components/ui/ConfirmModal';
import useConfirmModal from '@/hooks/useConfirmModal';
import { courseAPI } from '@/lib/api';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaBookOpen, FaUserSecret } from 'react-icons/fa';
import { FiActivity, FiChevronLeft, FiChevronRight, FiSearch, FiTrash2, FiX, FiFilter } from 'react-icons/fi';

export default function AdminCourses() {
    const router = useRouter();
    const { user, isAuthenticated, isReady } = useAuthStore();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        instructor: '',
        minStudents: '',
        status: ''
    });

    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
    const { isOpen, config, openConfirm, closeConfirm, handleConfirm } = useConfirmModal();

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ instructor: '', minStudents: '', status: '' });
    };

    const fetchPage = useCallback(async (pageNumber = 1) => {
        try {
            setLoading(true);

            const params = { page: pageNumber, limit: pagination.limit };

            if (filters.instructor) params.instructor = filters.instructor;
            if (filters.minStudents) params.minStudents = filters.minStudents;
            if (filters.status) params.status = filters.status;


            const res = await courseAPI.getAll(params);
            const payload = res.data.data;

            setCourses(payload.data || []);
            setPagination(prev => ({
                ...prev,
                page: payload.page || pageNumber,
                pages: payload.pages || 1,
                total: payload.total || 0
            }));
        } catch (err) {
            console.error('Error fetching courses:', err);
            toast.error('Error loading courses');
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.limit]);

    useEffect(() => {
        if (isReady && !isAuthenticated) router.push('/auth/login');
        if (isReady && user && user.role !== 'admin') router.push('/');
    }, [isReady, isAuthenticated, user, router]);

    // Debounced filter >> 500ms (my function from utils doesnt work here > fix later)
    useEffect(() => {
        if (!isReady || !user || user.role !== 'admin') return;
        const timer = setTimeout(() => {
            fetchPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [filters, fetchPage, isReady, user]);

    //.....Handlers.....
    const handleDeleteClick = (courseId) => {
        openConfirm({
            title: "Delete Course",
            message: "Are you sure? This action is irreversible and will delete all student progress.",
            confirmText: "Delete Forever",
            type: "danger",
            onConfirm: async () => {
                try {
                    await courseAPI.delete(courseId);
                    toast.success('Course deleted');
                    fetchPage(pagination.page);
                } catch (error) {
                    toast.error('Error deleting course');
                }
            }
        });
    };

    if (!isReady) return null;

    return (
        <DashboardLayout role="admin">
            <div className="py-8 max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
                        <p className="text-gray-500">Overview of all courses</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {(filters.instructor || filters.minStudents || filters.status) && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition font-medium px-3 py-1.5 rounded-lg hover:bg-red-50"
                            >
                                <FiX /> Clear Filters
                            </button>
                        )}
                        <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100">
                            {pagination.total} Courses
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* Search */}
                        <div className="relative group">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search Instructor..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                value={filters.instructor}
                                onChange={(e) => handleFilterChange('instructor', e.target.value)}
                            />
                        </div>

                        {/*Status (Published, Draft) */}
                        <div className="relative group">
                            <FiActivity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            <select
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer text-gray-600"
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                            </select>
                            <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                        </div>

                        {/* Min Students */}
                        <div className="relative group">
                            <FaUserSecret className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="number"
                                min={0}
                                placeholder="Min Students"
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                                value={filters.minStudents}
                                onChange={(e) => handleFilterChange('minStudents', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Table Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[400px]">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                            <th className="px-6 py-4">Course info</th>
                                            <th className="px-6 py-4">Instructor</th>
                                            <th className="px-6 py-4 text-center">Stats</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {courses.length > 0 ? (
                                            courses.map((course) => (
                                                <tr key={course._id || course.id} className="hover:bg-gray-100 transition-colors group capitalize">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                                                <FaBookOpen size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900 line-clamp-1">{course.title}</p>

                                                                {course.isFree ? (
                                                                    <p className="text-xs text-green-600 font-bold">Free</p>
                                                                ) : (
                                                                    <p className="text-xs text-gray-500 font-medium">${course.price || 0}</p>
                                                                )}

                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                                        {course.instructor?.name || "Unknown"}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
                                                            {course.studentsCount || 0} Students
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${course.status === 'published'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                                            }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${course.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'
                                                                }`}></span>
                                                            {course.status ? (course.status.charAt(0).toUpperCase() + course.status.slice(1)) : 'Draft'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleDeleteClick(course._id || course.id)}
                                                            className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                                                            title="Delete Course"
                                                        >
                                                            <FiTrash2 size={18} className="cursor-pointer" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <FiSearch className="w-8 h-8 text-gray-300" />
                                                        <p>No courses found matching filters.</p>
                                                        <button onClick={clearFilters} className="text-indigo-600 text-sm hover:underline">Clear all filters</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.total > 0 && (
                                <div className="flex items-center justify-between p-4 border-t border-gray-100 mt-auto">
                                    <p className="text-sm text-gray-500">
                                        Showing {courses.length} of {pagination.total}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={pagination.page <= 1}
                                            onClick={() => fetchPage(pagination.page - 1)}
                                            className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                                        >
                                            <FiChevronLeft />
                                        </button>
                                        <span className="px-4 py-2 text-sm font-medium bg-gray-50 rounded-lg">
                                            Page {pagination.page}
                                        </span>
                                        <button
                                            disabled={pagination.page >= pagination.pages}
                                            onClick={() => fetchPage(pagination.page + 1)}
                                            className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                                        >
                                            <FiChevronRight />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <ConfirmModal
                    isOpen={isOpen}
                    onClose={closeConfirm}
                    {...config}
                    onConfirm={handleConfirm}
                />
            </div>
        </DashboardLayout>
    );
}