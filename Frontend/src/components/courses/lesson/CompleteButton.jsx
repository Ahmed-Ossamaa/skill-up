import React, { useState, useEffect } from 'react';
import { enrollmentAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CompleteButton({ lesson, courseId, onProgressUpdate }) {
    const [isCompleting, setIsCompleting] = useState(false);
    const [requirementsMet, setRequirementsMet] = useState({
        videoWatched: false,
        resourcesClicked: false
    });

    // Determine if the "Mark as Complete" button should be enabled
    const canMarkAsComplete = () => {
        if (lesson.type === 'video' && !requirementsMet.videoWatched) return false;
        // You can add more strict logic here (e.g., must click resources)
        return true;
    };

    const handleComplete = async () => {
        setIsCompleting(true);
        try {
            // Triggering the specific route we defined earlier
            const { data } = await enrollmentAPI.markLessonComplete(courseId, lesson._id);
            toast.success("Lesson marked as complete!");

            // Callback to update the parent component's progress state
            if (onProgressUpdate) onProgressUpdate(data.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update progress");
        } finally {
            setIsCompleting(false);
        }
    };

    return (
        <button
            onClick={handleComplete}
            disabled={!canMarkAsComplete() || isCompleting}
            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center space-x-2 ${canMarkAsComplete()
                    ? 'bg-green-500 text-white hover:bg-green-600 shadow-md active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
        >
            {isCompleting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <>
                    <span>{canMarkAsComplete() ? "Mark as Complete" : "Finish Content to Complete"}</span>
                </>
            )}
        </button>
    );
}