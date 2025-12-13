import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';
import { HiOutlineAcademicCap } from 'react-icons/hi';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
            {/* Decorative Blobs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/30 rounded-full blur-3xl animate-float"></div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Side - Branding */}
                <div className="hidden lg:block animate-slide-up">
                    <Link href="/" className="flex items-center space-x-3 mb-8">
                        <div className="bg-linear-to-br from-primary-500 to-secondary-500 p-3 rounded-xl">
                            <HiOutlineAcademicCap className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-3xl font-bold gradient-text">LearnHub</span>
                    </Link>

                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        Continue Your
                        <span className="block gradient-text">Learning Journey</span>
                    </h1>

                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                        Access thousands of courses, track your progress, and achieve your learning goals.
                    </p>


                </div>

                {/* Right Side - Login Form */}
                <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    {/* Mobile Logo */}
                    <Link href="/" className="flex lg:hidden items-center justify-center space-x-3 mb-8">
                        <div className="bg-linear-to-br from-primary-500 to-secondary-500 p-3 rounded-xl">
                            <HiOutlineAcademicCap className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-3xl font-bold gradient-text">LearnHub</span>
                    </Link>

                    <LoginForm />
                </div>
            </div>
        </div>
    );
}