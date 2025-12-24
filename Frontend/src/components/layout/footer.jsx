import Link from 'next/link';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { AiFillFacebook, AiFillTwitterCircle, AiFillInstagram, AiFillLinkedin } from 'react-icons/ai';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        company: [
            { label: 'About Us', href: '/about' },
            { label: 'Careers', href: '/careers' },

        ],
        support: [

            { label: 'Contact Us', href: '/contact' },
            { label: 'Terms of Service', href: '/support/terms-of-service' },
            { label: 'Privacy Policy', href: '/support/privacy-policy' },
        ],
        teaching: [
            { label: 'Become Instructor', href: '/teach' },
            { label: 'Intructors', href: '/instructors' },
        ],
    };

    return (
        <footer className="relative mt-20 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Wave Decoration */}
            <div className="absolute top-0 left-0 right-0 overflow-hidden">
                <svg
                    className="w-full h-20 text-white dark:text-gray-950"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                        fill="currentColor"
                    />
                </svg>
            </div>

            <div className="container mx-auto px-4 pt-24 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center space-x-2 mb-4">
                            <div className="bg-linear-to-br from-primary-500 to-secondary-500 p-2 rounded-xl">
                                <HiOutlineAcademicCap className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-2xl font-bold">Skill-Up</span>
                        </Link>
                        <p className="text-gray-400 mb-6 max-w-md">
                            Empowering learners worldwide with high-quality, accessible education.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 text-gray-400">
                                <FiMail className="w-5 h-5" />
                                <span>support@skillUp.com</span>
                            </div>
                            <div className="flex items-center space-x-3 text-gray-400">
                                <FiPhone className="w-5 h-5" />
                                <span>+20 155 458 0561</span>
                            </div>
                            <div className="flex items-center space-x-3 text-gray-400">
                                <FiMapPin className="w-5 h-5" />
                                <span>Alexandria, Egypt</span>
                            </div>
                        </div>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Company</h3>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-primary-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Support</h3>
                        <ul className="space-y-2">
                            {footerLinks.support.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-primary-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Teaching Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Teaching</h3>
                        <ul className="space-y-2">
                            {footerLinks.teaching.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-primary-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    {/* Copyright */}
                    <p className="text-gray-400 text-sm">
                        © {currentYear} Skill-Up. All rights reserved.
                    </p>

                    {/* Social Links */}
                    <div className="flex items-center space-x-4">
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-primary-400 transition-colors"
                        >
                            <AiFillFacebook className="w-6 h-6" />
                        </a>
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-primary-400 transition-colors"
                        >
                            <AiFillTwitterCircle className="w-6 h-6" />
                        </a>
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-primary-400 transition-colors"
                        >
                            <AiFillInstagram className="w-6 h-6" />
                        </a>
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-primary-400 transition-colors"
                        >
                            <AiFillLinkedin className="w-6 h-6" />
                        </a>
                    </div>


                </div>
            </div>
        </footer>
    );
}