// app/instructor/courses/[courseId]/curriculum/components/LessonModal.js
'use client';

import { useState, useEffect } from 'react';
import { FiX, FiVideo, FiFileText, FiLink, FiUpload, FiTrash2, FiAlertCircle } from 'react-icons/fi';
// Assume lessonAPI handles creating and updating lessons and resource uploads
import { lessonAPI } from '@/lib/api'; 
import useAuthStore from '@/store/authStore'; 

// --- Schema-Specific Constants ---
const LESSON_TYPES = {
    VIDEO: 'video',
    RAW: 'raw', 
};

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; //  50MB limit

export default function LessonModal({ isOpen, onClose, sectionId, courseId, editingLesson, refetchCourse }) {
    const { user } = useAuthStore();
    const isEditMode = !!editingLesson;
    
    // --- Local Form State ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState(LESSON_TYPES.VIDEO);
    const [isPreview, setIsPreview] = useState(false);
    
    // Content-specific states
    const [videoFile, setVideoFile] = useState(null); 
    const [content, setContent] = useState('');
    
    // Resource states (Simplified)
    const [resources, setResources] = useState([]); 

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load existing lesson data when entering edit mode
    useEffect(() => {
        if (editingLesson) {
            setTitle(editingLesson.title || '');
            setDescription(editingLesson.description || '');
            setType(editingLesson.type || LESSON_TYPES.VIDEO);
            setIsPreview(editingLesson.isPreview || false);
            // NOTE: We cannot pre-fill the video file input with the existing file, 
            // but we can acknowledge the existing video URL from the schema:
            // setVideoUrl(editingLesson.video?.url || ''); // No longer needed
            setContent(editingLesson.content || '');
            setResources(editingLesson.resources || []);
        } else {
            // Reset for creation mode
            setTitle('');
            setDescription('');
            setType(LESSON_TYPES.VIDEO);
            setIsPreview(false);
            setVideoFile(null); // *** CHANGED: Reset file input ***
            setContent('');
            setResources([]);
        }
        setError('');
    }, [editingLesson, isOpen]);

    if (!isOpen) return null;
    
    // --- Submission Handler ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // 1. Basic Validation
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setError('Lesson title is required.');
            setLoading(false);
            return;
        }

        if (type === LESSON_TYPES.VIDEO && !videoFile && !isEditMode) {
             setError('A video file is required for new video lessons.');
             setLoading(false);
             return;
        }
        
        // 2. Prepare Data: Use FormData for file upload
        const submitData = new FormData();
        
        // Append basic fields
        submitData.append('title', trimmedTitle);
        submitData.append('description', description.trim());
        submitData.append('type', type);
        submitData.append('isPreview', isPreview);
        submitData.append('section', sectionId);
        submitData.append('course', courseId);
        submitData.append('createdBy', user._id);
        
        // Append content fields based on type
        if (type === LESSON_TYPES.VIDEO) {
            if (videoFile) {
                // If a new file is selected, append it (backend handles Cloudinary upload)
                submitData.append('video', videoFile); 
            }
            // If editing and no new file is chosen, we rely on the backend to keep the old video object.
            
            // NOTE: If using FormData, resources must be stringified or handled carefully
        } else if (type === LESSON_TYPES.RAW) {
            submitData.append('content', content.trim());
        }
        
        // Append resources array (must be stringified for FormData to handle arrays of objects)
        submitData.append('resources', JSON.stringify(resources));

        // 3. API Call
        try {
            if (isEditMode) {
                // Use a dedicated update API that handles FormData
                await lessonAPI.update(editingLesson._id, submitData);
            } else {
                // Use a dedicated create API that handles FormData
                await lessonAPI.create(submitData);
            }

            await refetchCourse(); 
            onClose();

        } catch (err) {
            console.error('Lesson operation failed:', err);
            // Handle error response from server
            setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} lesson.`);
        } finally {
            setLoading(false);
        }
    };
    
    // --- Video File Change Handler ---
    const handleVideoFileChange = (e) => {
        const file = e.target.files[0];
        
        if (file && file.size > MAX_VIDEO_SIZE) {
            setError(`File size exceeds the limit of ${MAX_VIDEO_SIZE / 1024 / 1024}MB.`);
            setVideoFile(null);
            e.target.value = null; // Clear input
            return;
        }

        setVideoFile(file);
        setError('');
    };

    // --- Resource Management Handlers (Simplified) ---
    const handleAddResource = () => {
        setResources([...resources, { 
            fileName: 'New Resource File', 
            fileUrl: '', // Will be uploaded/input later
            fileType: '',
        }]);
    };

    const handleRemoveResource = (index) => {
        setResources(resources.filter((_, i) => i !== index));
    };

    // --- Dynamic Content Render ---
    const renderContentForm = () => {
        switch (type) {
            case LESSON_TYPES.VIDEO:
                return (
                    <div>
                        <label htmlFor="video-upload" className="block text-sm font-medium mb-2">
                            Video File Upload
                        </label>
                        
                        {/* Current Video Info (for Edit Mode) */}
                        {isEditMode && editingLesson.video?.url && !videoFile && (
                            <div className="mb-3 p-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded text-sm flex items-start space-x-2">
                                <FiAlertCircle className="w-5 h-5 shrink-0" />
                                <p>An existing video is attached. Uploading a new file will replace it.</p>
                            </div>
                        )}

                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors bg-gray-50 dark:bg-gray-700">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <FiUpload className="w-8 h-8 mb-2 text-gray-400" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {videoFile ? `File Selected: ${videoFile.name}` : "Click to upload or drag and drop"}
                                </p>
                            </div>
                            <input
                                id="video-upload"
                                type="file"
                                accept="video/*"
                                onChange={handleVideoFileChange}
                                className="hidden"
                                disabled={loading}
                            />
                        </label>
                        <p className="mt-1 text-xs text-gray-500">
                            MP4, MOV, etc. (MAX. {MAX_VIDEO_SIZE / 1024 / 1024}MB). Upload will be handled by Cloudinary via the backend.
                        </p>
                    </div>
                );
            case LESSON_TYPES.RAW:
                return (
                    <div>
                        <label htmlFor="raw-content" className="block text-sm font-medium mb-2">
                            Raw Content / Article Body
                        </label>
                        <textarea
                            id="raw-content"
                            rows="10"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your article/text lesson content here..."
                            className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
                            disabled={loading}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl p-6 relative h-[90vh] overflow-y-auto">
                
                {/* Header and Close */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                    disabled={loading}
                >
                    <FiX className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold mb-2">
                    {isEditMode ? `Edit Lesson: ${editingLesson?.title}` : `Add New Lesson`}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Configure the lesson type and add its content.
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-500 text-red-500 rounded text-sm flex items-start space-x-2">
                        <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* --- Basic Information --- */}
                    <div className="p-4 border rounded-lg dark:border-gray-700">
                        <h3 className="font-semibold mb-3">Lesson Details</h3>
                        
                        {/* Title Input */}
                        <div className="mb-4">
                            <label htmlFor="lesson-title" className="block text-sm font-medium mb-2">
                                Lesson Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="lesson-title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Setting up your development environment"
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
                                disabled={loading}
                            />
                        </div>
                        
                        {/* Description Input */}
                        <div>
                            <label htmlFor="lesson-description" className="block text-sm font-medium mb-2">
                                Description (Optional)
                            </label>
                            <textarea
                                id="lesson-description"
                                rows="3"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="A brief summary of this lesson."
                                className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
                                disabled={loading}
                            />
                        </div>

                        {/* Free Preview Toggle (Schema: isPreview) */}
                        <div className="mt-4 flex items-center space-x-2">
                            <input
                                id="is-preview"
                                type="checkbox"
                                checked={isPreview}
                                onChange={(e) => setIsPreview(e.target.checked)}
                                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                                disabled={loading}
                            />
                            <label htmlFor="is-preview" className="text-sm font-medium">
                                Mark as Free Preview
                            </label>
                        </div>
                    </div>
                    
                    {/* --- Content Type Selector --- */}
                    <div className="p-4 border rounded-lg dark:border-gray-700">
                        <h3 className="font-semibold mb-3">Lesson Type</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Video Type */}
                            <button
                                type="button"
                                onClick={() => setType(LESSON_TYPES.VIDEO)}
                                className={`flex flex-col items-center p-4 border rounded-lg transition ${
                                    type === LESSON_TYPES.VIDEO
                                        ? 'bg-primary-500/10 border-primary-500 text-primary-500'
                                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                                disabled={loading}
                            >
                                <FiVideo className="w-6 h-6 mb-2" />
                                <span className="text-sm font-medium">Video</span>
                            </button>

                            {/* Raw Type (Article/Text) */}
                            <button
                                type="button"
                                onClick={() => setType(LESSON_TYPES.RAW)}
                                className={`flex flex-col items-center p-4 border rounded-lg transition ${
                                    type === LESSON_TYPES.RAW
                                        ? 'bg-primary-500/10 border-primary-500 text-primary-500'
                                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                                disabled={loading}
                            >
                                <FiFileText className="w-6 h-6 mb-2" />
                                <span className="text-sm font-medium">Article/Raw Text</span>
                            </button>
                        </div>
                    </div>

                    {/* --- Dynamic Content Form --- */}
                    <div className="p-4 border rounded-lg dark:border-gray-700">
                        <h3 className="font-semibold mb-3">Content ({type.toUpperCase()})</h3>
                        {renderContentForm()}
                    </div>
                    
                    {/* --- Resources Management --- */}
                    <div className="p-4 border rounded-lg dark:border-gray-700">
                        <h3 className="font-semibold mb-3 flex items-center justify-between">
                            Resources (Supplements)
                            <button
                                type="button"
                                onClick={handleAddResource}
                                className="text-sm text-primary-500 hover:underline flex items-center space-x-1"
                                disabled={loading}
                            >
                                <FiUpload className="w-4 h-4" />
                                <span>Add File</span>
                            </button>
                        </h3>
                        
                        <div className="space-y-2">
                            {resources.length === 0 && (
                                <p className="text-sm text-gray-500 italic">No resources added yet.</p>
                            )}
                            {resources.map((resource, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded border">
                                    <div className="flex items-center space-x-2">
                                        <FiLink className="w-4 h-4 text-primary-500" />
                                        <span className="text-sm truncate max-w-xs">{resource.fileName}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveResource(index)}
                                        className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                                        disabled={loading}
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- Submit Button --- */}
                    <div className="pt-4 flex justify-end space-x-3">
                         <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-6 py-2 glass-button font-semibold disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition disabled:opacity-50 flex items-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>{isEditMode ? 'Update Lesson' : 'Create Lesson'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}