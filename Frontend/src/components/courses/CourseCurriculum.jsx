'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiChevronDown, FiChevronUp, FiPlayCircle, FiFileText, FiDownload, FiLock, FiCheck, FiFile } from 'react-icons/fi';
import { HiOutlineClock } from 'react-icons/hi';
import { cn, formatDuration } from '@/lib/utils';

const getLessonDuration = (lesson) => {
    return lesson.duration || 0;
};

const getLessonIcon = (type) => {
    switch (type) {
        case 'video':
            return <FiPlayCircle className="w-5 h-5 text-primary-500" />;
        case 'document':
            return <FiDownload className="w-5 h-5 text-green-500" />;
        case 'raw':
            return <FiFileText className="w-5 h-5 text-blue-500" />;
        default:
            return <FiFileText className="w-5 h-5 text-gray-400" />;
    }
};

export default function CourseCurriculum({ sections = [], isEnrolled, courseId, isPermitted }) {
    const [expandedSections, setExpandedSections] = useState([sections[0]?._id]);
    const router = useRouter();

    const toggleSection = (sectionId) => {
        setExpandedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    // --- Calculate Totals ---
    const totalLessons = sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);

    const totalDuration = sections.reduce((acc, section) => {
        const sectionTime = section.lessons?.reduce((sum, lesson) => sum + getLessonDuration(lesson), 0) || 0;
        return acc + sectionTime;
    }, 0);

    const handleLessonClick = (lesson) => {
        if (!lesson.accessible) return;

        // Handle Document Lessons (Open in Google Viewer)
        if (lesson.type === 'document') {
            const docUrl = lesson.documents?.url;

            if (docUrl) {
                // Open in Google viewer
                const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(docUrl)}&embedded=false`;
                // Open in a new tab
                window.open(viewerUrl, '_blank');
            } else {
                console.error("Document URL missing");
            }
            return;
        }

        // Video/Text
        router.push(`/courses/${courseId}/lesson/${lesson.id}`);
    };
    return (
        <div className="glass-card p-6">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Course Content</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{sections.length} sections</span>
                    <span>•</span>
                    <span>{totalLessons} lectures</span>
                    <span>•</span>
                    <span>{formatDuration(totalDuration)} total length</span>
                </div>
            </div>

            {/* Sections List */}
            <div className="space-y-4">
                {sections.map((section, idx) => {
                    const isExpanded = expandedSections.includes(section._id);

                    // Calculate Section Duration
                    const sectionDuration = section.lessons?.reduce((sum, l) => sum + getLessonDuration(l), 0) || 0;

                    // Map accessible status
                    const lessons = section.lessons?.map(lesson => ({
                        ...lesson,
                        accessible: lesson.isPreview || isEnrolled || isPermitted
                    })) || [];
                    return (
                        <div key={section._id} className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white/50 dark:bg-white/5">
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(section._id)}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center space-x-3 flex-1 text-left">
                                    {isExpanded ? <FiChevronUp className="w-5 h-5 text-gray-500" /> : <FiChevronDown className="w-5 h-5 text-gray-500" />}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 dark:text-gray-100">
                                            Section {idx + 1}: {section.title}
                                        </h3>
                                        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <span>{lessons.length} lectures</span>
                                            <span>•</span>
                                            <span>{formatDuration(sectionDuration)}</span>
                                        </div>
                                    </div>
                                </div>
                            </button>

                            {/* Lessons List (Accordion Body) */}
                            {isExpanded && (
                                <div className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-transparent">
                                    {lessons.length > 0 ? (
                                        lessons.map((lesson, lessonIdx) => (
                                            <div
                                                key={lesson.id || lessonIdx}
                                                onClick={() => handleLessonClick(lesson)}
                                                className={cn(
                                                    'flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5 last:border-b-0 transition-all duration-200',
                                                    lesson.accessible
                                                        ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5'
                                                        : 'cursor-not-allowed opacity-50 grayscale'
                                                )}
                                            >
                                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                    {/* Type Icon */}
                                                    <div className="shrink-0 p-2 rounded-lg bg-gray-100 dark:bg-white/5">
                                                        {getLessonIcon(lesson.type)}
                                                    </div>

                                                    {/* Title & Meta */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">
                                                                {lesson.title}
                                                            </span>

                                                            {lesson.isPreview && (
                                                                <span className="px-2 py-0.5 bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 text-[10px] uppercase tracking-wider rounded font-bold">
                                                                    Free
                                                                </span>
                                                            )}
                                                            {lesson.isCompleted && <FiCheck className="w-4 h-4 text-green-500" />}
                                                        </div>
                                                        {/*  Description Preview */}
                                                        {lesson.description && (
                                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                                                {lesson.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right Side: Duration */}
                                                <div className="flex items-center space-x-3 shrink-0 ml-4">
                                                    {lesson.accessible ? (
                                                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                                                            {lesson.type === 'video' && getLessonDuration(lesson) > 0 ? (
                                                                <>
                                                                    <HiOutlineClock className="w-3.5 h-3.5" />
                                                                    <span>{formatDuration(getLessonDuration(lesson))}</span>
                                                                </>
                                                            ) : lesson.type === 'document' ? (
                                                                <span className="text-[10px] border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded">PDF</span>
                                                            ) : null}
                                                        </div>
                                                    ) : (
                                                        <FiLock className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center text-sm text-gray-500 italic">
                                            No lessons in this section yet.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}