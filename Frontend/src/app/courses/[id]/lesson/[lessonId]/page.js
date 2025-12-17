'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { lessonAPI } from '@/lib/api'; // Assuming lessonAPI is where your progress route is
import { FiChevronLeft, FiCheckCircle, FiFileText, FiPlayCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function LessonPage() {
    const params = useParams();
    const router = useRouter();
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCompleting, setIsCompleting] = useState(false);

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                setLoading(true);
                const res = await lessonAPI.getById(params.lessonId);
                const data = res.data?.data || res.data;
                setLesson(data);
            } catch (error) {
                toast.error("Failed to load lesson");
            } finally {
                setLoading(false);
            }
        };
        if (params.lessonId) fetchLesson();
    }, [params.lessonId]);

    // YOUR PROGRESS LOGIC: Triggering markLessonCompleted
    const handleMarkAsComplete = async () => {
        setIsCompleting(true);
        try {
            ///courses/:courseId/lessons/:lessonId/complete
            await lessonAPI.markComplete(params.id, params.lessonId);
            toast.success("Lesson completed!");

            // Optional: Redirect to next lesson or back to course
            router.refresh();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error updating progress");
        } finally {
            setIsCompleting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
    );

    if (!lesson) return <div className="p-10 text-center">Lesson not found.</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4">
                <div className="container mx-auto flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-slate-600 hover:text-primary-500 transition-colors font-medium"
                    >
                        <FiChevronLeft className="mr-2" /> Back to Course
                    </button>

                    {/* COMPLETE BUTTON: Integrated here */}
                    <button
                        onClick={handleMarkAsComplete}
                        disabled={isCompleting}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all shadow-lg active:scale-95 ${isCompleting ? 'bg-slate-300' : 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20'
                            }`}
                    >
                        <FiCheckCircle />
                        {isCompleting ? "Saving..." : "Mark as Complete"}
                    </button>
                </div>
            </div>

            <div className="container mx-auto mt-8 px-4 max-w-5xl">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 text-primary-500 font-bold text-xs uppercase tracking-widest mb-2">
                        {lesson.type === 'video' ? <FiPlayCircle /> : <FiFileText />}
                        {lesson.type} Lesson
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                        {lesson.title}
                    </h1>
                </div>

                {/* Main Player Area */}
                <div className="w-full rounded-4xl overflow-hidden shadow-2xl bg-black border-4 border-white dark:border-slate-800">
                    {lesson.type === 'video' ? (
                        <video
                            src={lesson.video?.url}
                            controls
                            controlsList="nodownload"
                            className="w-full aspect-video"
                            autoPlay
                        />
                    ) : (
                        <div className="bg-white p-12 min-h-[400px] text-slate-800 prose prose-slate max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                        </div>
                    )}
                </div>

                {/* Footer Content */}
                <div className="mt-10 grid md:grid-cols-3 gap-10">
                    <div className="md:col-span-2">
                        <h3 className="text-xl font-bold mb-4">About this lesson</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            {lesson.description || "No description provided for this lesson."}
                        </p>
                    </div>

                    {/* Resources Area */}
                    {lesson.resources?.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <h4 className="font-bold mb-4 flex items-center gap-2">
                                <FiFileText className="text-primary-500" /> Resources
                            </h4>
                            <ul className="space-y-3">
                                {lesson.resources.map((res, i) => (
                                    <li key={i}>
                                        <a
                                            href={res.fileUrl}
                                            target="_blank"
                                            className="text-sm text-slate-600 hover:text-primary-500 flex items-center gap-2 truncate"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-slate-300" />
                                            {res.fileName || "Resource Link"}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}