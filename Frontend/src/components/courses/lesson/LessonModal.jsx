// 'use client';

// import { useState, useEffect } from 'react';
// import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
// import { motion, AnimatePresence } from 'framer-motion';
// import { lessonAPI } from '@/lib/api';
// import CompleteButton from '@/components/courses/lesson/CompleteButton'; // Ensure this uses your markLessonCompleted logic

// export default function LessonModal({ isOpen, lessonId, courseId, onClose, onNext, onPrev, hasNext, hasPrev }) {
//     const [lesson, setLesson] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         if (!isOpen || !lessonId) return;
//         const fetchLesson = async () => {
//             setLoading(true);
//             try {
//                 const res = await lessonAPI.getById(lessonId);
//                 setLesson(res.data?.data || res.data);
//             } catch (err) { console.error(err); }
//             finally { setLoading(false); }
//         };
//         fetchLesson();
//     }, [lessonId, isOpen]);

//     if (!isOpen) return null;

//     return (
//         <AnimatePresence>
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//                 className="fixed inset-0 z-100 bg-slate-950 flex flex-col h-screen overflow-hidden"
//             >
//                 {/* Header */}
//                 <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900">
//                     <div className="flex items-center space-x-4">
//                         <button onClick={onClose} className="p-2 text-white hover:bg-white/10 rounded-full"><FiX size={24} /></button>
//                         <h2 className="text-white font-bold truncate max-w-md">{lesson?.title || "Loading..."}</h2>
//                     </div>
//                     {lesson && <CompleteButton lesson={lesson} courseId={courseId} />}
//                 </div>

//                 {/* Content Area */}
//                 <div className="flex-1 flex items-center justify-center p-4">
//                     {loading ? (
//                         <div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full" />
//                     ) : (
//                         <div className="w-full h-full max-w-5xl">
//                             {lesson.type === 'video' ? (
//                                 <video
//                                     key={lesson._id}
//                                     src={lesson.video?.url}
//                                     controls autoPlay muted className="w-full max-h-full rounded-xl" />
//                             ) : (
//                                 <div className="bg-white p-8 rounded-xl h-full overflow-y-auto text-slate-800"
//                                     dangerouslySetInnerHTML={{ __html: lesson.content }} />
//                             )}
//                         </div>
//                     )}
//                 </div>

//                 {/* Footer Navigation */}
//                 <div className="p-4 bg-slate-900 border-t border-white/10 flex justify-center gap-4">
//                     <button onClick={onPrev} disabled={!hasPrev} className="px-6 py-2 bg-white/10 text-white rounded-lg disabled:opacity-30">
//                         <FiChevronLeft className="inline mr-2" /> Previous
//                     </button>
//                     <button onClick={onNext} disabled={!hasNext} className="px-6 py-2 bg-primary-500 text-white rounded-lg disabled:opacity-30">
//                         Next <FiChevronRight className="inline ml-2" />
//                     </button>
//                 </div>
//             </motion.div>
//         </AnimatePresence>
//     );
// }