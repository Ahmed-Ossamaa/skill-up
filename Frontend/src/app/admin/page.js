'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import useAuthStore from '@/store/authStore';
import { FiUsers, FiBook, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { formatPrice, formatNumber } from '@/lib/utils';

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
        // Wait for auth to finish initial hydration
        if (!isReady) return;

        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        // Check if user data is loaded and has admin role
        if (user && user.role !== 'admin') {
            router.push('/');
            return;
        }

        // Only fetch data when user is confirmed admin
        if (user && user.role === 'admin') {
            fetchDashboardData();
        }
    }, [isReady, isAuthenticated, user, router]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // TODO: Replace with actual API calls
            // const statsRes = await adminAPI.getStats();
            // const usersRes = await adminAPI.getRecentUsers();
            // const coursesRes = await adminAPI.getRecentCourses();

            // Mock data for now
            setStats({
                totalUsers: 15234,
                totalCourses: 1580,
                totalRevenue: 125000,
                activeStudents: 12500,
            });

            setRecentUsers([
                { id: 1, name: 'John Doe', email: 'john@example.com', role: 'student', joinedAt: '2025-01-15' },
                { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'instructor', joinedAt: '2025-01-14' },
                { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'student', joinedAt: '2025-01-13' },
            ]);

            setRecentCourses([
                { id: 1, title: 'React Masterclass', instructor: 'John Doe', students: 234, price: 99.99 },
                { id: 2, title: 'Node.js Complete Guide', instructor: 'Jane Smith', students: 189, price: 79.99 },
                { id: 3, title: 'Python for Beginners', instructor: 'Bob Wilson', students: 456, price: 49.99 },
            ]);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

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
                <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.name}! Here is what&apos;s happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    icon={FiUsers}
                    label="Total Users"
                    value={formatNumber(stats.totalUsers)}
                    change="+12.5%"
                    trend="up"
                    color="primary"
                />
                <StatsCard
                    icon={FiBook}
                    label="Total Courses"
                    value={formatNumber(stats.totalCourses)}
                    change="+8.2%"
                    trend="up"
                    color="secondary"
                />
                <StatsCard
                    icon={FiDollarSign}
                    label="Total Revenue"
                    value={formatPrice(stats.totalRevenue)}
                    change="+23.1%"
                    trend="up"
                    color="success"
                />
                <StatsCard
                    icon={FiTrendingUp}
                    label="Active Students"
                    value={formatNumber(stats.activeStudents)}
                    change="+5.7%"
                    trend="up"
                    color="info"
                />
            </div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Users */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Recent Users</h2>
                        <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                            View All
                        </button>
                    </div>
                    <div className="space-y-4">
                        {recentUsers.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-4 glass rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-linear-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="px-3 py-1 bg-primary-500/20 text-primary-500 text-xs rounded-full font-medium capitalize">
                                        {user.role}
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">{user.joinedAt}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Courses */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Recent Courses</h2>
                        <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                            View All
                        </button>
                    </div>
                    <div className="space-y-4">
                        {recentCourses.map((course) => (
                            <div key={course.id} className="p-4 glass rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold">{course.title}</h3>
                                    <span className="font-bold text-primary-500">{formatPrice(course.price)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">by {course.instructor}</span>
                                    <span className="text-gray-500">{course.students} students</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="glass-card p-6 hover:scale-105 transition-transform duration-300 text-center">
                    <FiUsers className="w-8 h-8 mx-auto mb-2 text-primary-500" />
                    <p className="font-semibold">Manage Users</p>
                </button>
                <button className="glass-card p-6 hover:scale-105 transition-transform duration-300 text-center">
                    <FiBook className="w-8 h-8 mx-auto mb-2 text-secondary-500" />
                    <p className="font-semibold">Manage Courses</p>
                </button>
                <button className="glass-card p-6 hover:scale-105 transition-transform duration-300 text-center">
                    <FiDollarSign className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="font-semibold">View Revenue</p>
                </button>
                <button className="glass-card p-6 hover:scale-105 transition-transform duration-300 text-center">
                    <FiTrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <p className="font-semibold">Analytics</p>
                </button>
            </div>
        </DashboardLayout>
    );
}