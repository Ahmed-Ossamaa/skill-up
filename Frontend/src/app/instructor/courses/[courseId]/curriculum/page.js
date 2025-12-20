'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CurriculumWrapper from '@/components/courses/courseBuilder/CurriculumWrapper';
import { courseAPI } from '@/lib/api';

export default function CurriculumPage() {
    const params = useParams();
    const courseId = params.courseId;

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const res = await courseAPI.getCourseContent(courseId);
            setCourse(res.data.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching content:", err);
            setError("Failed to load course content.. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) {
            fetchContent();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    if (loading) {
        return (
            <DashboardLayout role="instructor">
                <div className="flex items-center justify-center h-96">Loading Curriculum...</div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout role="instructor">
                <div className="text-red-500 p-4">{error}</div>
            </DashboardLayout>
        );
    }

    if (!course) return null;
    return (
        <DashboardLayout role="instructor">
            <h1 className="text-3xl font-bold mb-4">Curriculum Builder: {course.title}</h1>
            <p className="text-gray-500 mb-6">Manage the structure, order, and content of your course.</p>

            <CurriculumWrapper
                initialCourse={course}
                courseId={courseId}
                refetch={fetchContent}
            />
        </DashboardLayout>
    );
}