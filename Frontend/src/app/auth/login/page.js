import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import Image from 'next/image';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
            {/* Decorative Blobs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/30 rounded-full blur-3xl animate-float"></div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Side - Branding */}
                <div className="hidden lg:block animate-slide-right">
                    <Link href="/" className="flex items-center space-x-3 mb-8 hover:scale-y-101">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={70}
                            height={70}
                            priority={true}
                        />
                        <span className="text-3xl font-bold gradient-text">Skill-Up</span>
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
                <div>
                    {/* Mobile Logo */}
                    <Link href="/" className="flex lg:hidden items-center justify-center space-x-3 mb-8">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={70}
                            height={70}
                            priority={true}
                        />
                        <span className="text-3xl font-bold gradient-text">Skill-Up</span>
                    </Link>

                    <LoginForm />
                </div>
            </div>
        </div>
    );
}