'use client';

import { FiCheck } from 'react-icons/fi';

export default function CourseOverview({ description, learningOutcomes, requirements, targetAudience }) {
    return (
        <div className="space-y-8">
            {/* Description */}
            <div className="glass-card p-6">
                <h2 className="text-2xl font-bold mb-4">About This Course</h2>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                        {description}
                    </p>
                </div>
            </div>

            {/* Learning Outcomes */}
            {learningOutcomes && learningOutcomes.length > 0 && (
                <div className="glass-card p-6">
                    <h2 className="text-2xl font-bold mb-4">What You will Learn</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {learningOutcomes.map((outcome, index) => (
                            <div key={index} className="flex items-start space-x-3">
                                <div className="shrink-0 mt-1">
                                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                                        <FiCheck className="w-3 h-3 text-green-500" />
                                    </div>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300">{outcome}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Requirements */}
            {requirements && requirements.length > 0 && (
                <div className="glass-card p-6">
                    <h2 className="text-2xl font-bold mb-4">Requirements</h2>
                    <ul className="space-y-2">
                        {requirements.map((req, index) => (
                            <li key={index} className="flex items-start space-x-3 text-gray-600 dark:text-gray-300">
                                <span className="text-primary-500 mt-1">•</span>
                                <span>{req}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Target Audience */}
            {targetAudience && targetAudience.length > 0 && (
                <div className="glass-card p-6">
                    <h2 className="text-2xl font-bold mb-4">Who This Course Is For</h2>
                    <ul className="space-y-2">
                        {targetAudience.map((audience, index) => (
                            <li key={index} className="flex items-start space-x-3 text-gray-600 dark:text-gray-300">
                                <span className="text-secondary-500 mt-1">•</span>
                                <span>{audience}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}