'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { instructorAPI } from '@/lib/api';
import { AiFillStar, AiOutlineGlobal } from 'react-icons/ai';
import { FaLinkedin, FaGithub, FaTwitter } from 'react-icons/fa';
import CourseCard from '@/components/courses/CourseCard';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function InstructorPublicProfile() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await instructorAPI.getPublicProfile(id);
                setData(res.data.data);
            } catch (err) {
                console.error("Error loading profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <ProfileSkeleton />;
    if (!data) return <div className="text-center py-20">Instructor not found.</div>;

    const { instructor, stats, courses } = data;
    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-20">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-12">

                        {/* Left Column: Info & Socials */}
                        <div className="lg:col-span-1">
                            <div className="glass-card p-8 text-center sticky top-32">
                                <div className="relative w-40 h-40 mx-auto mb-6">
                                    <Image
                                        src={instructor.avatar.url || '/default-avatar.jpg'}
                                        alt={instructor.name}
                                        width={150}
                                        height={150}
                                        priority
                                        className="rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-xl"
                                    />
                                </div>
                                <h1 className="text-2xl font-bold mb-2">{instructor.name}</h1>

                                <p className="text-primary-600 font-medium mb-6">{instructor.headline}</p>

                                {/* Social Links */}
                                <div className="flex justify-center gap-4 mb-8">
                                    {instructor.website && <a href={instructor.website} target="_blank"><AiOutlineGlobal className="w-6 h-6 hover:text-primary-500" /></a>}
                                    {instructor.linkedin && <a href={instructor.linkedin} target="_blank"><FaLinkedin className="w-6 h-6 hover:text-blue-600" /></a>}
                                    {instructor.github && <a href={instructor.github} target="_blank"><FaGithub className="w-6 h-6 hover:text-gray-400" /></a>}
                                    {instructor.twitter && <a href={instructor.twitter} target="_blank"><FaTwitter className="w-6 h-6 hover:text-sky-400" /></a>}
                                </div>

                                {/* Stats Summary */}
                                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <div>
                                        <p className="text-2xl font-bold">{stats.totalStudents}</p>
                                        <p className="text-xs uppercase text-gray-500 font-bold">Students</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stats.totalReviews}</p>
                                        <p className="text-xs uppercase text-gray-500 font-bold">Reviews</p>
                                    </div>
                                    <div className='flex items-center justify-center text-2xl font-bold'>
                                        <span>{stats.avgRating}</span>
                                        <AiFillStar className="text-yellow-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Bio & Courses */}
                        <div className="lg:col-span-2">
                            <section className="mb-12">
                                <h2 className="text-2xl font-bold mb-4">About me</h2>
                                <div className=" text-gray-800 dark:text-gray-400 leading-relaxed">
                                    {instructor.bio || "No biography provided."}
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-6">Published Courses ({courses.length})</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {courses.map(course => (
                                        <CourseCard key={course._id} course={course} />
                                    ))}
                                </div>
                            </section>
                        </div>

                    </div>
                </div>
            </div>
            <Footer/>
        </>
    );
}

function ProfileSkeleton() {
    return <div className="container mx-auto px-4 pt-32 animate-pulse">
        <div className="grid lg:grid-cols-3 gap-12">
            <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
            <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-800 w-1/4 rounded"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
        </div>
    </div>;
}