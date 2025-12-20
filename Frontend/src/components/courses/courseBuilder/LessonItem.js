import { FiEdit, FiTrash2, FiVideo, FiFileText, FiPaperclip, FiFile } from 'react-icons/fi';

export default function LessonItem({ lesson, index, onEdit }) {

    // Icon based on type
    let TypeIcon = <FiVideo className="w-4 h-4 text-primary-500" />;
    if (lesson.type === 'raw') TypeIcon = <FiFileText className="w-4 h-4 text-secondary-500" />;
    if (lesson.type === 'document') TypeIcon = <FiFile className="w-4 h-4 text-orange-500" />; 

    // Check for resources
    const hasResources = lesson.resources && lesson.resources.length > 0;

    return (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border border-gray-100 dark:border-gray-700 group hover:border-primary-200 transition-colors">

            <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-400 w-5">{index + 1}.</span>

                {TypeIcon}

                <div className="flex flex-col">
                    <span className="font-medium text-sm text-gray-700 dark:text-gray-200">
                        {lesson.title}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{lesson.duration ? `${lesson.duration}m` : '0m'}</span>
                        {/* Resource Indicator */}
                        {hasResources && (
                            <span className="flex items-center gap-1 text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 rounded">
                                <FiPaperclip size={10} />
                                {lesson.resources.length}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {lesson.isPreview && (
                    <span className="text-[10px] uppercase font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        Free
                    </span>
                )}
                <button onClick={onEdit} className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded">
                    <FiEdit className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                    <FiTrash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}