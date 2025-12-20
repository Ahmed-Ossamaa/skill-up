'use client';

import { useState } from 'react';
import SectionList from './SectionList';
import AddSectionModal from './AddSectionModal';
import { sectionAPI } from '@/lib/api';
import { FiPlus } from 'react-icons/fi';

export default function CurriculumWrapper({ initialCourse, courseId, refetch }) {
    const [sections, setSections] = useState(initialCourse.sections || []);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleAddSection = async (title, description) => {
        try {
            await sectionAPI.create({
                course: courseId,
                title,
                description,
            });
            await refetch();
            setIsAddModalOpen(false);
        } catch (error) {
            console.error("Failed to add section:", error);
        }
    };

    const onDragEnd = async (result) => {
        //later ..............................
        //needs to be implemented in backend 
        // and search for a library for drag and drop or sth like that
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">
                    {sections.length} Sections, {initialCourse.totalLessons || '...'} Lessons
                </p>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                >
                    <FiPlus className="w-5 h-5" />
                    <span>Add New Section</span>
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">

                <SectionList
                    sections={sections}
                    setSections={setSections}
                    courseId={courseId}
                    refetchCourse={refetch}
                />
            </div>

            <AddSectionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddSection}
            />
        </div>
    );
}