'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { lessonAPI } from '@/lib/api';
import { FiChevronLeft, FiCheckCircle, FiFileText, FiPlayCircle, FiDownload, FiExternalLink, FiFile } from 'react-icons/fi';
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
                const id = params.lessonId || params.id;
                const res = await lessonAPI.getById(id);
                setLesson(res.data?.data || res.data);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load lesson");
            } finally {
                setLoading(false);
            }
        };
        fetchLesson();
    }, [params]);

    //Mark Complete
    const handleMarkAsComplete = async () => {
        if (!lesson) return;
        setIsCompleting(true);
        try {
            const courseId = lesson.course?._id || lesson.course;
            await lessonAPI.markComplete(courseId, lesson._id);
            toast.success("Lesson completed!");
            router.refresh();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error updating progress");
        } finally {
            setIsCompleting(false);
        }
    };

    const renderPlayer = () => {
        if (!lesson) return null;

        //VIDEO
        if (lesson.type === 'video') {
            return (
                <div className="bg-black aspect-video relative">
                    <video
                        src={lesson.video?.url}
                        controls
                        controlsList="nodownload"
                        className="w-full h-full"
                    />
                </div>
            );
        }

        //DOCUMENT
        if (lesson.type === 'document') {
            return (
                <div className="aspect-video flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 text-center p-10">
                    <div className="bg-white dark:bg-slate-700 p-6 rounded-full mb-6 shadow-sm">
                        <FiFileText className="w-16 h-16 text-primary-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
                        {lesson.documents?.name || 'Lesson Document'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
                        This lesson includes a downloadable file. Click the button below to access it.
                    </p>
                    <a
                        href={lesson.documents?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition flex items-center gap-3 shadow-lg shadow-primary-500/20"
                    >
                        <FiDownload className="w-5 h-5" /> Download File
                    </a>
                </div>
            );
        }

        // RAW TEXT
        if (lesson.type === 'raw') {
            return (
                <div className="p-8 md:p-12 bg-white dark:bg-slate-900">
                    <div
                        className="prose prose-lg dark:prose-invert max-w-none prose-img:rounded-xl"
                        dangerouslySetInnerHTML={{ __html: lesson.content }}
                    />
                </div>
            );
        }

        return null;
    };

    if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent"></div></div>;
    if (!lesson) return <div className="p-10 text-center">Lesson not found.</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Top Bar */}
            <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4">
                <div className="container mx-auto flex items-center justify-between">
                    <button onClick={() => router.back()} className="flex items-center text-slate-600 dark:text-slate-300 hover:text-primary-500 font-medium transition">
                        <FiChevronLeft className="mr-2" /> Back to Course
                    </button>
                    <button
                        onClick={handleMarkAsComplete}
                        disabled={isCompleting}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all shadow-lg active:scale-95 ${isCompleting ? 'bg-slate-300 text-slate-500' : 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20'
                            }`}
                    >
                        <FiCheckCircle /> {isCompleting ? "Saving..." : "Mark as Complete"}
                    </button>
                </div>
            </div>

            <div className="container mx-auto mt-8 px-4 max-w-5xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-primary-500 font-bold text-xs uppercase tracking-widest mb-3">
                        {lesson.type === 'video' ? <FiPlayCircle /> : lesson.type === 'document' ? <FiFile /> : <FiFileText />}
                        <span>{lesson.type} Lesson</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                        {lesson.title}
                    </h1>
                </div>

                {/* Main Player Area */}
                <div className="w-full rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {renderPlayer()}
                </div>

                {/* Info & Resources */}
                <div className="mt-12 grid md:grid-cols-3 gap-12">
                    <div className="md:col-span-2 space-y-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">About this lesson</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg whitespace-pre-wrap">
                            {lesson.description || "No description provided."}
                        </p>
                    </div>

                    <div className="md:col-span-1">
                        {lesson.resources?.length > 0 && (
                            <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <h4 className="font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                                    <FiFileText className="text-primary-500" /> Resources
                                </h4>
                                <ul className="space-y-3">
                                    {lesson.resources.map((res, i) => (
                                        <li key={i}>
                                            <a
                                                href={res.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 transition shadow-sm"
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500 shrink-0">
                                                        <FiExternalLink />
                                                    </div>
                                                    <span className="text-sm font-medium truncate text-slate-700 dark:text-slate-200 group-hover:text-primary-500">
                                                        {res.name || "View Resource"}
                                                    </span>
                                                </div>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}