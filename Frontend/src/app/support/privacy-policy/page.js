'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PrivacyPolicyPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-linear-to-bl from-slate-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
                <div className="max-w-4xl mx-auto">
                    {/* Title Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            Last updated: December 24, 2025
                        </p>
                    </div>

                    {/* Content Card */}
                    <div className="glass-card p-8 md:p-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700">
                        <div className="prose prose-lg prose-indigo dark:prose-invert max-w-none">

                            <p>
                                At Skill-Up, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our educational platform.
                            </p>

                            <h3>1. Information We Collect</h3>
                            <p>We collect information that you provide directly to us when you register, purchase a course, or communicate with us:</p>
                            <ul>
                                <li><strong>Personal Data:</strong> Name, email address, and profile picture.</li>
                                <li><strong>Payment Data:</strong> Credit card information (processed securely by our third-party payment processors).</li>
                                <li><strong>Course Data:</strong> Progress tracking, quiz scores, and certificates earned.</li>
                            </ul>

                            <h3>2. How We Use Your Information</h3>
                            <p>We use the information we collect to:</p>
                            <ul>
                                <li>Provide, maintain, and improve our services.</li>
                                <li>Process transactions and send related information.</li>
                                <li>Send you technical notices, updates, and support messages.</li>
                                <li>Respond to your comments and questions.</li>
                            </ul>

                            <h3>3. Data Security</h3>
                            <p>
                                We implement appropriate technical and organizational measures to protect the security of your personal information. However, please be aware that no method of transmission over the Internet is 100% secure.
                            </p>

                            <h3>4. Cookies and Tracking</h3>
                            <p>
                                We use cookies and similar tracking technologies to track the activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                            </p>

                            <h3>5. Contact Us</h3>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:support@skillup.com" className="text-primary-600 hover:text-primary-700 font-medium">support@skillup.com</a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}