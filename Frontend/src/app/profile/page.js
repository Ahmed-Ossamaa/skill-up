'use client';

import { useState, useEffect } from 'react';
import { userAPI, authAPI } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import AvatarUploader from '@/components/users/AvatarUploader';
import { toast } from 'react-hot-toast';
import {
    AiOutlineSave, AiOutlineGlobal, AiFillLinkedin, AiFillGithub,
    AiOutlineTwitter, AiOutlineLoading3Quarters, AiOutlineLock,
    AiOutlineUser, AiOutlineSafety
} from 'react-icons/ai';
import Header from '@/components/layout/Header';

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'One uppercase required')
        .regex(/[a-z]/, 'One lowercase required')
        .regex(/[0-9]/, 'One number required'),
    confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
});

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    // const [passwordLoading, setPasswordLoading] = useState(false);
    const [userRole, setUserRole] = useState('student');
    const [activeTab, setActiveTab] = useState('profile');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting: passwordLoading }
    } = useForm({
        resolver: zodResolver(passwordSchema),
        mode: "onBlur"
    });

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        headline: '',
        bio: '',
        website: '',
        linkedin: '',
        github: '',
        twitter: '',
        avatar: null
    });


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await userAPI.getMyProfile();
                const userData = data?.data;

                setUserRole(userData.role || 'student');

                setFormData({
                    name: userData.name || '',
                    headline: userData.headline || '',
                    bio: userData.bio || '',
                    website: userData.website || '',
                    linkedin: userData.linkedin || '',
                    github: userData.github || '',
                    twitter: userData.twitter || '',
                    avatar: userData.avatar
                });
            } catch (error) {
                console.error('Failed to load settings');
                toast.error("Could not load profile data");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { avatar, ...textData } = formData;
            await userAPI.updateMyProfile(textData);
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const onPasswordSubmit = async (data) => {
        try {
            await authAPI.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
                confirmNewPassword: data.confirmNewPassword
            });
            toast.success('Password changed successfully!');
            reset();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        }
    };

    if (loading) return <div className="p-10 text-center pt-32">Loading ...</div>;

    const isInstructor = userRole === 'instructor';

    return (
        <>
            <Header />
            <div className="mx-auto py-6 px-6 lg:px-10 pt-25 min-h-screen bg-linear-to-bl from-slate-800 to-gray-200 dark:from-gray-900 dark:to-gray-800">

                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Account Settings</h1>
                    <p className="text-gray-300 dark:text-gray-300 mb-8 font-medium">
                        Manage your {isInstructor ? 'instructor profile' : 'personal account'} and preferences.
                    </p>

                    <div className="grid lg:grid-cols-12 gap-8">

                        {/* --- Left Column: Avatar --- */}
                        <div className="lg:col-span-4 space-y-6 ">
                            <div className="glass-card p-6 text-center sticky top-24 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <h3 className="font-semibold text-lg mb-6 dark:text-white">Profile Picture</h3>

                                <AvatarUploader
                                    currentAvatar={formData.avatar}
                                    onUpdate={(newAvatar) => setFormData(prev => ({ ...prev, avatar: newAvatar }))}
                                />

                                <div className="mt-6 text-sm text-gray-500">
                                    <p>Recommended: 500x500px</p>
                                    <p>JPG or PNG up to 2MB</p>
                                </div>
                            </div>
                        </div>

                        {/* --- Right Column: Tabs & Forms --- */}
                        <div className="lg:col-span-8 space-y-6">

                            {/* --- TABS HEADER --- */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-700 inline-flex w-full md:w-auto">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all w-full md:w-auto cursor-pointer ${activeTab === 'profile'
                                        ? 'bg-slate-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <AiOutlineUser className="text-lg" /> Profile Info
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all w-full md:w-auto cursor-pointer ${activeTab === 'security'
                                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <AiOutlineSafety className="text-lg" /> Security
                                </button>
                            </div>

                            {/* --- TAB CONTENT: PROFILE --- */}
                            {activeTab === 'profile' && (
                                <form onSubmit={handleProfileSubmit} className="space-y-6 animate-in fade-in duration-300">

                                    {/* Basic Info Card */}
                                    <div className="glass-card p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 ">
                                        <h3 className="font-semibold text-xl mb-6 border-b border-gray-100 dark:border-gray-700 pb-4 dark:text-white">
                                            Basic Information
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Display Name</label>
                                                <input
                                                    type="text" name="name" value={formData.name} onChange={handleChange}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-slate-400 outline-none dark:text-white"
                                                />
                                            </div>

                                            {isInstructor && (
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Headline</label>
                                                    <input
                                                        type="text" name="headline" value={formData.headline} onChange={handleChange}
                                                        placeholder="e.g. Senior Fullstack Developer" maxLength={50}
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-slate-400 outline-none dark:text-white"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1 text-right">{formData.headline.length}/50</p>
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                                    {isInstructor ? "Professional Biography" : "About Me"}
                                                </label>
                                                <textarea
                                                    name="bio" value={formData.bio} onChange={handleChange} rows={5}
                                                    placeholder={isInstructor ? "Tell students about your professional background..." : "Tell us a bit about yourself..."}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-slate-400 outline-none resize-none dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Social Links Card */}
                                    <div className="glass-card p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                        <h3 className="font-semibold text-xl mb-6 border-b border-gray-100 dark:border-gray-700 pb-4 dark:text-white">
                                            Social Profiles
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="relative">
                                                <div className="absolute left-3 top-3 text-gray-400"><AiOutlineGlobal /></div>
                                                <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="Website URL" className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-slate-400 outline-none dark:text-white" />
                                            </div>
                                            <div className="relative">
                                                <div className="absolute left-3 top-3 text-blue-600"><AiFillLinkedin /></div>
                                                <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="LinkedIn URL" className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-slate-400 outline-none dark:text-white" />
                                            </div>
                                            <div className="relative">
                                                <div className="absolute left-3 top-3 text-gray-800 dark:text-gray-200"><AiFillGithub /></div>
                                                <input type="url" name="github" value={formData.github} onChange={handleChange} placeholder="GitHub URL" className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-slate-400 outline-none dark:text-white" />
                                            </div>
                                            <div className="relative">
                                                <div className="absolute left-3 top-3 text-blue-400"><AiOutlineTwitter /></div>
                                                <input type="url" name="twitter" value={formData.twitter} onChange={handleChange} placeholder="Twitter URL" className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-slate-400 outline-none dark:text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-primary-500/30 flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {saving ? (
                                                <><AiOutlineLoading3Quarters className="animate-spin" /> Saving...</>
                                            ) : (
                                                <><AiOutlineSave className="text-lg" /> Save Profile Info</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* --- Security  --- */}
                            {activeTab === 'security' && (
                                <div className="glass-card p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in duration-300">
                                    <h3 className="font-semibold text-xl mb-6 border-b border-gray-100 dark:border-gray-700 pb-4 flex items-center gap-2 dark:text-white">
                                        <AiOutlineLock className="text-primary-500" /> Change Password
                                    </h3>

                                    <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {/* Current Password */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Current Password</label>
                                                <div className="relative">
                                                    <div className="absolute left-3 top-3 text-gray-400"><AiOutlineLock /></div>
                                                    <input
                                                        type="password"
                                                        {...register("currentPassword")}
                                                        placeholder="Enter your current password"
                                                        className={`w-full pl-10 pr-4 py-2 rounded-lg border bg-transparent focus:ring-2 outline-none dark:text-white ${errors.currentPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-primary-500'}`}
                                                    />
                                                </div>
                                                {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>}
                                            </div>

                                            {/* New Password */}
                                            <div>
                                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">New Password</label>
                                                <div className="relative">
                                                    <div className="absolute left-3 top-3 text-gray-400"><AiOutlineLock /></div>
                                                    <input
                                                        type="password"
                                                        {...register("newPassword")}
                                                        placeholder="New password"
                                                        className={`w-full pl-10 pr-4 py-2 rounded-lg border bg-transparent focus:ring-2 outline-none dark:text-white ${errors.newPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-primary-500'}`}
                                                    />
                                                </div>
                                                {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
                                            </div>

                                            {/* Confirm Password */}
                                            <div>
                                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Confirm Password</label>
                                                <div className="relative">
                                                    <div className="absolute left-3 top-3 text-gray-400"><AiOutlineLock /></div>
                                                    <input
                                                        type="password"
                                                        {...register("confirmNewPassword")}
                                                        placeholder="Confirm new password"
                                                        className={`w-full pl-10 pr-4 py-2 rounded-lg border bg-transparent focus:ring-2 outline-none dark:text-white ${errors.confirmNewPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-gray-700 focus:ring-primary-500'}`}
                                                    />
                                                </div>
                                                {errors.confirmNewPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmNewPassword.message}</p>}
                                            </div>
                                        </div>

                                        <div className="flex justify-end mt-4">
                                            <button
                                                type="submit"
                                                disabled={passwordLoading}
                                                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-primary-500/30 flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {passwordLoading ? (
                                                    <><AiOutlineLoading3Quarters className="animate-spin" /> Updating...</>
                                                ) : (
                                                    "Update Password"
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}