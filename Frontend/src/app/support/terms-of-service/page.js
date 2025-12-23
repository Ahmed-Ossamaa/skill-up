'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function TermsOfServicePage() {
    return (
        <>
            <Header />
            <main className="min-h-screen pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-linear-to-bl from-slate-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
                <div className="max-w-4xl mx-auto">
                    {/* Title Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            Please read these terms carefully before using our platform.
                        </p>
                    </div>

                    {/* Content Card */}
                    <div className="glass-card p-8 md:p-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-gray-700">
                        <div className="prose prose-lg prose-indigo dark:prose-invert max-w-none">

                            <h3>1. Acceptance of Terms</h3>
                            <p>
                                By accessing or using Skill-Up, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                            </p>

                            <h3>2. User Accounts</h3>
                            <p>
                                When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
                            </p>

                            <h3>3. Intellectual Property</h3>
                            <p>
                                The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of Skill-Up and its licensors. Our courses are for your personal, non-commercial use only.
                            </p>

                            <h3>4. Course Enrollment and Access</h3>
                            <ul>
                                <li><strong>Lifetime Access:</strong> When you purchase a course, you generally receive lifetime access, barring legal or policy reasons to remove it.</li>
                                <li><strong>Refunds:</strong> We offer a 30-day money-back guarantee on most courses if you are unsatisfied.</li>
                            </ul>

                            <h3>5. Prohibited Activities</h3>
                            <p>You agree not to:</p>
                            <ul>
                                <li>Share your account credentials with others.</li>
                                <li>Download or distribute course content illegally.</li>
                                <li>Use the platform for any unlawful purpose.</li>
                            </ul>

                            <h3>6. Termination</h3>
                            <p>
                                We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                            </p>

                            <h3>7. Changes to Terms</h3>
                            <p>
                                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}