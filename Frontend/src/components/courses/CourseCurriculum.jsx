'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {FiChevronDown,FiChevronUp,FiPlayCircle,FiFileText,FiDownload,FiLock,FiCheck} from 'react-icons/fi';
import { HiOutlineClock } from 'react-icons/hi';
import { cn, formatDuration } from '@/lib/utils';

const getLessonIcon = (type, resources) => {
    switch (type) {
        case 'video':
            return <FiPlayCircle className="w-5 h-5 text-primary-500" />;
        case 'raw':
            return <FiFileText className="w-5 h-5 text-blue-500" />;
        default:

            if (resources && resources.length > 0) {
                return <FiDownload className="w-5 h-5 text-green-500" />;
            }
            return <FiFileText className="w-5 h-5 text-gray-500" />;
    }
};

export default function CourseCurriculum({ sections = [], isEnrolled, courseId }) {
    const [expandedSections, setExpandedSections] = useState([sections[0]?._id]);
    const router = useRouter();

    const toggleSection = (sectionId) => {
        setExpandedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const totalLessons = sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);
    const totalDuration = sections.reduce(
        (acc, s) => acc + (s.lessons?.reduce((sum, l) => sum + (l.duration || 0), 0) || 0),
        0
    );

    const handleLessonClick = (lesson) => {
        if (!lesson.accessible) return;
        console.log("lesson test", lesson);
        console.log("courseId test", courseId);
        console.log("lessonId test", lesson._id);
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

            {/* Sections */}
            <div className="space-y-2">
                {sections.map((section, idx) => {
                    const isExpanded = expandedSections.includes(section._id);
                    const sectionDuration = section.lessons?.reduce((sum, l) => sum + (l.duration || 0), 0) || 0;

                    // include accessible flag
                    const lessons = section.lessons?.map(lesson => {
                        console.log("Lesson object:", lesson);  // ← Add this to see lesson structure
                        return {
                            ...lesson,
                            accessible: lesson.isPreview || isEnrolled
                        };
                    }) || [];

                    return (
                        <div key={section._id} className="border border-white/10 rounded-lg overflow-hidden">
                            <button
                                onClick={() => toggleSection(section._id)}
                                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center space-x-3 flex-1 text-left">
                                    {isExpanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
                                    <div className="flex-1">
                                        <h3 className="font-semibold">
                                            Section {idx + 1}: {section.title}
                                        </h3>
                                        <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            <span>{lessons.length} lectures</span>
                                            <span>•</span>
                                            <span>{formatDuration(sectionDuration)}</span>
                                        </div>
                                    </div>
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="border-t border-white/10">
                                    {lessons.length > 0 ? (
                                        lessons.map((lesson, lessonIdx) => (
                                            <div
                                                key={lesson._id || `${section._id}_lesson_${lessonIdx}`}
                                                onClick={() => handleLessonClick(lesson)}
                                                className={cn(
                                                    'flex items-center justify-between p-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors',
                                                    lesson.accessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                                                )}
                                            >
                                                <div className="flex items-center space-x-3 flex-1">
                                                    {/* Icon (Uses updated function) */}
                                                    <div className="shrink-0">
                                                        {getLessonIcon(lesson.type, lesson.resources)}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm font-medium">
                                                                {lessonIdx + 1}. {lesson.title}
                                                            </span>
                                                            {lesson.isPreview && (
                                                                <span className="px-2 py-0.5 bg-primary-500/20 text-primary-500 text-xs rounded-full font-medium">
                                                                    Preview
                                                                </span>
                                                            )}
                                                            {lesson.isCompleted && <FiCheck className="w-4 h-4 text-green-500" />}
                                                        </div>
                                                        {lesson.description && (
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                                                                {lesson.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Duration & Lock */}
                                                    <div className="flex items-center space-x-3 shrink-0">
                                                        {lesson.duration && (
                                                            <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                                                                <HiOutlineClock className="w-4 h-4" />
                                                                <span>{formatDuration(lesson.duration)}</span>
                                                            </div>
                                                        )}
                                                        {!lesson.accessible && <FiLock className="w-4 h-4 text-gray-500" />}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-gray-500">No lessons available yet</div>
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