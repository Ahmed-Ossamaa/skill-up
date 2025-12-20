
import { useState } from 'react';
import LessonItem from './LessonItem';
import LessonModal from './LessonModal';
import { FiPlus, FiChevronDown } from 'react-icons/fi';

export default function SectionCard({ section, index, courseId, refetchCourse }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null); 

    const handleAddLesson = () => {
        setEditingLesson(null); 
        setIsLessonModalOpen(true);
    };

    const handleEditLesson = (lesson) => {
        setEditingLesson(lesson);
        setIsLessonModalOpen(true);
    };

    // ................. Lesson CRUD  Handlers.............

    return (
        <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm">
            <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center space-x-4">
                    <span className="text-lg font-semibold">Section {index + 1}: {section.title}</span>
                    <span className="text-sm text-gray-500">({section.lessons.length} Lessons)</span>
                </div>
                <FiChevronDown className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
            </div>

            {/* Section Content */}
            {isExpanded && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-600 space-y-3">
                    <div className="space-y-2">
                        {section.lessons.map((lesson, lessonIndex) => (
                            <LessonItem
                                key={lesson._id || `lesson-${lessonIndex}`}
                                lesson={lesson}
                                index={lessonIndex}
                                onEdit={() => handleEditLesson(lesson)}

                            />
                        ))}
                    </div>

                    {/* Add Lesson Btn */}
                    <button
                        onClick={handleAddLesson}
                        className="w-full px-4 py-2 border border-dashed border-primary-500 text-primary-500 rounded-lg hover:bg-primary-500/10 transition flex items-center justify-center space-x-2 text-sm"
                    >
                        <FiPlus className='w-4 h-4' />
                        <span>Add Lesson/Quiz</span>
                    </button>
                </div>
            )}

            {/* Add/Edit Lesson Modal */}
            <LessonModal
                isOpen={isLessonModalOpen}
                onClose={() => setIsLessonModalOpen(false)}
                sectionId={section._id}
                editingLesson={editingLesson}
                refetchCourse={refetchCourse}
                courseId={courseId}
            />
        </div>
    );
}