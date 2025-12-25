import Image from 'next/image';
import Link from 'next/link';


export default function CourseInstructor({ instructor }) {
    if (!instructor) return null;
    return (
        <div className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-6">Instructor</h2>

            <div className="flex items-start space-x-4 mb-6">
                {/* Avatar */}
                <Link href={`/instructor/${instructor._id}`} className="shrink-0">
                    {instructor.avatar ? (
                        <Image
                            src={instructor.avatar.url }
                            alt={instructor.name}
                            width={80}
                            height={80}
                            className="rounded-full ring-4 ring-primary-500/20"
                        />
                    ) : (
                        <div className="w-20 h-20 bg-linear-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold ring-4 ring-primary-500/20">
                            {instructor.name?.charAt(0) || 'I'}
                        </div>
                    )}
                </Link>

                {/* Info */}
                <div className="flex-1">
                    <Link href={`/instructor/${instructor._id}`} className="hover:text-primary-500 transition-colors flex items-center ">
                        <h3 className="text-xl font-bold mb-1 underline">{instructor.name} </h3>
                    </Link>
                    {instructor.headline && (
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{instructor.headline}</p>
                    )}

                </div>
            </div>

            {/* Bio */}
            {instructor.bio && (
                <div className="my-2 py-5">
                    <p className="text-gray-800 dark:text-gray-300 leading-relaxed">
                        {instructor.bio}
                    </p>
                </div>
            )}
        </div>
    );
}