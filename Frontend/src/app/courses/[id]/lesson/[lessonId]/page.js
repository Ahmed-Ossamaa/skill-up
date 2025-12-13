'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { lessonAPI } from '@/lib/api';

export default function LessonPage() {
    const params = useParams();
    const [lesson, setLesson] = useState(null);

    useEffect(() => {
        const fetchLesson = async () => {
            const res = await lessonAPI.getById(params.lessonId);
            const data = res.data?.data || res.data;
            setLesson(data);
        };
        fetchLesson();
    }, [params.lessonId]);

    if (!lesson) return <div>Loading...</div>;

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-6">{lesson.title}</h1>

            {/* Video Player */}
            <div className="w-full rounded-xl overflow-hidden shadow-lg bg-black">
                <video
                    src={lesson.video?.url}
                    controls
                    className="w-full max-h-[70vh]"
                />
            </div>

            {/* Lesson Description */}
            <p className="mt-6 text-gray-700 dark:text-gray-300">
                {lesson.description}
            </p>
        </div>
    );
}
