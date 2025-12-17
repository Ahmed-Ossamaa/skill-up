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
                // Order is typically handled by the backend (e.g., set to max(order) + 1)
            });

            // Refetch all data to update the UI and ensure correct state
            await refetch();
            setIsAddModalOpen(false);
        } catch (error) {
            console.error("Failed to add section:", error);
            // Handle error state display
        }
    };

    // Handle Section Reordering (Frontend State & Backend API)
    const onDragEnd = async (result) => {
        // This is where you implement the logic from a D&D library (e.g., dnd-kit)
        // Omitted for brevity, but it involves:
        // 1. Update the local 'sections' state (optimistic update)
        // 2. Map the new section order to an array of { id, order }
        // 3. Call the API to persist the new order:
        /*
        try {
            await sectionAPI.reorder(courseId, newOrderArray);
            // If successful, local state is correct.
        } catch (error) {
            // If failure, revert local state and show error.
            await refetch(); // Revert by fetching the truth from the server
        }
        */
    };

    // --- Render ---

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
                {/* Integration point for DragDropContext from a library */}
                {/* <DragDropContext onDragEnd={onDragEnd}> */}
                <SectionList
                    sections={sections}
                    setSections={setSections}
                    courseId={courseId}
                    refetchCourse={refetch}
                />
                {/* </DragDropContext> */}
            </div>

            <AddSectionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddSection}
            />
        </div>
    );
}