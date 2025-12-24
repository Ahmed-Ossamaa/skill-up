'use client';

import { useState } from 'react';
import { FiSearch, FiPlay } from 'react-icons/fi';
import { GiPartyPopper  } from 'react-icons/gi';

export default function Hero() {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/courses?search=${encodeURIComponent(searchQuery)}`;
        }
    };


    return (
        <section className="relative min-h-screen flex items-center overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/30 rounded-full blur-3xl"></div>
            <div className="container mx-auto px-4 relative z-10 pt-32 pb-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="text-center lg:text-left animate-slide-right">
                        <div className="inline-block mb-4">
                            <span className="glass-button text-sm">
                                <GiPartyPopper size={20} className="inline-block mr-2 text-secondary-800 " />
                                Join 50,000+ students learning online
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                            Learn New Skills
                            <span className="block gradient-text">Anytime, Anywhere</span>
                        </h1>

                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
                            Discover thousands of courses taught by expert instructors.
                            Start learning today and transform your career.
                        </p>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="mb-8">
                            <div className="relative max-w-2xl mx-auto lg:mx-0">
                                <input
                                    type="text"
                                    placeholder="What do you want to learn?"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full glass-card pl-14 pr-32 py-5 text-lg focus-ring"
                                />
                                <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-linear-to-r from-primary-500 to-secondary-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                                >
                                    Search
                                </button>
                            </div>
                        </form>


                    </div>

                    {/* Right Content - Illustration */}
                    <div className="relative  hidden lg:block" >
                        <div className="relative">
                            {/* Main Card */}
                            <div className="glass-card p-8 hover-lift">
                                <div className="aspect-video bg-linear-to-br from-primary-500 to-secondary-500 rounded-xl mb-6 flex items-center justify-center">

                                    <iframe
                                        src="https://player.cloudinary.com/embed/?cloud_name=dk7qbcles&public_id=4495519-uhd_3840_2160_25fps_3_mxbzcr&profile=cld-default"
                                        width="640"
                                        height="360"
                                        allow="autoplay;  encrypted-media; picture-in-picture"
                                        title="Video showing someone learning a course"
                                        loading='lazy'

                                    ></iframe>
                                </div>

                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -top-6 -right-6 glass-card p-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-10 h-10 bg-linear-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                                        ✓
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold">Course Completed</div>
                                        <div className="text-xs text-gray-500">+200 XP</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}