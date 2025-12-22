'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import useAuthStore from '@/store/authStore';
import { FiUser, FiMail, FiLock, FiUpload, FiSave } from 'react-icons/fi';
import Image from 'next/image';
import {userAPI} from '@/lib/api';


export default function ProfileSettingsPage() {
    const router = useRouter();
    const { user, isAuthenticated, isReady, updateUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        avatar: null,
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (!isReady) return;

        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                avatar: user.avatar || null,
            });
        }
    }, [isReady, isAuthenticated, user, router]);

    // Spinner
    if (!isReady) {
        return (
            <DashboardLayout role={user?.role || 'student'}>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
            </DashboardLayout>
        );
    }
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            
            const response = await userAPI.update(user._id, profileData);

            // Mock success
            await new Promise(resolve => setTimeout(resolve, 1000));

            updateUser(profileData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await userAPI.patch('/auth/change-password', {
              currentPassword: passwordData.currentPassword,
              newPassword: passwordData.newPassword,
            });

            // Mock success
            await new Promise(resolve => setTimeout(resolve, 1000));

            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Error changing password:', error);
            setMessage({ type: 'error', text: 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'File size must be less than 5MB' });
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'File must be an image' });
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('avatar', file);
            const response = await userAPI.uploadAvatar(formData);

            // Mock success - create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileData({ ...profileData, avatar: reader.result });
                setMessage({ type: 'success', text: 'Avatar uploaded successfully!' });
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading avatar:', error);
            setMessage({ type: 'error', text: 'Failed to upload avatar' });
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile Information' },
        { id: 'password', label: 'Change Password' },
        { id: 'notifications', label: 'Notifications' },
    ];

    return (
        <DashboardLayout role={user?.role || 'student'}>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences.</p>
            </div>

            {/* Message Alert */}
            {message.text && (
                <div className={`mb-6 p-4 rounded-lg animate-slide-down ${message.type === 'success'
                        ? 'bg-green-500/20 border border-green-500/20 text-green-500'
                        : 'bg-red-500/20 border border-red-500/20 text-red-500'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar Tabs */}
                <div className="lg:col-span-1">
                    <div className="glass-card p-4 space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === tab.id
                                        ? 'bg-linear-to-r from-primary-500 to-secondary-500 text-white'
                                        : 'hover:bg-white/10'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    {activeTab === 'profile' && (
                        <div className="glass-card p-8">
                            <h2 className="text-2xl font-bold mb-6">Profile Information</h2>

                            {/* Avatar Upload */}
                            <div className="mb-8 flex items-center space-x-6">
                                <div className="relative">
                                    {profileData?.avatar?.url ? (
                                        <Image
                                            src={profileData.avatar.url}
                                            alt="Avatar"
                                            width={96}
                                            height={96}
                                            className="w-24 h-24 rounded-full object-cover ring-4 ring-primary-500/20"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-linear-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-3xl font-bold ring-4 ring-primary-500/20">
                                            {profileData.name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Profile Picture</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        JPG, PNG Max size 5MB
                                    </p>
                                    <label className="items-center space-x-2 px-4 py-2 glass-button cursor-pointer inline-flex">
                                        <FiUpload className="w-4 h-4" />
                                        <span>Upload Photo</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Profile Form */}
                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiUser className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 glass rounded-lg focus-ring"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiMail className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 glass rounded-lg focus-ring"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiSave className="w-5 h-5" />
                                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'password' && (
                        <div className="glass-card p-8">
                            <h2 className="text-2xl font-bold mb-6">Change Password</h2>

                            <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Current Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiLock className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <input
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 glass rounded-lg focus-ring"
                                            placeholder="Enter current password"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">New Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiLock className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 glass rounded-lg focus-ring"
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Password must be at least 8 characters with uppercase, lowercase, and number
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiLock className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 glass rounded-lg focus-ring"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiLock className="w-5 h-5" />
                                    <span>{loading ? 'Updating...' : 'Update Password'}</span>
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="glass-card p-8">
                            <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 glass rounded-lg">
                                    <div>
                                        <h3 className="font-semibold mb-1">Email Notifications</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Receive email about your account activity
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 glass rounded-lg">
                                    <div>
                                        <h3 className="font-semibold mb-1">Course Updates</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Get notified when a course you are enrolled in is updated
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 glass rounded-lg">
                                    <div>
                                        <h3 className="font-semibold mb-1">Marketing Emails</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Receive emails about new courses and promotions
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}