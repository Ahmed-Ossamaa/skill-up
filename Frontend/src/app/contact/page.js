'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import {
    AiOutlineMail,AiOutlinePhone,AiOutlineEnvironment,
    AiOutlineSend,AiOutlineLoading3Quarters
} from 'react-icons/ai';
import {
    FaTwitter,FaLinkedinIn,
    FaDiscord,
    FaFacebook
} from 'react-icons/fa';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { feedbackAPI } from '@/lib/api'; 
import useAuthStore from '@/store/authStore'; 

// Validation Schema 
const contactSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.email("Invalid email address"),
    subject: z.string().min(3, "Subject must be at least 3 characters").max(100, "Subject is too long"),
    message: z.string().min(10, "Message must be at least 10 characters").max(1000, "Message is too long"),
});

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { user } = useAuthStore();

    // Setup Form
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(contactSchema),
        mode: "onBlur",
    });

    // Auto-fill if Logged In
    useEffect(() => {
        if (user) {
            setValue('name', user.name);
            setValue('email', user.email);
        }
    }, [user, setValue]);

    // Submit 
    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await feedbackAPI.create(data);

            setIsSuccess(true);
            toast.success("Message sent successfully!");
            reset();

            if (user) {
                setValue('name', user.name);
                setValue('email', user.email);
            }

        } catch (error) {
            console.error("Contact Error:", error);
            const msg = error.response?.data?.message || "Failed to send message";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex flex-col">
            <Header />

            <main className="grow pt-32 pb-20 relative overflow-hidden">
                {/* Decorations */}
                <div className="absolute top-20 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -z-10"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl -z-10"></div>

                <div className="container mx-auto px-4 max-w-6xl">

                    {/* Page Header */}
                    <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                            Get in <span className="gradient-text">Touch</span>
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Have questions about our courses? Need support? We are here to help you on your learning journey.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">

                        {/* --- LEFT Side: Contact Info --- */}
                        <div className="space-y-8 lg:col-span-1 animate-in fade-in slide-in-from-left-4 duration-700 delay-150">
                            {/* Info Card */}
                            <div className="glass-card p-6 bg-white dark:bg-gray-800 space-y-6">
                                <h3 className="text-xl font-bold dark:text-white mb-6">Contact Information</h3>

                                <div className="flex items-start space-x-4 group">
                                    <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <AiOutlineMail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Email Us</p>
                                        <a href="mailto:support@skillup.com" className="text-gray-900 dark:text-white font-semibold hover:text-primary-500 transition">
                                            support@skillup.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4 group">
                                    <div className="w-10 h-10 rounded-lg bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <AiOutlinePhone className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Call Us</p>
                                        <a href="tel:+1234567890" className="text-gray-900 dark:text-white font-semibold hover:text-secondary-500 transition">
                                            +20 (155) 458-0561
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4 group">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <AiOutlineEnvironment className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Visit Us</p>
                                        <p className="text-gray-900 dark:text-white font-semibold">
                                            13 Smouha,<br />Alexandria, Egypt
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Socials Card */}
                            <div className="glass-card p-6 bg-white dark:bg-gray-800">
                                <h3 className="text-lg font-bold dark:text-white mb-4">Follow Us</h3>
                                <div className="flex space-x-4">
                                    <SocialLink href="https://twitter.com" icon={FaTwitter} color="hover:bg-primary-400" />
                                    <SocialLink href="https://facebook.com" icon={FaFacebook} color="hover:bg-primary-600" />
                                    <SocialLink href="https://linkedin.com" icon={FaLinkedinIn} color="hover:bg-primary-700" />
                                    <SocialLink href="https://discord.com" icon={FaDiscord} color="hover:bg-indigo-500" />
                                </div>
                            </div>
                        </div>

                        {/* --- RIGHT Side: Form --- */}
                        <div className="lg:col-span-2 animate-in fade-in slide-in-from-right-4 duration-700 delay-150">
                            <div className="glass-card p-8 md:p-10 bg-white dark:bg-gray-800 h-full relative overflow-hidden">

                                {isSuccess ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 py-20">
                                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                                            <AiOutlineSend className="w-10 h-10 text-green-600 dark:text-green-400 ml-1" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                                        <p className="text-gray-600 dark:text-gray-300 max-w-md">
                                            Thank you for reaching out. Our team will review your message and get back to you shortly.
                                        </p>
                                        <button
                                            onClick={() => setIsSuccess(false)}
                                            className="mt-8 px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                        >
                                            Send another message
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send us a Message</h2>

                                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                {/* Name Input */}
                                                <div>
                                                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Your Name</label>
                                                    <input
                                                        type="text"
                                                        {...register('name')}
                                                        // Disable name input if user is logged in 
                                                        disabled={!!user}
                                                        className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-gray-900/50 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed
                                                            ${errors.name
                                                                ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                                                                : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500'
                                                            } dark:text-white`}
                                                        placeholder="Please Provide Your Name"
                                                    />
                                                    {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name.message}</p>}
                                                </div>

                                                {/* Email Input */}
                                                <div>
                                                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Email Address</label>
                                                    <input
                                                        type="email"
                                                        {...register('email')}
                                                        disabled={!!user}
                                                        className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-gray-900/50 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed
                                                            ${errors.email
                                                                ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                                                                : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500'
                                                            } dark:text-white`}
                                                        placeholder="user@example.com"
                                                    />
                                                    {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>}
                                                </div>
                                            </div>

                                            {/* Subject Input */}
                                            <div>
                                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Subject</label>
                                                <input
                                                    type="text"
                                                    {...register('subject')}
                                                    className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-gray-900/50 outline-none transition-all
                                                        ${errors.subject
                                                            ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                                                            : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500'
                                                        } dark:text-white`}
                                                    placeholder="How can we help?"
                                                />
                                                {errors.subject && <p className="text-red-500 text-xs mt-1 ml-1">{errors.subject.message}</p>}
                                            </div>

                                            {/* Message Input */}
                                            <div>
                                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Message</label>
                                                <textarea
                                                    rows={5}
                                                    {...register('message')}
                                                    className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-gray-900/50 outline-none transition-all resize-none
                                                        ${errors.message
                                                            ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                                                            : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500'
                                                        } dark:text-white`}
                                                    placeholder="Tell us more about your inquiry..."
                                                ></textarea>
                                                {errors.message && <p className="text-red-500 text-xs mt-1 ml-1">{errors.message.message}</p>}
                                            </div>

                                            {/* Submit Button */}
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-70 mx-auto bg-linear-to-r from-primary-600 to-secondary-600 text-white font-bold py-4 rounded-xl shadow-md shadow-secondary-500/30  hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <AiOutlineLoading3Quarters className="animate-spin w-5 h-5" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        Send Message
                                                        <AiOutlineSend className="w-5 h-5" />
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

// Social Icon Button
function SocialLink({ href, icon: Icon, color }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-all duration-300 hover:text-white ${color}`}
        >
            <Icon className="w-5 h-5" />
        </a>
    );
}