'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FiSearch, FiEdit, FiTrash2, FiLock, FiUnlock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { HiOutlineUsers } from 'react-icons/hi';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { userAPI } from '@/lib/api';
import { cn, formatDate, debounce, formatPrice } from '@/lib/utils';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import UserModal from '@/components/admin/UserModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import useConfirmModal from '@/hooks/useConfirmModal';

export default function AdminUsersPage() {
    const router = useRouter();
    const { user, isAuthenticated, isReady } = useAuthStore();
    const { isOpen, config, openConfirm, closeConfirm, handleConfirm } = useConfirmModal();

    // Data State
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    // Filters State
    const [inputValue, setInputValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    // User Modal
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);

    // Fetching
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const params = { page: pagination.page, limit: 20, sort: 'desc' };

            if (activeTab !== 'all') params.role = activeTab;
            if (searchQuery) params.search = searchQuery;

            const response = await userAPI.getAll(params);
            const { data, page, pages, total } = response.data.data;

            setUsers(data || []);
            setPagination(prev => ({ ...prev, page, pages, total }));
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [activeTab, pagination.page, searchQuery]);

    useEffect(() => {
        if (!isReady) return;
        if (!isAuthenticated) return router.push('/auth/login');
        if (user?.role !== 'admin') return router.push('/');

        fetchUsers();
    }, [isReady, isAuthenticated, user, fetchUsers, router]);

    // Search debounce
    const debouncedSearch = useMemo(
        () =>
            debounce((value) => {
                setSearchQuery(value);
                setPagination(p => ({ ...p, page: 1 }));
            }, 500),
        []
    );

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        debouncedSearch(value);
    };

    const handleUpdateUser = async (userId, data) => {
        try {
            await userAPI.updateUser(userId, data);
            toast.success('User updated successfully');
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
            throw error;
        }
    };

    //Handlers
    const handleBlockToggle = (userData) => {
        const isActive = userData.status === 'active';

        openConfirm({
            title: isActive ? 'Ban User?' : 'Unban User?',
            message: `Are you sure you want to ${isActive ? 'ban' : 'activate'} ${userData.name}?`,
            confirmText: isActive ? 'Ban' : 'Activate',
            type: 'danger',
            onConfirm: async () => {
                await userAPI.updateUser(userData._id, { status: isActive ? 'banned' : 'active' });
                toast.success(isActive ? 'User banned' : 'User activated');
                fetchUsers();
            }
        });
    };

    const handleDeleteUser = (userData) => {
        openConfirm({
            title: 'Delete User?',
            message: `Are you sure you want to delete ${userData.name}? This cannot be undone.`,
            confirmText: 'Delete',
            type: 'danger',
            onConfirm: async () => {
                try {
                    setLoading(true);
                    await userAPI.delete(userData._id);
                    toast.success('User deleted');
                    await fetchUsers();
                } catch (error) {
                    toast.error('Error deleting user');
                    console.error('Error deleting user:', error);
                }finally{
                    setLoading(false);
                }

            }
        });
    };

    const tabs = [
        { id: 'all', label: 'All Users' },
        { id: 'student', label: 'Students' },
        { id: 'instructor', label: 'Instructors' },
        { id: 'admin', label: 'Admins' },
    ];

    return (
        <DashboardLayout role="admin">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">User Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage all users, roles, and permissions.</p>
            </div>

            <div className="glass-card p-6 min-h-[500px]">

                {/* Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    {/* Tabs */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setPagination(p => ({ ...p, page: 1 })); }}
                                className={cn(
                                    'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                                    activeTab === tab.id
                                        ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600'
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-64">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={inputValue}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 focus:outline-gray-200 text-sm"
                        />
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
                    </div>
                ) : users.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-sm text-gray-500">
                                        <th className="py-4 px-4 font-semibold">User</th>
                                        <th className="py-4 px-4 font-semibold">Role</th>
                                        <th className="py-4 px-4 font-semibold">Status</th>
                                        <th className="py-4 px-4 font-semibold text-center">Courses</th>
                                        <th className="py-4 px-4 font-semibold text-right">Spent</th>
                                        <th className="py-4 px-4 font-semibold">Joined</th>
                                        <th className="py-4 px-4 text-center font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u._id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    {u?.avatar?.url ? (
                                                        <Image
                                                            src={u.avatar.url}
                                                            alt={u.name}
                                                            width={40}
                                                            height={40}
                                                            className="w-10 h-10 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                                                            {u.name?.charAt(0)}
                                                        </div>
                                                    )}

                                                    <div>
                                                        <p className="font-semibold text-sm">{u.name}</p>
                                                        <p className="text-xs text-gray-500">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-4 px-4">
                                                <span className={cn(
                                                    'px-2 py-1 rounded-full text-xs font-semibold capitalize',
                                                    u.role === 'admin' && 'bg-red-100 text-red-600',
                                                    u.role === 'instructor' && 'bg-blue-100 text-blue-600',
                                                    u.role === 'student' && 'bg-green-100 text-green-600'
                                                )}>
                                                    {u.role}
                                                </span>
                                            </td>

                                            <td className="py-4 px-4">
                                                <span className={cn(
                                                    'px-2 py-1 rounded-full text-xs font-semibold capitalize',
                                                    u.status === 'active'
                                                        ? 'bg-green-100 text-green-600'
                                                        : 'bg-red-100 text-red-600'
                                                )}>
                                                    {u.status}
                                                </span>
                                            </td>

                                            <td className="py-4 px-4 text-center">
                                                {u.role === 'student'
                                                    ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            {u.studentStats?.totalEnrolledCourses || 0}
                                                        </span>
                                                    )
                                                    : <span className="text-gray-300">-</span>}
                                            </td>

                                            <td className="py-4 px-4 text-right">
                                                {u.role === 'student'
                                                    ? <span className="text-sm font-medium text-green-600">{formatPrice(u.studentStats?.totalAmountPaid || 0)}</span>
                                                    : <span className="text-gray-300">-</span>}
                                            </td>

                                            <td className="py-4 px-4 text-sm text-gray-500">
                                                {formatDate(u.createdAt)}
                                            </td>

                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => { setSelectedUser(u); setShowUserModal(true); }}
                                                        className="p-2 hover:bg-primary-50 rounded-lg text-primary-500 transition-colors cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <FiEdit />
                                                    </button>

                                                    <button
                                                        onClick={() => handleBlockToggle(u)}
                                                        className={cn(
                                                            "p-2 rounded-lg transition-colors cursor-pointer",
                                                            u.status === 'active'
                                                                ? "hover:bg-yellow-50 text-yellow-500"
                                                                : "hover:bg-green-50 text-green-500"
                                                        )}
                                                    >
                                                        {u.status === 'active' ? <FiLock /> : <FiUnlock />}
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteUser(u)}
                                                        className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors cursor-pointer"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-sm text-gray-500">Showing {users.length} of {pagination.total} users</p>

                            <div className="flex gap-2">
                                <button
                                    disabled={pagination.page <= 1}
                                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                                    className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <FiChevronLeft />
                                </button>

                                <span className="px-4 py-2 text-sm font-medium bg-gray-50 rounded-lg">
                                    Page {pagination.page} of {pagination.pages}
                                </span>

                                <button
                                    disabled={pagination.page >= pagination.pages}
                                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                                    className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <FiChevronRight />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20">
                        <HiOutlineUsers className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">No users found</h3>
                        <p className="text-gray-500">Try adjusting your filters.</p>
                    </div>
                )}
            </div>

            {/* User Modal */}
            {showUserModal && selectedUser && (
                <UserModal
                    user={selectedUser}
                    onClose={() => { setShowUserModal(false); setSelectedUser(null); }}
                    onUpdate={handleUpdateUser}
                />
            )}

            <ConfirmModal
                isOpen={isOpen}
                onClose={closeConfirm}
                {...config}
                onConfirm={handleConfirm}
            />
        </DashboardLayout>
    );
}
