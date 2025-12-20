
'use client';

import { useState, useEffect, useRef } from 'react';
import { FiX, FiVideo, FiFileText, FiUpload, FiTrash2, FiAlertCircle, FiPaperclip, FiFile } from 'react-icons/fi';
import { lessonAPI } from '@/lib/api';
import useAuthStore from '@/store/authStore';

const LESSON_TYPES = {
    VIDEO: 'video',
    DOCUMENT: 'document',
    RAW: 'raw',
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB (handled by backend anw)

export default function LessonModal({ isOpen, onClose, sectionId, courseId, editingLesson, refetchCourse }) {
    const { user } = useAuthStore();
    const isEditMode = !!editingLesson;

    // --- Form State ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState(LESSON_TYPES.VIDEO);
    const [isPreview, setIsPreview] = useState(false);

    // Content State
    const [videoFile, setVideoFile] = useState(null);
    const [docFile, setDocFile] = useState(null);
    const [content, setContent] = useState('');

    // Resource State
    const [existingResources, setExistingResources] = useState([]);
    const [newResourceFiles, setNewResourceFiles] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const resourceInputRef = useRef(null);

    // Load data on open
    useEffect(() => {
        if (editingLesson) {
            setTitle(editingLesson.title || '');
            setDescription(editingLesson.description || '');
            setType(editingLesson.type || LESSON_TYPES.VIDEO);
            setIsPreview(editingLesson.isPreview || false);
            setContent(editingLesson.content || '');
            setExistingResources(editingLesson.resources || []);
        } else {
            resetForm();
        }
        setNewResourceFiles([]);
        setError('');
    }, [editingLesson, isOpen]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setType(LESSON_TYPES.VIDEO);
        setIsPreview(false);
        setVideoFile(null);
        setDocFile(null);
        setContent('');
        setExistingResources([]);
    };

    if (!isOpen) return null;

    // .................... Handlers ...................
    const handleFileChange = (e, setFile) => {
        const file = e.target.files[0];
        if (file && file.size > MAX_FILE_SIZE) {
            setError(`File limit is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
            return;
        }
        setFile(file);
        setError('');
    };

    const handleResourceFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setNewResourceFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setError('Title is required.');
            setLoading(false);
            return;
        }

        // Validate File Requirements
        if (!isEditMode) {
            if (type === LESSON_TYPES.VIDEO && !videoFile) {
                setError('Please upload a video file.');
                setLoading(false); return;
            }
            if (type === LESSON_TYPES.DOCUMENT && !docFile) {
                setError('Please upload a document file.');
                setLoading(false); return;
            }
        }

        const submitData = new FormData();

        //Basic Fields
        submitData.append('title', trimmedTitle);
        submitData.append('description', description.trim());
        submitData.append('type', type);
        submitData.append('isPreview', isPreview);
        submitData.append('section', sectionId);
        submitData.append('course', courseId);
        submitData.append('createdBy', user._id);

        // Content Fields
        if (type === LESSON_TYPES.VIDEO && videoFile) {
            submitData.append('video', videoFile);
        }
        else if (type === LESSON_TYPES.DOCUMENT && docFile) {
            submitData.append('document', docFile); 
        }
        else if (type === LESSON_TYPES.RAW) {
            submitData.append('content', content.trim());
        }

        // Resources
        submitData.append('resources', JSON.stringify(existingResources));
        if (newResourceFiles.length > 0) {
            newResourceFiles.forEach(file => submitData.append('resourceFiles', file));
        }

        try {
            if (isEditMode) {
                await lessonAPI.update(editingLesson._id, submitData);
            } else {
                await lessonAPI.create(submitData);
            }
            await refetchCourse();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Operation failed.');
        } finally {
            setLoading(false);
        }
    };


    const renderContentForm = () => {
        switch (type) {
            case LESSON_TYPES.VIDEO:
                return (
                    <div>
                        <label className="block text-sm font-medium mb-2">Video File</label>
                        {isEditMode && editingLesson.video?.url && !videoFile && (
                            <div className="mb-3 p-3 bg-blue-50 text-blue-700 rounded text-sm flex items-center gap-2">
                                <FiVideo />
                                <span>Current video exists. Uploading new replaces it.</span>
                            </div>
                        )}
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 bg-gray-50">
                            <div className="flex flex-col items-center pt-5 pb-6">
                                <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">{videoFile ? videoFile.name : "Upload Video (MP4, MOV)"}</p>
                            </div>
                            <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, setVideoFile)} className="hidden" />
                        </label>
                    </div>
                );
            case LESSON_TYPES.DOCUMENT:
                return (
                    <div>
                        <label className="block text-sm font-medium mb-2">Document File</label>
                        {isEditMode && editingLesson.documents?.url && !docFile && (
                            <div className="mb-3 p-3 bg-blue-50 text-blue-700 rounded text-sm flex items-center gap-2">
                                <FiFile />
                                <span>Current document: {editingLesson.documents.name}</span>
                            </div>
                        )}
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 bg-gray-50">
                            <div className="flex flex-col items-center pt-5 pb-6">
                                <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">{docFile ? docFile.name : "Upload Document (PDF, DOCX)"}</p>
                            </div>
                            <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={(e) => handleFileChange(e, setDocFile)} className="hidden" />
                        </label>
                    </div>
                );
            case LESSON_TYPES.RAW:
                return (
                    <div>
                        <label className="block text-sm font-medium mb-2">Article Content</label>
                        <textarea
                            rows="8"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 dark:bg-gray-700"
                            placeholder="Type your lesson content..."
                        />
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">{isEditMode ? 'Edit Lesson' : 'Add New Lesson'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={24} /></button>
                </div>

                <div className="p-6 space-y-6">
                    {error && <div className="p-3 bg-red-100 text-red-600 rounded flex items-center gap-2"><FiAlertCircle /> {error}</div>}

                    <form id="lessonForm" onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" placeholder="Lesson Title" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" rows="2" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="preview" checked={isPreview} onChange={e => setIsPreview(e.target.checked)} className="rounded text-primary-600" />
                                <label htmlFor="preview" className="text-sm">Free Preview</label>
                            </div>
                        </div>

                        {/* Type Selector */}
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: LESSON_TYPES.VIDEO, icon: <FiVideo />, label: 'Video' },
                                { id: LESSON_TYPES.DOCUMENT, icon: <FiFile />, label: 'Document' },
                                { id: LESSON_TYPES.RAW, icon: <FiFileText />, label: 'Article' }
                            ].map(t => (
                                <button key={t.id} type="button" onClick={() => setType(t.id)}
                                    className={`p-3 border rounded-lg flex flex-col items-center justify-center gap-2 text-sm ${type === t.id ? 'border-primary-500 bg-primary-50 text-primary-600' : 'hover:bg-gray-50'}`}>
                                    {t.icon} {t.label}
                                </button>
                            ))}
                        </div>

                        {renderContentForm()}

                        {/* Resources Section */}
                        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold text-sm flex items-center gap-2"><FiPaperclip /> Resources</h3>
                                <button type="button" onClick={() => resourceInputRef.current?.click()} className="text-primary-600 text-sm hover:underline flex items-center gap-1"><FiUpload size={14} /> Add Files</button>
                                <input type="file" multiple ref={resourceInputRef} className="hidden" onChange={handleResourceFileChange} />
                            </div>

                            <div className="space-y-2">
                                {existingResources.map((res, idx) => (
                                    <div key={`exist-${idx}`} className="flex justify-between items-center text-sm p-2 bg-white rounded border">
                                        <span className="truncate max-w-[200px]">{res.name}</span>
                                        <button type="button" onClick={() => setExistingResources(prev => prev.filter((_, i) => i !== idx))} className="text-red-500"><FiTrash2 /></button>
                                    </div>
                                ))}
                                {newResourceFiles.map((file, idx) => (
                                    <div key={`new-${idx}`} className="flex justify-between items-center text-sm p-2 bg-green-50 rounded border border-green-200">
                                        <span className="truncate max-w-[200px]">{file.name}</span>
                                        <button type="button" onClick={() => setNewResourceFiles(prev => prev.filter((_, i) => i !== idx))} className="text-red-500"><FiTrash2 /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>
                {/* Btns */}
                <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button form="lessonForm" type="submit" disabled={loading} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded shadow-md">{loading ? 'Saving...' : 'Save Lesson'}</button>
                </div>
            </div>
        </div>
    );
}