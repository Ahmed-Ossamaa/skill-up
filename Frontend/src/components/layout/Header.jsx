'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiSearch, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import useAuthStore from '@/store/authStore';
import { cn } from '@/lib/utils';
import Image from 'next/image';


export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const pathname = usePathname();
    const router = useRouter();

    const { isAuthenticated, user, logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    // Dashboard path per role
    const dashboardHref = user?.role === 'admin' ? '/admin' : user?.role === 'instructor' ? '/instructor' : user?.role === 'student' ? '/student' : '/dashboard';

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/courses?search=${encodeURIComponent(searchQuery)}`;
        }
    };

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/courses', label: 'Courses' },
        { href: '/about', label: 'About' },
        { href: '/contact', label: 'Contact' },
    ];

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                isScrolled
                    ? 'glass shadow-lg py-3'
                    : 'bg-transparent py-5'
            )}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="bg-linear-to-br from-primary-500 to-secondary-500 p-2 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <HiOutlineAcademicCap className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold gradient-text hidden sm:block">
                            LearnHub
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'text-sm font-medium transition-colors duration-200 hover:text-primary-500',
                                    pathname === link.href
                                        ? 'text-primary-500'
                                        : 'text-gray-700 dark:text-gray-300'
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="border border-gray-300 rounded-full md:flex items-center flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search for courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full glass rounded-full pl-12 pr-4 py-2.5 text-sm focus-ring placeholder-gray-500"
                            />
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        </div>
                    </form>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-4">

                        {/* User Menu */}
                        {isAuthenticated ? (
                            <div className="relative group">
                                <button className="flex items-center gap-2 cursor-pointer outline-none bg-white/20 dark:bg-black/50 backdrop-blur-md py-1.5 pl-1.5 pr-4 rounded-full border border-white/20 shadow-sm transition-all hover:bg-white/30">
                                    {/* Avatar */}
                                    <div className="relative w-8 h-8 bg-linear-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden shadow-sm border border-white/10">
                                        {user?.avatar?.url ? (
                                            <Image
                                                src={user.avatar.url}
                                                width={100}
                                                height={100}
                                                className="w-full h-full object-cover"
                                                alt={user?.name || "User"}
                                            />
                                        ) : (
                                            <span>
                                                {(user?.name?.charAt(0) || 'U').toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    {/* User Name */}
                                    <div className="hidden sm:block text-left">
                                        <span className="font-semibold text-sm text-gray-800 dark:text-gray-200 block leading-tight">
                                            {user?.name}
                                        </span>
                                    </div>
                                </button>

                                {/* Dropdown */}
                                <div className="absolute right-0 mt-2 w-48 glass-card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-right">
                                    <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700">
                                        <Link href={dashboardHref} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 rounded-lg transition-colors">
                                            Dashboard
                                        </Link>
                                        <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 rounded-lg transition-colors">
                                            Profile
                                        </Link>
                                        <hr className="my-2 border-gray-100 dark:border-gray-700" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors font-medium"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden lg:flex items-center space-x-3">
                                <Link
                                    href="/auth/login"
                                    className="px-5 py-2 text-sm font-medium hover:text-primary-500 transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    className="px-5 py-2 text-sm font-medium bg-linear-to-r from-primary-500 to-secondary-500 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            {isMobileMenuOpen ? (
                                <FiX className="w-6 h-6" />
                            ) : (
                                <FiMenu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden mt-4 glass-card animate-slide-down">
                        <div className="p-4 space-y-3">
                            {/* Mobile Search */}
                            <form onSubmit={handleSearch} className="md:hidden">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search courses..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full glass rounded-full pl-12 pr-4 py-2.5 text-sm focus-ring"
                                    />
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                </div>
                            </form>

                            {/* Mobile Nav Links */}
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        'block px-4 py-2 rounded-lg transition-colors',
                                        pathname === link.href
                                            ? 'bg-primary-500/20 text-primary-500'
                                            : 'hover:bg-white/10'
                                    )}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {/* Mobile Auth Buttons */}
                            {isAuthenticated ? (
                                <div className="pt-3 space-y-2 border-t border-white/10">
                                    <Link
                                        href={dashboardHref}
                                        className="block px-4 py-2 rounded-lg"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/my-learning"
                                        className="block px-4 py-2 rounded-lg"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        My Learning
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className="block px-4 py-2 rounded-lg"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="pt-3 space-y-2 border-t border-white/10">
                                    <Link
                                        href="/auth/login"
                                        className="block text-center px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href="/auth/signup"
                                        className="block text-center px-4 py-2 bg-linear-to-r from-primary-500 to-secondary-500 text-white rounded-lg"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}