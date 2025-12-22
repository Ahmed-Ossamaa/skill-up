'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import useAuthStore from '@/store/authStore';
import { enrollmentAPI } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import { FiBook, FiAward, FiTrendingUp, FiPlay, FiActivity, FiCheck } from 'react-icons/fi';
import Image from 'next/image';

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
            const { data: response } = await enrollmentAPI.getMyEnrollments();
            const enrollments = response.data || [];
            // Stats 
            const completedCount = enrollments.filter(e => e.status === 'completed').length;
            setStats({
                enrolledCourses: enrollments.length,
                completedCourses: completedCount,
                certificates: completedCount,
            });

            // My Enrolled Courses List 
            const processedCourses = enrollments
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .map(enrollment => ({
                    id: enrollment.course._id,
                    title: enrollment.course.title,
                    instructor: enrollment.course.instructor?.name || 'Instructor',
                    progress: enrollment.progress?.percentage || 0,
                    thumbnail: enrollment.course.thumbnail?.url,
                    lastAccessed: timeAgo(enrollment.updatedAt),
                    rawDate: enrollment.updatedAt
                }));

            setEnrolledCourses(processedCourses);

            // Recent Activity based on enrollment( mark as complete >> updates the doc) later i may develop sth else in backend
            const activityLog = processedCourses.slice(0, 3).map((course, index) => {
                let action = "Accessed";
                if (course.progress === 100) action = "Completed";
                else if (course.progress > 0) action = "Continued";
                else action = "Started";

                return {
                    id: index,
                    action: action,
                    item: course.title,
                    time: course.lastAccessed
                };
            });
            setRecentActivity(activityLog);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
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
                <p className="text-gray-800 font-semibold dark:text-gray-400">Welcome back, {user?.name}! Continue your learning journey.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatsCard
                    icon={FiBook}
                    label="Enrolled Courses"
                    value={stats.enrolledCourses}
                    color="primary"
                />
                <StatsCard
                    icon={FiAward}
                    label="Completed"
                    value={stats.completedCourses}
                    color="success"
                />

                <StatsCard
                    icon={FiTrendingUp}
                    label="Certificates"
                    value={stats.certificates}
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

                        {enrolledCourses.length > 0 ? (
                            <div className="space-y-4">
                                {enrolledCourses.slice(0, 3).map((course) => (
                                    <div key={course.id} className="glass rounded-lg p-4 border-2! border-gray-100! hover:shadow-md! ">
                                        <div className="flex items-start space-x-4">
                                            {/* Thumbnail */}
                                            <div className="w-32 h-20 rounded-lg shrink-0 overflow-hidden bg-gray-100 relative">
                                                {course.thumbnail ? (
                                                    <Image
                                                        src={course.thumbnail}
                                                        alt={course.title}
                                                        width={50}
                                                        height={50}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-linear-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                                                        <FiBook className="w-8 h-8 text-white/50" />
                                                    </div>
                                                )}
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

                                                <div className="flex items-center justify-between mt-3">
                                                    <span className="text-xs text-gray-500">Active {course.lastAccessed}</span>
                                                    <Link
                                                        href={`/courses/${course.id}`}
                                                        className={`flex items-center space-x-1 px-4 py-2 ${course.progress === 100 ? 'bg-green-500' : 'bg-primary-500'} text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all`}
                                                    >
                                                        {course.progress === 100 &&
                                                            <>
                                                                <FiCheck className="w-4 h-4" />
                                                                <span>Watch Again</span>
                                                            </>
                                                        }
                                                        {course.progress !== 100 &&
                                                            <>
                                                                <FiPlay className="w-4 h-4" />

                                                                <span>{course.progress > 0 ? 'Continue' : 'Start'}</span>
                                                            </>
                                                        }

                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiBook className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                                <p className="text-gray-500 mb-4">Start learning by enrolling in your first course.</p>
                                <Link href="/courses" className="btn-primary inline-flex">
                                    Browse Courses
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Recent Activity */}
                    <div className="glass-card p-6">
                        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                        {recentActivity.length > 0 ? (
                            <div className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-linear-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shrink-0">
                                            <FiActivity className="w-4 h-4 text-white" />
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
                        ) : (
                            <p className="text-sm text-gray-500">No recent activity.</p>
                        )}
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}