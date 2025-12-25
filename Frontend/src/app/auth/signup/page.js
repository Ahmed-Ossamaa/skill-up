import Link from 'next/link';
import SignupForm from '@/components/auth/SignupForm';
import { GiPartyPopper } from 'react-icons/gi';
import { FaLaptopCode, FaUserPlus } from "react-icons/fa";
import Image from 'next/image';

export default function SignupPage() {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 py-12">
            {/* Content */}
            <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Side - Signup Form */}
                <div>
                    <Link href="/"
                        title='home'
                        className="flex lg:hidden items-center justify-center space-x-3 mb-8 hover:scale-y-101">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={70}
                            height={70}
                            priority={true}
                        />
                        <span className="text-3xl font-bold gradient-text">Skill-Up</span>
                    </Link>

                    <SignupForm />
                </div>

                {/* Right Side  */}
                <div className="hidden lg:block animate-slide-left order-1 lg:order-2">
                    <Link href="/"
                        title='home'
                        className="flex items-center space-x-3 mb-8 hover:scale-y-101">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={70}
                            height={70}
                            priority={true}
                        />
                        <span className="text-3xl font-bold gradient-text">Skill-Up</span>
                    </Link>

                    <h1 className="text-4xl font-bold mb-6 leading-tight">
                        Start Your
                        <span className="block gradient-text">Learning Adventure</span>
                    </h1>

                    <p className=" text-gray-600 dark:text-gray-300 mb-4">
                        Join thousands of learners worldwide and unlock your potential with expert-led courses.
                    </p>

                    {/* Benefits */}
                    <div className="space-y-2">
                        {[
                            {
                                icon: <FaUserPlus className="w-8 h-8 text-primary-500" />,
                                title: 'Get Started Free',
                                desc: 'Access free courses and start learning today'
                            },
                            {
                                icon: <FaLaptopCode className="w-8 h-8 text-secondary-600" />,
                                title: 'Learn at Your Pace',
                                desc: 'Study whenever and wherever you want'
                            },
                            {
                                icon: <GiPartyPopper className="w-8 h-8 text-amber-600" />,
                                title: 'Build Your Future',
                                desc: 'Gain skills that matter in your career'
                            },
                        ].map((benefit, index) => (
                            <div
                                key={index}
                                className="flex items-center space-x-4 glass-card p-4 my-2"
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