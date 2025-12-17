'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import useAuthStore from '@/store/authStore';
import { FiBook, FiAward, FiClock, FiTrendingUp, FiPlay } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';

export default function StudentDashboard() {
    const router = useRouter();
    const { user, isAuthenticated, isReady } = useAuthStore();
    const [stats, setStats] = useState({
        enrolledCourses: 0,
        completedCourses: 0,
        totalHours: 0,
        certificates: 0,
    });
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // TODO: Replace with actual API calls
            // const statsRes = await studentAPI.getStats();
            // const coursesRes = await studentAPI.getEnrolledCourses();

            // Mock data
            setStats({
                enrolledCourses: 8,
                completedCourses: 3,
                totalHours: 45.5,
                certificates: 3,
            });

            setEnrolledCourses([
                {
                    id: 1,
                    title: 'React Complete Guide',
                    instructor: 'John Doe',
                    progress: 65,
                    thumbnail: null,
                    lastAccessed: '2 days ago',
                },
                {
                    id: 2,
                    title: 'Node.js Masterclass',
                    instructor: 'Jane Smith',
                    progress: 40,
                    thumbnail: null,
                    lastAccessed: '1 week ago',
                },
                {
                    id: 3,
                    title: 'JavaScript Advanced',
                    instructor: 'Bob Wilson',
                    progress: 90,
                    thumbnail: null,
                    lastAccessed: 'Yesterday',
                },
            ]);

            setRecentActivity([
                { id: 1, action: 'Completed', item: 'React Hooks Lesson', time: '2 hours ago' },
                { id: 2, action: 'Started', item: 'Node.js Express Module', time: '1 day ago' },
                { id: 3, action: 'Earned', item: 'JavaScript Certificate', time: '3 days ago' },
            ]);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // wait for auth hydration
        if (!isReady) return;

        // Check if user is student
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        if (user && user.role !== 'student') {
            router.push('/');
            return;
        }

        fetchDashboardData();
    }, [isReady, isAuthenticated, user, router]);

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
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.name}! Continue your learning journey.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    icon={FiBook}
                    label="Enrolled Courses"
                    value={stats.enrolledCourses}
                    change="+2"
                    trend="up"
                    color="primary"
                />
                <StatsCard
                    icon={FiAward}
                    label="Completed"
                    value={stats.completedCourses}
                    change="+1"
                    trend="up"
                    color="success"
                />
                <StatsCard
                    icon={FiClock}
                    label="Learning Hours"
                    value={stats.totalHours}
                    change="+5.5"
                    trend="up"
                    color="info"
                />
                <StatsCard
                    icon={FiTrendingUp}
                    label="Certificates"
                    value={stats.certificates}
                    change="+1"
                    trend="up"
                    color="warning"
                />
            </div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Continue Learning */}
                <div className="lg:col-span-2">
                    <div className="glass-card p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Continue Learning</h2>
                            <Link href="/student/learning" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                                View All
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {enrolledCourses.map((course) => (
                                <div key={course.id} className="glass rounded-lg p-4 hover-lift">
                                    <div className="flex items-start space-x-4">
                                        {/* Thumbnail */}
                                        <div className="w-32 h-20 bg-linear-to-br from-primary-500 to-secondary-500 rounded-lg shrink-0 flex items-center justify-center">
                                            <FiBook className="w-8 h-8 text-white/50" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold mb-1 line-clamp-1">{course.title}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">by {course.instructor}</p>

                                            {/* Progress Bar */}
                                            <div className="mb-2">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-gray-500">Progress</span>
                                                    <span className="text-xs font-semibold">{course.progress}%</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-linear-to-r from-primary-500 to-secondary-500 transition-all duration-500"
                                                        style={{ width: `${course.progress}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">Last accessed {course.lastAccessed}</span>
                                                <Link
                                                    href={`/courses/${course.id}/learn`}
                                                    className="flex items-center space-x-1 px-4 py-2 bg-linear-to-r from-primary-500 to-secondary-500 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                                                >
                                                    <FiPlay className="w-4 h-4" />
                                                    <span>Continue</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recommended Courses */}
                    <div className="glass-card p-6">
                        <h2 className="text-xl font-bold mb-4">Recommended For You</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Based on your learning history
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="glass rounded-lg p-4">
                                    <div className="aspect-video bg-linear-to-br from-secondary-500 to-primary-500 rounded-lg mb-3"></div>
                                    <h3 className="font-semibold mb-1">Advanced React Patterns</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">by Expert Teacher</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-1">
                                            <AiFillStar className="w-4 h-4 text-yellow-500" />
                                            <span className="text-sm font-semibold">4.8</span>
                                        </div>
                                        <span className="text-sm font-bold text-primary-500">$49.99</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Recent Activity */}
                    <div className="glass-card p-6">
                        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-linear-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shrink-0">
                                        <FiTrendingUp className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm">
                                            <span className="font-semibold">{activity.action}</span> {activity.item}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Learning Streak */}
                    <div className="glass-card p-6">
                        <h2 className="text-xl font-bold mb-4">Learning Streak 🔥</h2>
                        <div className="text-center">
                            <div className="text-4xl font-bold gradient-text mb-2">7 Days</div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Keep it up! You are on fire!
                            </p>
                            <div className="flex justify-center space-x-2">
                                {[...Array(7)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-8 h-8 rounded-full bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold"
                                    >
                                        {i + 1}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}