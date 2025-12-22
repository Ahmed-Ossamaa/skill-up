'use client';

import { useState } from 'react';
import { FiX, FiSave } from 'react-icons/fi';

export default function UserModal({ user, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'student',
        status: user.status || 'active'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onUpdate(user._id, formData);
            onClose();
        } catch (error) {
            console.error("Update failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="glass-card p-8 max-w-2xl w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Edit User</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 glass rounded-lg focus-ring bg-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2.5 glass rounded-lg focus-ring bg-transparent"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-2.5 glass rounded-lg focus-ring bg-gray-50 dark:bg-slate-800"
                            >
                                <option value="student">Student</option>
                                <option value="instructor">Instructor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2.5 glass rounded-lg focus-ring bg-gray-50 dark:bg-slate-800"
                            >
                                <option value="active">Active</option>
                                <option value="banned">Banned</option>
                            </select>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-4 pt-6 mt-4 border-t border-white/10">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-linear-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? 'Saving...' : <><FiSave /> Save Changes</>}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 glass-button hover:bg-white/5"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}