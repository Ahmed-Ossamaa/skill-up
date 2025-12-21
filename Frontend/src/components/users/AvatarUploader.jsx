'use client';

import { useState, useRef } from 'react';
import { userAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { AiOutlineCamera, AiOutlineDelete, AiOutlineLoading3Quarters } from 'react-icons/ai';
import Image from 'next/image';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function AvatarUploader({ currentAvatar, onUpdate }) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false); // State for modal

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validations
        if (!file.type.startsWith('image/')) return toast.error('Please upload an image file');
        if (file.size > 2 * 1024 * 1024) return toast.error('Image must be less than 2MB');

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            setUploading(true);
            const res = await userAPI.uploadAvatar(formData);

            onUpdate(res.data.data);
            toast.success('Avatar updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setUploading(true);
            await userAPI.deleteAvatar();
            onUpdate(null);
            toast.success('Avatar removed');
            setShowDeleteModal(false);
        } catch (err) {
            toast.error('Could not remove avatar');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl relative bg-gray-100">
                    {uploading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                            <AiOutlineLoading3Quarters className="animate-spin text-white text-2xl" />
                        </div>
                    ) : null}

                    <Image
                        src={currentAvatar?.url || '/default-avatar.jpg'}
                        alt="Profile"
                        fill
                        className="object-cover"
                    />
                </div>

                {/* Upload Button */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg transition-transform hover:scale-110"
                    title="Change Photo"
                >
                    <AiOutlineCamera size={18} />
                </button>
            </div>

            {/* Hidden Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*"
            />

            {/* Delete Button */}
            {currentAvatar?.url && (
                <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={uploading}
                    className="text-xs text-black-500 hover:text-red-600 cursor-pointer flex items-center gap-1 font-medium transition-colors"
                >
                    <AiOutlineDelete /> Remove Photo
                </button>
            )}
                <ConfirmModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDelete}
                    title="Remove Profile Picture?"
                    message="Are you sure you want to remove your photo? This action cannot be undone."
                    isLoading={uploading}
                    confirmText="Yes, Remove"
                    cancelText="Cancel"
                />

        </div>
    );
}