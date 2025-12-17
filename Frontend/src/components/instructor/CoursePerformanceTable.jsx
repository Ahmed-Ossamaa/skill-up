"use client";

import React from 'react';
import { useInstructorStore } from '@/store/instructorStore';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { FiBook } from 'react-icons/fi';


export default function CoursePerformanceTable() {
    const { coursePerformance, loading } = useInstructorStore();

    if (loading) return <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl" />)}
    </div>;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                    <tr className="text-slate-400 text-xs uppercase tracking-widest">
                        <th className="px-4 py-2 font-black">Course</th>
                        <th className="px-4 py-2 font-black">Students</th>
                        <th className="px-4 py-2 font-black text-right">Revenue</th>
                        <th className="px-4 py-2 font-black text-right">Last Enrollment</th>
                    </tr>
                </thead>
                <tbody>
                    {coursePerformance.map((course) => (
                        <tr key={course._id} className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden group hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-4 rounded-l-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                                        <Image
                                            src={course.thumbnail?.url || '/placeholder-course.png'}
                                            alt={course.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <span className="font-bold text-slate-800 line-clamp-1">{course.title}</span>
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                                    {course.studentCount} Students
                                </span>
                            </td>
                            <td className="px-4 py-4 text-right font-black text-slate-700">
                                ${course.revenue?.toLocaleString()}
                            </td>
                            <td className="px-4 py-4 text-right text-sm text-slate-500 rounded-r-2xl">
                                {course.lastEnrollment ? formatDate(new Date(course.lastEnrollment)) : 'No enrollments'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}