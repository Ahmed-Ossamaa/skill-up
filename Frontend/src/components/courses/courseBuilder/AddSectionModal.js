'use client';

import { useState } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';

export default function AddSectionModal({ isOpen, onClose, onSubmit }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setError('Section title is required.');
            return;
        }

        setLoading(true);
        try {
            // The onSubmit handler in CurriculumWrapper will call the API and refetch
            await onSubmit(trimmedTitle, description.trim());
            
            // Success: Reset local state and close
            setTitle('');
            setDescription('');
            onClose();
        } catch (err) {
            // Handle errors thrown by the API call in CurriculumWrapper's handler
            setError(err.message || 'Failed to add section. Check your network.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center  bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 relative">
                
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                    disabled={loading}
                >
                    <FiX className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                    <FiPlus className="w-6 h-6 text-primary-500" />
                    <span>Add New Section</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Define a logical group for your course lessons.
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-500 text-red-500 rounded text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title Input */}
                    <div>
                        <label htmlFor="section-title" className="block text-sm font-medium mb-2">
                            Section Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="section-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Section 1: Introduction to JavaScript"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
                            disabled={loading}
                        />
                    </div>

                    {/* Description Input (Optional) */}
                    <div>
                        <label htmlFor="section-description" className="block text-sm font-medium mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            id="section-description"
                            rows="3"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Briefly describe what this section will cover."
                            className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
                            disabled={loading}
                        />
                    </div>
                    
                    {/* Submit Button */}
                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition disabled:opacity-50 flex items-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        {/* Spinner path for loading state */}
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Adding...</span>
                                </>
                            ) : (
                                <span>Save Section</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}