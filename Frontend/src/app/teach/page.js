'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUploadCloud, FiFileText, FiCheckCircle } from 'react-icons/fi';
import { instructorAPI } from '@/lib/api';
import useAuthStore from '@/store/authStore';
import { toast } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function BecomeInstructor() {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [experience, setExperience] = useState('');
    const [files, setFiles] = useState({
        nationalId: null,
        certificate: null,
        resume: null
    });

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setFiles(prev => ({ ...prev, [field]: file }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            //FormData
            const formData = new FormData();
            formData.append('experience', experience);
            formData.append('nationalId', files.nationalId);
            formData.append('certificate', files.certificate);
            formData.append('resume', files.resume);

            await instructorAPI.requestInstructor(formData);

            toast.success("Request Submitted!");
            router.push('/');

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Submission failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            {!isAuthenticated ? (
                <div className="mt-25 text-center flex justify-center bg-red-200 py-8">
                    <p className="text-gray-500 ">You must be logged in to submit a request.</p>
                </div>
            ) :

                <div className="min-h-screen mt-30 pb-12 px-4 flex justify-center animate-fade-in">
                    <div className="glass-card shadow-md! shadow-secondary-200! w-full max-w-5xl p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold mb-2">Become an Instructor</h1>
                            <p className="text-gray-500">Submit your documents to start teaching on Skill-Up.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* EXP*/}
                            <div>
                                <label className="block text-sm font-medium mb-2">Teaching Experience</label>
                                <textarea
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    rows="4"
                                    className="w-full p-4 outline-none border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-0"
                                    placeholder="Tell us about your background, expertise, and what you plan to teach..."
                                    required
                                />
                            </div>

                            {/* File Uploads */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {['nationalId', 'certificate', 'resume'].map((field) => (
                                    <div key={field} className="relative group">
                                        <label className={`
                                    flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all
                                    ${files[field]
                                                ? 'border-green-500 bg-green-50 '
                                                : 'border-gray-300 hover:border-primary-500 hover:bg-gray-50'
                                            }
                                `}>
                                            <input
                                                type="file"
                                                onChange={(e) => handleFileChange(e, field)}
                                                className="hidden"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                required
                                            />

                                            {files[field] ? (
                                                <>
                                                    <FiCheckCircle className="w-8 h-8 text-green-500 mb-2" />
                                                    <span className="text-xs text-green-600 font-medium truncate w-full text-center">
                                                        {files[field].name}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <FiUploadCloud className="w-8 h-8 text-gray-400 mb-2 group-hover:text-primary-500" />
                                                    <span className="text-sm font-medium capitalize">Upload {field.replace(/([A-Z])/g, ' $1')}</span>
                                                    <span className="text-xs text-gray-400 mt-1">PDF or IMG</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div className='flex justify-center'>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-100 py-4 bg-linear-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-bold text-lg cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Uploading Documents...' : 'Submit Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            }
            <Footer />
        </>
    );
}