'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import useAuthStore from '@/store/authStore';
import { adminAPI } from '@/lib/api'; 
import { FiUsers, FiBook, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { formatPrice, formatNumber, formatDate } from '@/lib/utils'; 

export default function AdminDashboard() {
    const router = useRouter();
    const { user, isAuthenticated, isReady } = useAuthStore();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCourses: 0,
        totalRevenue: 0,
        activeStudents: 0,
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentCourses, setRecentCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isReady) return;

        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        if (user && user.role !== 'admin') {
            router.push('/');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const { data: response } = await adminAPI.getStats();
                const { stats, recentUsers, recentCourses } = response.data;

                setStats(stats);
                setRecentUsers(recentUsers);
                setRecentCourses(recentCourses);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [isReady, isAuthenticated, user, router]);

    if (loading || !isReady) {
        return (
            <DashboardLayout role="admin">
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="admin">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Welcome back, {user?.name}! Here is your platform overview.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    icon={FiUsers}
                    label="Total Users"
                    value={formatNumber(stats.totalUsers)}
                    trend="neutral"
                    color="primary"
                />
                <StatsCard
                    icon={FiBook}
                    label="Total Courses"
                    value={formatNumber(stats.totalCourses)}
                    trend="neutral"
                    color="secondary"
                />
                <StatsCard
                    icon={FiDollarSign}
                    label="Total Revenue"
                    value={formatPrice(stats.totalRevenue)}
                    trend="up"
                    color="success"
                />
                <StatsCard
                    icon={FiTrendingUp}
                    label="Active Students"
                    value={formatNumber(stats.activeStudents)}
                    trend="neutral"
                    color="info"
                />
            </div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Users */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Recent Users</h2>
                        <button
                            onClick={() => router.push('/admin/users')}
                            className="text-sm text-primary-500 hover:text-primary-600 font-medium"
                        >
                            View All
                        </button>
                    </div>
                    <div className="space-y-4">
                        {recentUsers.length > 0 ? recentUsers.map((u) => (
                            <div key={u._id} className="flex items-center justify-between p-4 glass rounded-lg hover:bg-white/5 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-linear-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                                        {u.name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-semibold line-clamp-1">{u.name}</p>
                                        <p className="text-sm text-gray-500">{u.email}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className={`px-3 py-1 text-xs rounded-full font-medium capitalize ${u.role === 'admin' ? 'bg-red-500/10 text-red-500' :
                                            u.role === 'instructor' ? 'bg-blue-500/10 text-blue-500' :
                                                'bg-green-500/10 text-green-500'
                                        }`}>
                                        {u.role}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatDate(u.createdAt)}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-gray-500 py-4">No users found.</p>
                        )}
                    </div>
                </div>

                {/* Recent Courses */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Recent Courses</h2>
                        <button
                            onClick={() => router.push('/admin/courses')}
                            className="text-sm text-primary-500 hover:text-primary-600 font-medium"
                        >
                            View All
                        </button>
                    </div>
                    <div className="space-y-4">
                        {recentCourses.length > 0 ? recentCourses.map((c) => (
                            <div key={c._id} className="p-4 glass rounded-lg hover:bg-white/5 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold line-clamp-1 pr-2">{c.title}</h3>
                                    <span className="font-bold text-primary-500 whitespace-nowrap">
                                        {c.price === 0 ? 'Free' : formatPrice(c.price)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        by {c.instructor?.name || 'Unknown'}
                                    </span>
                                    <span className="text-gray-500 flex items-center gap-1">
                                        <FiUsers className="w-3 h-3" />
                                        {c.studentsCount || 0}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-gray-500 py-4">No courses found.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                    onClick={() => router.push('/admin/users')}
                    className="glass-card p-6 hover:scale-105 transition-transform duration-300 text-center group"
                >
                    <FiUsers className="w-8 h-8 mx-auto mb-2 text-primary-500 group-hover:scale-110 transition-transform" />
                    <p className="font-semibold">Manage Users</p>
                </button>
                <button
                    onClick={() => router.push('/admin/courses')}
                    className="glass-card p-6 hover:scale-105 transition-transform duration-300 text-center group"
                >
                    <FiBook className="w-8 h-8 mx-auto mb-2 text-secondary-500 group-hover:scale-110 transition-transform" />
                    <p className="font-semibold">Manage Courses</p>
                </button>
                <button
                    onClick={() => router.push('/admin/revenue')}
                    className="glass-card p-6 hover:scale-105 transition-transform duration-300 text-center group"
                >
                    <FiDollarSign className="w-8 h-8 mx-auto mb-2 text-green-500 group-hover:scale-110 transition-transform" />
                    <p className="font-semibold">View Revenue</p>
                </button>
                <button
                    onClick={() => router.push('/admin/analytics')}
                    className="glass-card p-6 hover:scale-105 transition-transform duration-300 text-center group"
                >
                    <FiTrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-500 group-hover:scale-110 transition-transform" />
                    <p className="font-semibold">Analytics</p>
                </button>
            </div>
        </DashboardLayout>
    );
}