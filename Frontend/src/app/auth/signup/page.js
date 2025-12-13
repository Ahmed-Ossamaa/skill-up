import Link from 'next/link';
import SignupForm from '@/components/auth/SignupForm';
import { HiOutlineAcademicCap } from 'react-icons/hi';

export default function SignupPage() {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 py-12">


            {/* Content */}
            <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Side - Signup Form */}
                <div>
                    <Link href="/" className="flex lg:hidden items-center justify-center space-x-3 mb-8">
                        <div className="bg-linear-to-br from-primary-500 to-secondary-500 p-3 rounded-xl">
                            <HiOutlineAcademicCap className="w-8 h-8 " />
                        </div>
                        <span className="text-3xl font-bold gradient-text">LearnHub</span>
                    </Link>

                    <SignupForm />
                </div>

                {/* Right Side - Branding */}
                <div className="hidden lg:block animate-slide-up order-1 lg:order-2" style={{ animationDelay: '0.2s' }}>
                    <Link href="/" className="flex items-center space-x-3 mb-8">
                        <div className="bg-linear-to-br from-primary-500 to-secondary-500 p-3 rounded-xl">
                            <HiOutlineAcademicCap className="w-8 h-8 " />
                        </div>
                        <span className="text-3xl font-bold gradient-text">LearnHub</span>
                    </Link>

                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        Start Your
                        <span className="block gradient-text">Learning Adventure</span>
                    </h1>

                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                        Join thousands of learners worldwide and unlock your potential with expert-led courses.
                    </p>

                    {/* Benefits */}
                    <div className="space-y-4">
                        {[
                            {
                                icon: '🚀',
                                title: 'Get Started Free',
                                desc: 'Access free courses and start learning today'
                            },
                            {
                                icon: '💼',
                                title: 'Learn at Your Pace',
                                desc: 'Study whenever and wherever you want'
                            },
                            {
                                icon: '🤝',
                                title: 'Join Community',
                                desc: 'Connect with fellow learners worldwide'
                            },
                            {
                                icon: '✨',
                                title: 'Build Your Future',
                                desc: 'Gain skills that matter in your career'
                            },
                        ].map((benefit, index) => (
                            <div
                                key={index}
                                className="flex items-center space-x-4 glass-card p-4 hover-lift"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="text-3xl">{benefit.icon}</div>
                                <div>
                                    <div className="font-semibold">{benefit.title}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{benefit.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}