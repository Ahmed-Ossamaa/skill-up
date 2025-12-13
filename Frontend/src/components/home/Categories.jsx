'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { categoryAPI } from '@/lib/api';

import {
    HiOutlineCode,
    HiOutlineChartBar,
    HiOutlineCamera,
    HiOutlineMusicNote,
    HiOutlineNewspaper,
    HiOutlineCalculator,
    HiOutlineGlobeAlt
} from 'react-icons/hi';
import { HiOutlinePaintBrush } from 'react-icons/hi2';

const MAIN_CATEGORIES = {
    Programming: HiOutlineCode,
    Design: HiOutlinePaintBrush,
    Business: HiOutlineChartBar,
    Photography: HiOutlineCamera,
    Music: HiOutlineMusicNote,
    Marketing: HiOutlineNewspaper,
    Mathematics: HiOutlineCalculator,
    Languages: HiOutlineGlobeAlt,
};

const COLORS = [
    'from-blue-500 to-cyan-500',
    'from-pink-500 to-rose-500',
    'from-emerald-500 to-teal-500',
    'from-purple-500 to-violet-500',
    'from-orange-500 to-amber-500',
    'from-red-500 to-pink-500',
    'from-indigo-500 to-blue-500',
    'from-green-500 to-emerald-500'
];

export default function Categories() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryAPI.getAll();
                const data = response.data.data;

                // Filter only parent categories
                const parentCategories = data.filter(cat => cat.parent === null);

                // filter  main categories from the response
                const filtered = parentCategories
                    .filter(cat => MAIN_CATEGORIES[cat.name])
                    .map((cat, index) => ({
                        ...cat,
                        id: cat._id,
                        icon: MAIN_CATEGORIES[cat.name],
                        color: COLORS[index % COLORS.length],
                        count: cat.courseCount || 0
                    }));

                setCategories(filtered);

            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };

        fetchCategories();
    }, []);

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
                    {categories.map((category, index) => {
                        const Icon = category.icon;
                        return (
                            <Link
                                key={category.id}
                                href={`/courses?category=${category.id}`}
                                className="group"
                            >
                                <div className="glass-card p-6 hover-lift cursor-pointer animate-fade-in">
                                    <div className={`w-16 h-16 bg-linear-to-br ${category.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>

                                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-500">
                                        {category.name}
                                    </h3>

                                    {/* <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {category.count} courses
                                    </p> */}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="text-center mt-12">
                    <Link href="/courses" className="inline-block px-8 py-4 glass-button text-lg font-semibold hover:scale-105">
                        View All Categories
                    </Link>
                </div>
            </div>
        </section>
    );
}
