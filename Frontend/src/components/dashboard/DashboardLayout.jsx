'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import {
    FiHome, FiBook, FiUsers, FiSettings, FiMenu, FiX, FiLogOut,
    FiBarChart, FiDollarSign, FiMessageSquare, FiFolder, FiPlus,
    FiPlay, FiAward, FiBookOpen, FiTrendingUp
} from 'react-icons/fi';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function DashboardLayout({ children, role = 'student' }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    // Navigation items based on role
    const getNavItems = () => {
        if (role === 'admin') {
            return [
                { icon: FiHome, label: 'Dashboard', href: '/admin', exact: true },
                { icon: FiUsers, label: 'Users', href: '/admin/users' },
                { icon: FiBook, label: 'Courses', href: '/admin/courses' },
                { icon: FiFolder, label: 'Categories', href: '/admin/categories' },
                { icon: FiPlus, label: 'Requests', href: '/admin/requests' },
                { icon: FiMessageSquare, label: 'Testimonials', href: '/admin/testimonials' },
                { icon: FiTrendingUp, label: 'Analytics', href: '/admin/analytics' },
                { icon: FiDollarSign, label: 'Revenue', href: '/admin/revenue' },
                { icon: FiSettings, label: 'Profile', href: '/profile' },
            ];
        } else if (role === 'instructor') {
            return [
                { icon: FiHome, label: 'Dashboard', href: '/instructor', exact: true },
                { icon: FiBook, label: 'My Courses', href: '/instructor/courses', exact: true },
                { icon: FiPlus, label: 'Create Course', href: '/instructor/courses/create' },
                { icon: FiUsers, label: 'Students', href: '/instructor/students' },
                { icon: FiTrendingUp, label: 'Analytics', href: '/instructor/analytics' },
                // { icon: FiDollarSign, label: 'Revenue', href: '/instructor/revenue' },//later (with payout)
                { icon: FiMessageSquare, label: 'Reviews', href: '/instructor/reviews' },
                { icon: FiSettings, label: 'Profile', href: '/profile' },
            ];
        } else {
            return [
                { icon: FiHome, label: 'Dashboard', href: '/student', exact: true },
                { icon: FiPlay, label: 'My Learning', href: '/student/learning' },
                { icon: FiBookOpen, label: 'Courses', href: '/courses' },
                { icon: FiAward, label: 'Certificates', href: '/student/certificates' },
                { icon: FiTrendingUp, label: 'Progress', href: '/student/progress' },
                { icon: FiSettings, label: 'Profile', href: '/profile' },
            ];
        }
    };

    const navItems = getNavItems();

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 custom-scrollbar ">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-10 glass border-b border-white/10">
                <div className="flex items-center justify-between p-4">
                    <Link href="/" className="flex items-center space-x-2">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={70}
                            height={70}
                            priority={true}
                        />
                        <span className="text-xl font-bold gradient-text">Skill-Up</span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        {sidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-0 left-0 z-40 h-screen w-64 glass border-r border-white/10 transition-transform duration-300',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Logo */}
                <div className="hidden lg:flex items-center space-x-2 px-6 py-4 border-b border-white/10">
                    <Link href="/" className="flex items-center space-x-2">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={70}
                            height={70}
                            priority={true}
                        />
                        <span className="text-xl font-bold gradient-text">Skill-Up</span>
                    </Link>
                </div>

                {/* User Info */}
                <div className="px-4 py-2 border-b border-white/10">
                    {user?.avatar?.url ? (
                        <div className="flex items-center space-x-3">
                            <div className='rounded-full relative w-10 h-10 overflow-hidden'>
                                <Image
                                    src={user.avatar.url}
                                    alt={user.name}
                                    width={100}
                                    height={100}
                                    loading='eager'
                                    className=" object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{user?.name || 'User'}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{role}</p>
                            </div>
                        </div>
                    ) :
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-linear-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{user?.name || 'User'}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{role}</p>
                            </div>
                        </div>
                    }
                </div>


                {/* Navigation */}
                <nav className="p-4 space-y-1 mb-8 overflow-y-auto " style={{ maxHeight: 'calc(100vh - 220px)' }}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.exact
                            ? pathname === item.href
                            : (pathname === item.href || pathname.startsWith(item.href + '/'));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                                    isActive
                                        ? 'bg-linear-to-r from-primary-500 to-secondary-500 text-white'
                                        : 'hover:bg-white/10'
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all duration-200 w-full"
                    >
                        <FiLogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="lg:pl-64 pt-20 lg:pt-0 min-h-screen">
                <div className="p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}