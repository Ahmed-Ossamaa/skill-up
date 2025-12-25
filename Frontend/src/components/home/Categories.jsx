'use client';

import Link from 'next/link';
import {
    HiOutlineCode, HiOutlineChartBar, HiOutlineMusicNote,
    HiOutlineNewspaper, HiOutlineCalculator, HiOutlineGlobeAlt
} from 'react-icons/hi';
import { HiOutlinePaintBrush } from 'react-icons/hi2';
import { FaLaptop } from "react-icons/fa";
import { AiOutlineArrowRight } from 'react-icons/ai';

const MAIN_CATEGORIES_CONFIG = {
    Programming: { icon: HiOutlineCode, color: 'from-blue-500 to-cyan-500' },
    Design: { icon: HiOutlinePaintBrush, color: 'from-pink-500 to-rose-500' },
    Business: { icon: HiOutlineChartBar, color: 'from-emerald-500 to-teal-500' },
    "IT & Software": { icon: FaLaptop, color: 'from-purple-500 to-violet-500' },
    Art: { icon: HiOutlineMusicNote, color: 'from-orange-500 to-amber-500' },
    Marketing: { icon: HiOutlineNewspaper, color: 'from-red-500 to-pink-500' },
    Mathematics: { icon: HiOutlineCalculator, color: 'from-indigo-500 to-blue-500' },
    Languages: { icon: HiOutlineGlobeAlt, color: 'from-green-500 to-emerald-500' },
};


export default function Categories({ categories = [] }) {
    const processedCategories = categories.map((cat) => {
        const config = MAIN_CATEGORIES_CONFIG[cat.name] || { icon: FaLaptop, color: 'from-gray-500 to-gray-600' };
        return {
            ...cat,
            icon: config.icon,
            color: config.color
        };
    });

    return (
        <section className="py-20 relative">
            <div className="container mx-auto px-4">

                <div className="text-center mb-16 animate-slide-up">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Explore Top <span className="gradient-text">Categories</span>
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Choose from thousands of courses in various categories and start learning today
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {processedCategories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <Link
                                key={category.id}
                                href={`/courses?category=${category.id}`}
                                className="group "
                            >
                                <div className="glass-card p-6 flex flex-col items-center hover-lift cursor-pointer ">
                                    <div className={`w-16 h-16 bg-linear-to-br ${category.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>

                                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-500">
                                        {category.name}
                                    </h3>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="text-center mt-12">
                    <Link href="/courses" className="inline-flex items-center  px-8 py-4 glass-button text-lg font-semibold ">
                        View All Categories
                        <AiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />

                    </Link>
                </div>
            </div>
        </section>
    );
}
