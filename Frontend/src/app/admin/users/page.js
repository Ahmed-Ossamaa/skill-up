'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import useAuthStore from '@/store/authStore';
import { FiSearch, FiFilter, FiEdit, FiTrash2, FiLock, FiUnlock, FiMoreVertical, FiEye } from 'react-icons/fi';
import { HiOutlineUsers } from 'react-icons/hi';
import { cn, formatDate } from '@/lib/utils';
import api from '@/lib/api';

export default function AdminUsersPage() {
    const router = useRouter();
    const { user, isAuthenticated, isReady } = useAuthStore();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        students: 0,
        instructors: 0,
        admins: 0,
    });

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            // TODO: Replace with actual API call
            // const response = await api.get('/users', { 
            //   params: { role: activeTab !== 'all' ? activeTab : undefined, search: searchQuery }
            // });

            // Mock data
            const mockUsers = [
                {
                    _id: '1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    role: 'student',
                    status: 'active',
                    avatar: null,
                    createdAt: '2024-01-15T10:00:00Z',
                    lastLogin: '2025-01-20T14:30:00Z',
                    coursesCount: 5,
                },
                {
                    _id: '2',
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    role: 'instructor',
                    status: 'active',
                    avatar: null,
                    createdAt: '2024-02-10T10:00:00Z',
                    lastLogin: '2025-01-19T09:15:00Z',
                    coursesCount: 12,
                },
                {
                    _id: '3',
                    name: 'Bob Wilson',
                    email: 'bob@example.com',
                    role: 'student',
                    status: 'blocked',
                    avatar: null,
                    createdAt: '2024-03-05T10:00:00Z',
                    lastLogin: '2025-01-10T11:20:00Z',
                    coursesCount: 2,
                },
                {
                    _id: '4',
                    name: 'Alice Brown',
                    email: 'alice@example.com',
                    role: 'instructor',
                    status: 'active',
                    avatar: null,
                    createdAt: '2024-04-20T10:00:00Z',
                    lastLogin: '2025-01-21T16:45:00Z',
                    coursesCount: 8,
                },
                {
                    _id: '5',
                    name: 'Admin User',
                    email: 'admin@example.com',
                    role: 'admin',
                    status: 'active',
                    avatar: null,
                    createdAt: '2023-12-01T10:00:00Z',
                    lastLogin: '2025-01-21T18:00:00Z',
                    coursesCount: 0,
                },
            ];

            // Filter by role
            let filteredUsers = mockUsers;
            if (activeTab !== 'all') {
                filteredUsers = mockUsers.filter(u => u.role === activeTab);
            }

            // Filter by search
            if (searchQuery) {
                filteredUsers = filteredUsers.filter(u =>
                    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    u.email.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            setUsers(filteredUsers);

            // Calculate stats
            setStats({
                total: mockUsers.length,
                students: mockUsers.filter(u => u.role === 'student').length,
                instructors: mockUsers.filter(u => u.role === 'instructor').length,
                admins: mockUsers.filter(u => u.role === 'admin').length,
            });
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, [activeTab, searchQuery]);

    useEffect(() => {
        // wait for auth hydration
        if (!isReady) return;

        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        if (user && user.role !== 'admin') {
            router.push('/');
            return;
        }

        fetchUsers();
    }, [isReady, isAuthenticated, user, fetchUsers, router]);

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    const handleBlockUser = async (userId) => {
        if (!confirm('Are you sure you want to block this user?')) return;

        try {
            // TODO: API call
            // await api.patch(`/users/${userId}/block`);
            alert('User blocked successfully');
            fetchUsers();
        } catch (error) {
            console.error('Error blocking user:', error);
            alert('Failed to block user');
        }
    };

    const handleUnblockUser = async (userId) => {
        try {
            // TODO: API call
            // await api.patch(`/users/${userId}/unblock`);
            alert('User unblocked successfully');
            fetchUsers();
        } catch (error) {
            console.error('Error unblocking user:', error);
            alert('Failed to unblock user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            // TODO: API call
            // await api.delete(`/users/${userId}`);
            alert('User deleted successfully');
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    };

    const tabs = [
        { id: 'all', label: 'All Users', count: stats.total },
        { id: 'student', label: 'Students', count: stats.students },
        { id: 'instructor', label: 'Instructors', count: stats.instructors },
        { id: 'admin', label: 'Admins', count: stats.admins },
    ];

    return (
        <DashboardLayout role="admin">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">User Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage all users, roles, and permissions.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {tabs.map((tab) => (
                    <div key={tab.id} className="glass-card p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{tab.label}</p>
                                <p className="text-2xl font-bold mt-1">{tab.count}</p>
                            </div>
                            <HiOutlineUsers className="w-8 h-8 text-primary-500 opacity-50" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="glass-card p-6">
                {/* Tabs & Search */}
                <div className="mb-6 space-y-4">
                    {/* Tabs */}
                    <div className="flex space-x-1 glass p-1 overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 whitespace-nowrap',
                                    activeTab === tab.id
                                        ? 'bg-linear-to-r from-primary-500 to-secondary-500 text-white'
                                        : 'hover:bg-white/10'
                                )}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>

                    {/* Search & Filter */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 glass rounded-lg focus-ring"
                            />
                        </div>
                        <button className="flex items-center space-x-2 px-4 py-2.5 glass-button whitespace-nowrap">
                            <FiFilter className="w-5 h-5" />
                            <span>Filters</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                    </div>
                ) : users.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-4 px-4 font-semibold">User</th>
                                    <th className="text-left py-4 px-4 font-semibold">Email</th>
                                    <th className="text-left py-4 px-4 font-semibold">Role</th>
                                    <th className="text-left py-4 px-4 font-semibold">Status</th>
                                    <th className="text-left py-4 px-4 font-semibold">Joined</th>
                                    <th className="text-left py-4 px-4 font-semibold">Last Login</th>
                                    <th className="text-center py-4 px-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        {/* User */}
                                        <td className="py-4 px-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-linear-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{user.name}</p>
                                                    {user.role === 'instructor' && (
                                                        <p className="text-xs text-gray-500">{user.coursesCount} courses</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                                            {user.email}
                                        </td>

                                        {/* Role */}
                                        <td className="py-4 px-4">
                                            <span className={cn(
                                                'px-3 py-1 rounded-full text-xs font-semibold capitalize',
                                                user.role === 'admin' && 'bg-red-500/20 text-red-500',
                                                user.role === 'instructor' && 'bg-blue-500/20 text-blue-500',
                                                user.role === 'student' && 'bg-green-500/20 text-green-500'
                                            )}>
                                                {user.role}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="py-4 px-4">
                                            <span className={cn(
                                                'px-3 py-1 rounded-full text-xs font-semibold capitalize',
                                                user.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                                            )}>
                                                {user.status}
                                            </span>
                                        </td>

                                        {/* Joined */}
                                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                                            {formatDate(user.createdAt)}
                                        </td>

                                        {/* Last Login */}
                                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                                            {formatDate(user.lastLogin)}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 px-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => handleViewUser(user)}
                                                    className="p-2 hover:bg-primary-500/10 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <FiEye className="w-4 h-4 text-primary-500" />
                                                </button>
                                                {user.status === 'active' ? (
                                                    <button
                                                        onClick={() => handleBlockUser(user._id)}
                                                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Block User"
                                                    >
                                                        <FiLock className="w-4 h-4 text-red-500" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleUnblockUser(user._id)}
                                                        className="p-2 hover:bg-green-500/10 rounded-lg transition-colors"
                                                        title="Unblock User"
                                                    >
                                                        <FiUnlock className="w-4 h-4 text-green-500" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <FiTrash2 className="w-4 h-4 text-red-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <HiOutlineUsers className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400">No users found</p>
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            {showUserModal && selectedUser && (
                <UserDetailsModal
                    user={selectedUser}
                    onClose={() => {
                        setShowUserModal(false);
                        setSelectedUser(null);
                    }}
                    onUpdate={fetchUsers}
                />
            )}
        </DashboardLayout>
    );
}

// User Details Modal Component
function UserDetailsModal({ user, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        role: user.role,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // TODO: API call
            // await api.patch(`/users/${user._id}`, formData);
            alert('User updated successfully');
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="glass-card p-8 max-w-2xl w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">User Details</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        ✕
                    </button>
                </div>

                {/* User Info */}
                <div className="flex items-center space-x-4 mb-8 p-4 glass rounded-lg">
                    <div className="w-16 h-16 bg-linear-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">{user.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className={cn(
                                'px-2 py-1 rounded-full text-xs font-semibold capitalize',
                                user.role === 'admin' && 'bg-red-500/20 text-red-500',
                                user.role === 'instructor' && 'bg-blue-500/20 text-blue-500',
                                user.role === 'student' && 'bg-green-500/20 text-green-500'
                            )}>
                                {user.role}
                            </span>
                            <span className={cn(
                                'px-2 py-1 rounded-full text-xs font-semibold capitalize',
                                user.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                            )}>
                                {user.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 glass rounded-lg focus-ring"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2.5 glass rounded-lg focus-ring"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-2.5 glass rounded-lg focus-ring"
                        >
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Joined</p>
                            <p className="font-semibold">{formatDate(user.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Last Login</p>
                            <p className="font-semibold">{formatDate(user.lastLogin)}</p>
                        </div>
                        {user.role === 'instructor' && (
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Courses</p>
                                <p className="font-semibold">{user.coursesCount}</p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-4 pt-6">
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-linear-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                        >
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 glass-button"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}