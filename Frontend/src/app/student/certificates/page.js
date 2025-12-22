'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import useAuthStore from '@/store/authStore';
import { enrollmentAPI } from '@/lib/api';
import { FiAward, FiDownload, FiExternalLink } from 'react-icons/fi';
import { formatDate } from '@/lib/utils';

export default function CertificatesPage() {
    const { user, isReady } = useAuthStore();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                // Get all enrollments
                const { data: response } = await enrollmentAPI.getMyEnrollments();
                //Completed enrollments 100%
                const completed = response.data.filter(e => e.progress?.percentage === 100);
                setCertificates(completed);
            } catch (error) {
                console.error('Error fetching certificates:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isReady && user) {
            fetchCertificates();
        }
    }, [isReady, user]);

    return (
        <DashboardLayout role="student">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase mb-3">My Certificates</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    View and download your credentials.
                </p>
                <hr className="mt-2 border-gray-200 dark:border-gray-700" />
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
            ) : certificates.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((cert) => (
                        <div key={cert._id} className="glass-card p-0 overflow-hidden group hover:shadow-xl transition-all">
                            {/* Certificate Preview */}
                            <div className="h-48 bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 relative p-6 flex flex-col items-center justify-center border-b border-gray-100 dark:border-gray-800">
                                <div className="absolute inset-0 border-8 border-double border-gray-300 dark:border-gray-700 m-3 opacity-50"></div>
                                <FiAward className="w-12 h-12 text-primary-500 mb-2" />
                                <h3 className="font-serif text-lg font-bold text-center z-10">{cert.course.title}</h3>
                                <p className="text-xs text-gray-500 mt-1 z-10">Completed on {formatDate(cert.certificate?.issuedAt)}</p>
                            </div>

                            {/* Actions */}
                            <div className="p-4 bg-white dark:bg-slate-950">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-mono text-gray-400">
                                        {cert.certificate?.certificateId || 'ID: PENDING'}
                                    </span>
                                </div>
                                <Link 
                                    href={`/student/certificates/${cert.course._id}`}
                                    className="btn-primary w-full flex items-center justify-center gap-2 hover:text-primary-500"
                                >
                                    <FiExternalLink /> View Certificate
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // ..........Empty state.............
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiAward className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">No certificates yet</h3>
                    <p className="text-gray-500 mb-6">Complete a course to earn your first certificate!</p>
                    <Link href="/student/learning" className="text-primary-500 font-medium hover:underline">
                        Go to My Learning
                    </Link>
                </div>
            )}
        </DashboardLayout>
    );
}