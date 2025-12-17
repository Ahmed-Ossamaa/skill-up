// app/instructor/courses/[courseId]/curriculum/components/SectionList.js
// This component would typically contain the Droppable logic from a D&D library.

import SectionCard from './SectionCard';

export default function SectionList({ sections, courseId, refetchCourse }) {
    return (
        <div className="space-y-4">
            {/* The list wrapper is a Droppable container */}
            {sections.map((section, index) => (
                // Each SectionCard is a Draggable item
                <SectionCard 
                    key={section._id} 
                    section={section} 
                    index={index}
                    courseId={courseId}
                    refetchCourse={refetchCourse}
                />
            ))}
        </div>
    );
}