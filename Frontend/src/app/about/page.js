import Header from '@/components/layout/Header';
import Link from 'next/link';
import React from 'react';
const StatCard = ({ value, label, color }) => (
    <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition hover:shadow-2xl">
        <p className={`text-4xl font-extrabold ${color}`}>{value}</p>
        <p className="mt-2 text-lg font-medium text-gray-600 dark:text-gray-400">{label}</p>
    </div>
);

const PillarCard = ({ title, description, icon }) => (
    <div className="p-6 border border-gray-100 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 shadow-sm transition hover:scale-[1.02]">
        <div className="flex items-center space-x-3 mb-4">
            <span className="text-3xl text-blue-600 dark:text-blue-400">{icon}</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
);

export default function AboutPage() {
    const stats = [
        { value: '500K+', label: 'Enrolled Users', color: 'text-blue-600' },
        { value: '10,000+', label: 'Hours of Video Content', color: 'text-indigo-600' },
        { value: '75%', label: 'Career Advancement Rate', color: 'text-teal-600' },
        { value: '90%', label: 'Average Learner Satisfaction', color: 'text-purple-600' },
    ];

    const pillars = [
        {
            icon: '🎓',
            title: 'Expert-Led Content',
            description: 'Learn from verified instructors who are active leaders in their fields. We ensure every course delivers industry-relevant knowledge.',
        },
        {
            icon: '⏰',
            title: 'Built for Flexibility',
            description: 'With self-paced courses and 24/7 access, SkillUp fits into your busy life. Access lessons anytime, anywhere, on any device.',
        },
        {
            icon: '🚀',
            title: 'Measurable Results',
            description: 'Our curriculum includes practical labs, capstone projects, and accredited certifications to give you the credentials employers demand.',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            <Header />
            {/*  Hero Section */}
            <section className="bg-gray-100 dark:bg-slate-800 py-24 text-center">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-black leading-tight">
                        The Next Chapter in Learning Starts Here
                    </h1>
                    <p className="text-xl md:text-2xl text-black">
                        At <span className="font-bold">SkillUp</span>, we envision a world where anyone, anywhere, has the opportunity to master in-demand skills and transform their career.
                    </p>
                </div>
            </section>

            <section className="container mx-auto px-4 py-16 max-w-5xl">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-900 dark:text-white">
                    Our Mission Is Bridging the Skill Gap
                </h2>
                <p className="text-center text-xl text-gray-600 dark:text-gray-300 mx-auto max-w-3xl">
                    Our goal is to democratize high-quality education by connecting global experts with ambitious learners. We strive to offer a curated catalog of courses that provide job-ready skills and measurable career outcomes.
                </p>
            </section>

            {/* Why Choose us */}
            <section className="bg-gray-100 dark:bg-gray-800 py-16">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                        Why Choose SkillUp?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {pillars.map((pillar, index) => (
                            <PillarCard key={index} {...pillar} />
                        ))}
                    </div>
                </div>
            </section>

            {/* dummy stats */}
            <section className="py-20">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                        SkillUp By The Numbers
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <StatCard key={index} {...stat} />
                        ))}
                    </div>
                </div>
            </section>

           
            <section className="bg-blue-600 dark:bg-blue-800 py-16 text-center">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                        Ready to unlock your potential?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join the fastest-growing learning community built with Next.js and start mastering the skills that matter.
                    </p>
                    <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
                        <Link href="/courses" className="px-8 py-3 text-lg font-semibold rounded-full bg-white text-blue-600 hover:bg-gray-100 transition shadow-lg">
                            Browse All Courses
                        </Link>
                        <Link href="/teach" className="px-8 py-3 text-lg font-semibold rounded-full border border-white text-white hover:bg-blue-700 transition shadow-lg">
                            Become an Instructor
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}