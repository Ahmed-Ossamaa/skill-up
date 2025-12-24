import Link from 'next/link';
import Image from 'next/image';
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi';

export default function InstructorBanner() {
    const benefits = [
        "Earn money every time a student purchases your course.",
        "Inspire students globally and help them learn new skills.",
        "Join a community of expert instructors."
    ];

    return (
        <section className="py-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Main Wrapper with Gradient & Shadow */}
                <div className="bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800/50 dark:to-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700">

                    <div className="grid grid-cols-1 lg:grid-cols-2 items-center">

                        {/* Left Side */}
                        <div className="p-8 md:p-16 order-2 lg:order-1 relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
                                Become an Instructor & <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-600 to-purple-600">Share Your Knowledge</span>
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                                Top instructors from around the world teach millions of students on Skill-Up. We provide the tools and skills to teach what you love.
                            </p>

                            <ul className="space-y-3 mb-10">
                                {benefits.map((benefit, index) => (
                                    <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                        <FiCheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA Button */}
                            <Link href="/teach" className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-primary-500/30 hover:-translate-y-1 group">
                                Start Teaching Today
                                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Right Side: Image */}
                    
                        <div className="relative h-64 lg:h-full min-h-[400px] lg:min-h-[600px] order-1 lg:order-2 w-full">
                            <Image
                                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop"
                                alt="Instructor teaching online"
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover object-center lg:rounded-r-3xl"
                                priority={false}
                            />
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}