'use client';

import { useState, useEffect, useRef } from 'react';
import { HiOutlineUsers, HiOutlineAcademicCap, HiOutlineStar, HiOutlineGlobeAlt } from 'react-icons/hi';
import { useInView, animate, motion } from 'framer-motion';

const ICON_MAP = {
    users: HiOutlineUsers,
    courses: HiOutlineAcademicCap,
    star: HiOutlineStar,
    globe: HiOutlineGlobeAlt
};

export default function Stats({ stats = [] }) {
    if (!stats.length) return null;

    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-linear-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800"></div>
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Our <span className="gradient-text">Impact</span> in Numbers
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Join thousands of learners from around the world transforming their careers
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <StatCard key={index} stat={stat} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function StatCard({ stat, index }) {
    const Icon = ICON_MAP[stat.iconKey] || HiOutlineUsers;
    const cardRef = useRef(null);
    const counterRef = useRef(null);
    const isInView = useInView(cardRef, { once: true, margin: "-100px" });

    useEffect(() => {
        if (isInView) {
            const controls = animate(0, stat.value, {
                duration: 2,
                ease: "easeOut",
                onUpdate: (value) => {
                    if (counterRef.current) {
                        counterRef.current.textContent = Math.floor(value).toLocaleString();
                    }
                }
            });

            return () => controls.stop();
        }
    }, [isInView, stat.value]);

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="glass-card p-8 text-center hover-lift"
        >
            <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 bg-linear-to-br ${stat.color} rounded-2xl flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                </div>
            </div>

            <div className="text-4xl md:text-5xl font-bold mb-2 gradient-text flex justify-center items-center">
                <span ref={counterRef}>0</span>
                <span>{stat.suffix}</span>
            </div>

            <div className="text-gray-600 dark:text-gray-400 font-medium">
                {stat.label}
            </div>
        </motion.div>
    );
}