import CourseCard from './CourseCard';

export default function CourseGrid({ courses, loading }) {
    console.log(courses);
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                    <div key={i} className="glass-card overflow-hidden animate-pulse">
                        <div className="aspect-video bg-gray-300 dark:bg-gray-700"></div>
                        <div className="p-5 space-y-3">
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="glass-card p-12 max-w-md mx-auto">
                    <div className="w-20 h-20 bg-linear-to-br from-gray-300 to-gray-400 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">No Courses Found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        We couldnt find any courses matching your criteria. Try adjusting your filters or search terms.
                    </p>
                    <button
                        onClick={() => window.location.href = '/courses'}
                        className="px-6 py-3 bg-linear-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                        View All Courses
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
                <div key={course._id || course.id} style={{ animationDelay: `${index * 0.05}s` }}>
                    <CourseCard course={course} />
                </div>
            ))}
        </div>
    );
}