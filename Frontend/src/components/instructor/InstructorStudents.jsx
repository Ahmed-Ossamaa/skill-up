"use client";

import React, { useEffect, useState, useMemo } from "react";
import {instructorAPI} from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
    HiOutlineUserGroup,
    HiOutlineMail,
    HiChevronDown,
    HiOutlineBookOpen,
    HiOutlineSearch
} from "react-icons/hi";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

export default function InstructorStudents() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const { data } = await instructorAPI.getAllInstructorStudents("/instructor/students");
                setCourses(data.data);
                if (data.data.length > 0) setExpandedId(data.data[0]._id);
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to load students");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Filter logic: Search through student names and emails across all courses
    const filteredCourses = useMemo(() => {
        if (!searchQuery.trim()) return courses;

        return courses.map(course => ({
            ...course,
            enrolledStudents: course.enrolledStudents.filter(student =>
                student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.email.toLowerCase().includes(searchQuery.toLowerCase())
            )
        })).filter(course => course.enrolledStudents.length > 0);
    }, [searchQuery, courses]);

    if (loading) {
        return <div className="flex justify-center p-20 text-slate-500">Loading student directory...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Search Bar Section */}
            <div className="relative group max-w-md">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <HiOutlineSearch size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all text-slate-700 placeholder:text-slate-400 shadow-sm"
                />
            </div>

            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredCourses.length > 0 ? (
                        filteredCourses.map((course) => (
                            <motion.div
                                layout
                                key={course._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                            >
                                {/* Header Toggle */}
                                <button
                                    onClick={() => setExpandedId(expandedId === course._id ? null : course._id)}
                                    className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                            <HiOutlineBookOpen size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 leading-tight">{course.courseTitle}</h3>
                                            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                <HiOutlineUserGroup /> {course.enrolledStudents.length} {searchQuery ? 'Matches' : 'Students'}
                                            </p>
                                        </div>
                                    </div>
                                    <motion.div animate={{ rotate: expandedId === course._id ? 180 : 0 }}>
                                        <HiChevronDown className="text-slate-400" size={24} />
                                    </motion.div>
                                </button>

                                {/* Table Body */}
                                <AnimatePresence>
                                    {expandedId === course._id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-6 overflow-x-auto">
                                                <table className="w-full min-w-[600px]">
                                                    <thead>
                                                        <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                                            <th className="pb-3 px-2">Student</th>
                                                            <th className="pb-3 px-2 text-center">Progress</th>
                                                            <th className="pb-3 px-2">Joined</th>
                                                            <th className="pb-3 px-2 text-right">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50">
                                                        {course.enrolledStudents.map((student) => (
                                                            <tr key={student.enrollmentId} className="group hover:bg-slate-50/50">
                                                                <td className="py-4 px-2">
                                                                    <div className="flex flex-col">
                                                                        <span className="font-bold text-slate-700">{student.name}</span>
                                                                        <span className="text-xs text-slate-400">{student.email}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="py-4 px-2">
                                                                    <div className="flex items-center gap-3 justify-center">
                                                                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                            <div
                                                                                className={clsx("h-full", student.progress === 100 ? "bg-emerald-500" : "bg-indigo-500")}
                                                                                style={{ width: `${student.progress}%` }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-xs font-black text-slate-600">{Math.round(student.progress)}%</span>
                                                                    </div>
                                                                </td>
                                                                <td className="py-4 px-2 text-slate-500 text-sm">
                                                                    {formatDate(student?.enrolledAt) || "N/A"}
                                                                </td>
                                                                <td className="py-4 px-2 text-right">
                                                                    <a href={`mailto:${student.email}`} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors inline-flex">
                                                                        <HiOutlineMail size={20} />
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200"
                        >
                            <p className="text-slate-500 font-medium">No students found matching <span className="font-bold text-red-600">({searchQuery})</span></p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}