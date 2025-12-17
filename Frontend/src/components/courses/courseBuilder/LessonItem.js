
import { FiEdit, FiTrash2, FiVideo } from 'react-icons/fi';

export default function LessonItem({ lesson, index, onEdit }) {
    // Determine icon based on lesson type (video, text, quiz, etc.)
    const icon = lesson.type === 'video' ? <FiVideo className="w-4 h-4 text-primary-500" /> : <FiEdit className="w-4 h-4 text-secondary-500" />;

    return (
        // Draggable item wrapper
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">{index + 1}.</span>
                {icon}
                <span className="font-medium">{lesson.title}</span>
                <span className="text-xs text-gray-400">({lesson.duration || '0m'})</span>
            </div>
            
            <div className="flex items-center space-x-2">
                {/* You can show a status chip here (Draft/Published) */}
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    lesson.isFree ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                    {lesson.isFree ? 'Free Preview' : 'Paid Content'}
                </span>
                <button
                    onClick={onEdit}
                    className="p-1 text-gray-500 hover:text-primary-500 transition"
                >
                    <FiEdit className="w-5 h-5" />
                </button>
                <button
                    // ... deletion handler
                    className="p-1 text-gray-500 hover:text-red-500 transition"
                >
                    <FiTrash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}