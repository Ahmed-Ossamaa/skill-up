"use client";

import React, { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import RevenueChart from "@/components/instructor/RevenueChart";
import StatsCard from '@/components/dashboard/StatsCard';
import { useInstructorStore } from "@/store/instructorStore";
import { HiOutlineCash, HiOutlineUsers, HiOutlineStar, HiOutlineBookOpen } from "react-icons/hi";
import { motion } from "framer-motion";
import CoursePerformanceTable from "@/components/instructor/CoursePerformanceTable";

export default function AnalyticsPage() {
    const { stats, fetchDashboardData, loading } = useInstructorStore();

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const statCards = [
        {
            label: "Total Revenue",
            value: loading ? "..." : `$${stats.revenue?.toLocaleString()}`,
            icon: HiOutlineCash,
            color: "success",
            change: stats.revenueTrend,
            trend: stats.revenueTrendDir
        },
        {
            label: "Total Students",
            value: loading ? "..." : stats.students?.toLocaleString(),
            icon: HiOutlineUsers,
            color: "secondary",
            change: stats.studentTrend,
            trend: stats.studentTrendDir
        },
        {
            label: "Avg. Rating",
            value: loading ? "..." : stats.rating,
            icon: HiOutlineStar,
            color: "warning",
        },
        {
            label: "Active Courses",
            value: loading ? "..." : stats.courses,
            icon: HiOutlineBookOpen,
            color: "info"
        },
    ];

    return (
        <DashboardLayout role="instructor">

                <header className="mb-10 max-w-6xl mx-auto">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
                        Analytics Hub
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">
                        Real-time performance tracking and revenue growth.
                    </p>
                </header>

                {/* Grid of Dynamic Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 max-w-6xl mx-auto">
                    {statCards.map((card, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="h-full"
                        >
                            <StatsCard {...card} />
                        </motion.div>
                    ))}
                </div>

                {/* Growth Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="max-w-6xl mx-auto bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Revenue Stream</h3>
                            <p className="text-slate-400 text-sm font-medium">Monthly earnings visualization</p>
                        </div>
                        <div className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest">
                            Live Data
                        </div>
                    </div>
                    <RevenueChart />
                </motion.div>
                {/* Course Performance Table */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="max-w-6xl mx-auto mt-10 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm"
                >
                    <div className="mb-8">
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Course Performance</h3>
                        <p className="text-slate-400 text-sm font-medium">Detailed breakdown per course</p>
                    </div>
                    <CoursePerformanceTable />
                </motion.div>

        </DashboardLayout>
    );
}