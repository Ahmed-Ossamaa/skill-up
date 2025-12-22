'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { enrollmentAPI } from '@/lib/api';
import { FiDownload, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
// import { Great_Vibes } from 'next/font/google';


// const greatVibesLocal = Great_Vibes({
//     weight: ['400'],
//     subsets: ['latin'],

// });

export default function CertificateViewPage() {
    const { id: courseId } = useParams();
    const router = useRouter();
    const certificateRef = useRef(null);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCertificateData = async () => {
            try {
                const response = await enrollmentAPI.getCertificate(courseId);
                setData(response.data.data);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Failed to load certificate');
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchCertificateData();
        }
    }, [courseId]);

    const handleDownloadPDF = async () => {
        if (!certificateRef.current) return;
        setDownloading(true);

        try {
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
            });
            //  PDF Creation
            const imageData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
            });

            // Page size
            const pdfWidth = 297;
            const pdfHeight = 210;

            // Add the image to PDF
            pdf.addImage(imageData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // Download
            pdf.save(`${data.studentName.replace(/\s+/g, '_')}_SU_Certificate.pdf`);
        } catch (err) {
            console.error('PDF Generation failed:', err);
            toast.error('Could not generate PDF. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return (
        <DashboardLayout role="student">
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        </DashboardLayout>
    );

    if (error) return (
        <DashboardLayout role="student">
            <div className="text-center py-20">
                <h3 className="text-xl font-bold text-red-500 mb-2">Access Denied</h3>
                <p className="text-gray-500 mb-6">{error}</p>
                <button onClick={() => router.back()} className="text-primary-500 hover:underline">
                    &larr; Go Back
                </button>
            </div>
        </DashboardLayout>
    );

    return (
        <>

            {/* Toolbar */}
            <div className="my-4 mx-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-500 cursor-pointer hover:text-primary-500 mb-2 "
                    >
                        <FiArrowLeft className="mr-1" /> Back to Certificates
                    </button>
                </div>

                <button
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                    className="btn-primary flex items-center gap-2 cursor-pointer  disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {downloading ? (
                        <>Generating PDF...</>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 hover:underline hover:text-primary-500">
                                <FiDownload /> Download PDF
                            </div>
                        </>
                    )}
                </button>
            </div>

            {/* --- CERTIFICATE DESIGN --- */}
            <div className="flex justify-center overflow-auto pb-10 bg-gray-100 p-8 rounded-xl border border-gray-200">

                <div
                    ref={certificateRef}
                    className="w-[1123px] h-[754px] bg-white relative shrink-0 shadow-2xl overflow-hidden"
                    style={{
                        fontFamily: "'Times New Roman', serif",
                        color: '#1e293b'
                    }}
                >
                    {/* Borders */}
                    <div className="absolute inset-4 border-[3px]" style={{ borderColor: '#0f172a' }}></div>
                    <div className="absolute inset-6 border" style={{ borderColor: '#cbd5e1' }}></div>

                    {/* Corner Decorations */}
                    <div className="absolute top-4 left-4 w-24 h-24 border-t-[6px] border-l-[6px]" style={{ borderColor: '#bf9b30' }}></div>
                    <div className="absolute top-4 right-4 w-24 h-24 border-t-[6px] border-r-[6px]" style={{ borderColor: '#bf9b30' }}></div>
                    <div className="absolute bottom-4 left-4 w-24 h-24 border-b-[6px] border-l-[6px]" style={{ borderColor: '#bf9b30' }}></div>
                    <div className="absolute bottom-4 right-4 w-24 h-24 border-b-[6px] border-r-[6px]" style={{ borderColor: '#bf9b30' }}></div>

                    {/* Main Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-20 z-10">

                        {/* Header */}
                        <div className="mb-10">
                            <h2 className="text-4xl font-black tracking-[0.2em] uppercase" style={{ color: '#1e293b' }}>
                                Certificate of Completion
                            </h2>
                        </div>

                        <p className="text-xl italic mb-4 font-serif" style={{ color: '#64748b' }}>
                            This is to certify that
                        </p>

                        {/* Student Name */}
                        <h1 className="text-6xl font-bold mb-6 capitalize font-serif italic border-b-2 pb-4 px-12 inline-block"
                            style={{
                                color: '#b59309',
                                borderColor: '#f1f5f9'
                            }}
                        >
                            {data.studentName}
                        </h1>

                        <p className="text-xl italic mb-8 font-serif max-w-2xl mx-auto" style={{ color: '#64748b' }}>
                            has successfully demonstrated proficiency and completed the required coursework for the program
                        </p>

                        {/* Course Name */}
                        <div className="max-w-4xl">
                            <h2 className="text-4xl font-bold" style={{ color: '#0f172a' }}>
                                {data.courseName}
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-32 w-full px-20 mt-auto mb-10">

                            {/* Date Section */}
                            <div className="text-center relative">
                                <p className="font-semibold mb-2" style={{ color: '#1e293b' }}>
                                    {new Date(data.issuedAt).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </p>
                                <div className="h-0.5 w-48 mx-auto mb-2" style={{ backgroundColor: '#1e293b' }}></div>
                                <p className="text-sm uppercase tracking-wider font-sans" style={{ color: '#64748b' }}>Date Issued</p>
                            </div>

                            {/* Instructor Signature */}
                            <div className="text-center relative">
                                <p className="text-2xl mb-2 font-italic "  >
                                    {data.instructorName}
                                </p>
                                <div className="h-0.5 w-48 mx-auto mb-2" style={{ backgroundColor: '#1e293b' }}></div>
                                <p className="text-sm uppercase tracking-wider font-sans" style={{ color: '#64748b' }}>Instructor</p>
                            </div>
                        </div>

                        {/* Footer ID */}
                        <div className="absolute bottom-6 left-0 right-0 text-center">
                            <p className="text-[10px] font-sans uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
                                Credential ID: {data.certificateId}
                            </p>
                        </div>

                        {/* Gold Seal */}
                        <div className="absolute bottom-16 right-20 opacity-90">
                            <div className="w-28 h-28 rounded-full shadow-xl flex items-center justify-center border-4"
                                style={{
                                    background: '#bf9b30',
                                    borderColor: '#a67c00'
                                }}
                            >
                                <div className="w-24 h-24 border rounded-full flex items-center justify-center" style={{ borderColor: 'rgba(255,255,255,0.5)' }}>
                                    <FiCheckCircle className="w-12 h-12 text-white drop-shadow-md" style={{ color: '#ffffff' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}