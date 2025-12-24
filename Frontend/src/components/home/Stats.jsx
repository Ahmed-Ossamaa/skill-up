'use client';

import { HiOutlineUsers, HiOutlineAcademicCap, HiOutlineStar, HiOutlineGlobeAlt } from 'react-icons/hi';
import { useState, useEffect, useRef } from 'react';

export default function Stats() {
    const stats = [
        {
            icon: HiOutlineUsers,
            value: 50000,
            suffix: '+',
            label: 'Active Students',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: HiOutlineAcademicCap,
            value: 10000,
            suffix: '+',
            label: 'Online Courses',
            color: 'from-purple-500 to-pink-500'
        },
        {
            icon: HiOutlineStar,
            value: 98,
            suffix: '%',
            label: 'Satisfaction Rate',
            color: 'from-yellow-500 to-orange-500'
        },
        {
            icon: HiOutlineGlobeAlt,
            value: 150,
            suffix: '+',
            label: 'Countries Reached',
            color: 'from-green-500 to-emerald-500'
        },
    ];

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

                {/* Stats Grid */}
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
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const cardRef = useRef(null);
    const Icon = stat.icon;

    useEffect(() => {
        const cardElement = cardRef.current; // Store the current value of cardRef.current

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (cardElement) {
            observer.observe(cardElement);
        }

        return () => {
            if (cardElement) {
                observer.unobserve(cardElement);
            }
        };
    }, []);

    useEffect(() => {
        if (isVisible) {
            let start = 0;
            const end = stat.value;
            const duration = 2000;
            const increment = end / (duration / 16);

            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setCount(end);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(start));
                }
            }, 16);

            return () => clearInterval(timer);
        }
    }, [isVisible, stat.value]);

    return (
        <div
            ref={cardRef}
            className="glass-card p-8 text-center hover-lift "
            style={{ animationDelay: `${index * 0.1}s` }}
        >   
            {/* Icon */}
            <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 bg-linear-to-br ${stat.color} rounded-2xl flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                </div>
            </div>

            {/* Value */}
            <div className="text-4xl md:text-5xl font-bold mb-2 gradient-text">
                {count.toLocaleString()}{stat.suffix}
            </div>

            {/* Label */}
            <div className="text-gray-600 dark:text-gray-400 font-medium">
                {stat.label}
            </div>
        </div>
    );
}