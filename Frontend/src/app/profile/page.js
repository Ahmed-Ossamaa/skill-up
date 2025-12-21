'use client';

import { useState, useEffect } from 'react';
import { userAPI } from '@/lib/api'; 
import AvatarUploader from '@/components/users/AvatarUploader';
import { toast } from 'react-hot-toast';
import { AiOutlineSave, AiOutlineGlobal, AiFillLinkedin, AiFillGithub, AiOutlineTwitter, AiOutlineLoading3Quarters } from 'react-icons/ai';
import Header from '@/components/layout/Header';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userRole, setUserRole] = useState('student');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        headline: '',
        bio: '',
        website: '',
        linkedin: '',
        github: '',
        twitter: '',
        facebook: '',
        avatar: null
    });

    // Fetch current user data on mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await userAPI.getMyProfile();
                const userData = data.data; // Adjust based on API structure

                // 1. Capture Role
                setUserRole(userData.role || 'student');

                setFormData({
                    name: userData.name || '',
                    headline: userData.headline || '',
                    bio: userData.bio || '',
                    website: userData.website || '',
                    linkedin: userData.linkedin || '',
                    github: userData.github || '',
                    twitter: userData.twitter || '',
                    facebook: userData.facebook || '',
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { avatar, ...textData } = formData;
            await userAPI.updateProfile(textData);
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center pt-32">Loading settings...</div>;

    const isInstructor = userRole === 'instructor';

    return (
        <>
            <Header />
            {/* RESTORED YOUR EXACT STYLING HERE */}
            <div className="mx-auto py-10 px-10 pt-25 min-h-screen bg-linear-to-bl from-slate-100 to-gray-600">
                
                <h1 className="text-3xl font-bold mb-2 text-gray-900">Account Settings</h1>
                <p className="text-gray-800 mb-8 font-medium">
                    Manage your {isInstructor ? 'instructor profile' : 'personal account'} and preferences.
                </p>

                <div className="grid lg:grid-cols-12 gap-8">

                    {/* --- Left Column: Avatar & Preview --- */}
                    <div className="lg:col-span-4">
                        <div className="glass-card p-6 text-center sticky top-24">
                            <h3 className="font-semibold text-lg mb-6">Profile Picture</h3>

                            <AvatarUploader
                                currentAvatar={formData.avatar}
                                onUpdate={(newAvatar) => setFormData(prev => ({ ...prev, avatar: newAvatar }))}
                            />

                            <div className="mt-6 text-sm text-gray-600">
                                <p>Recommended: 500x500px</p>
                                <p>JPG or PNG up to 2MB</p>
                            </div>
                        </div>
                    </div>

                    {/* --- Right Column: Edit Form --- */}
                    <div className="lg:col-span-8">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Section: Basic Info */}
                            <div className="glass-card p-8">
                                <h3 className="font-semibold text-xl mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                                    Basic Information
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Display Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary-500 outline-hidden"
                                        />
                                    </div>

                                    {/* CONDITIONAL: Headline (Only for Instructors) */}
                                    {isInstructor && (
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Headline</label>
                                            <input
                                                type="text"
                                                name="headline"
                                                value={formData.headline}
                                                onChange={handleChange}
                                                placeholder="e.g. Senior Fullstack Developer"
                                                maxLength={50}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary-500 outline-hidden"
                                            />
                                            <p className="text-xs text-gray-500 mt-1 text-right">{formData.headline.length}/50</p>
                                        </div>
                                    )}

                                    <div>
                                        {/* DYNAMIC LABEL */}
                                        <label className="block text-sm font-medium mb-1">
                                            {isInstructor ? "Professional Biography" : "About Me"}
                                        </label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            rows={5}
                                            placeholder={isInstructor ? "Tell students about your professional background..." : "Tell us a bit about yourself..."}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary-500 outline-hidden resize-none"
                                        />
                                        <p className="text-sm mt-1 text-gray-600">
                                            {isInstructor 
                                                ? "Tip: Use clear paragraphs. This will be shown on your public profile."
                                                : "This will be visible on your student profile."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Social Links */}
                            <div className="glass-card p-8">
                                <h3 className="font-semibold text-xl mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                                    Social Profiles
                                </h3>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <div className="absolute left-3 top-3 text-gray-400"><AiOutlineGlobal /></div>
                                        <input
                                            type="url" name="website" value={formData.website} onChange={handleChange}
                                            placeholder="Website URL"
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary-500 outline-hidden"
                                        />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-3 top-3 text-blue-600"><AiFillLinkedin /></div>
                                        <input
                                            type="url" name="linkedin" value={formData.linkedin} onChange={handleChange}
                                            placeholder="LinkedIn URL"
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary-500 outline-hidden"
                                        />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-3 top-3 text-gray-800 dark:text-gray-200"><AiFillGithub /></div>
                                        <input
                                            type="url" name="github" value={formData.github} onChange={handleChange}
                                            placeholder="GitHub URL"
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary-500 outline-hidden"
                                        />
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-3 top-3 text-blue-400"><AiOutlineTwitter /></div>
                                        <input
                                            type="url" name="twitter" value={formData.twitter} onChange={handleChange}
                                            placeholder="Twitter URL"
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary-500 outline-hidden"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-primary-500/30 flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <><AiOutlineLoading3Quarters className="animate-spin" /> Saving...</>
                                    ) : (
                                        <><AiOutlineSave className="text-lg" /> Save Changes</>
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}