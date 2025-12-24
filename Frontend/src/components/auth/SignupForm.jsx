'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useAuthStore from '@/store/authStore';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { AiFillGoogleCircle } from 'react-icons/ai';

const signupSchema = z
    .object({
        name: z.string().min(2, 'Name is too short').max(50, 'Name is too long'),
        email: z.string().email('Invalid email address'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'One uppercase required')
            .regex(/[a-z]/, 'One lowercase required')
            .regex(/[0-9]/, 'One number required'),
        confirmPassword: z.string(),
        // role: z.enum(['student', 'instructor'], { required_error: 'Please select a role' }),
        agreeToTerms: z.boolean().refine((val) => val === true, {
            message: 'You must agree to continue',
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

export default function SignupForm() {
    const router = useRouter();
    const { register: registerUser, isLoading, error: authError } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, handleSubmit, control, formState: { errors } } = useForm({
        resolver: zodResolver(signupSchema)
    });

    const password = useWatch({ control, name: 'password', defaultValue: '' });

    const onSubmit = async (data) => {
        const { confirmPassword, agreeToTerms, ...userData } = data;
        const result = await registerUser(userData);
        if (result.success) router.push('/');
    };

    const getStrengthColor = (pwd) => {
        if (!pwd) return 'bg-gray-200 dark:bg-gray-700';
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        if (score <= 1) return 'bg-red-500 w-1/4';
        if (score === 2) return 'bg-yellow-500 w-2/4';
        if (score === 3) return 'bg-blue-500 w-3/4';
        return 'bg-green-500 w-full';
    };

    return (
        <div className="w-full max-w-3xl mx-auto ">
            <div className="glass-card p-8 shadow-md! shadow-secondary-200">

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary-600 to-purple-600">
                        Create Account
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Start your learning journey today
                    </p>
                </div>

                {authError && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 ">
                        <FiAlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-sm text-red-500">{authError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">


                    {/* name and email */}
                    <div className="grid grid-cols-1  gap-4">
                        <div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                                    <FiUser />
                                </div>
                                <input
                                    type="text"
                                    {...register('name')}
                                    placeholder="Full Name"
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                                />
                            </div>
                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                        </div>

                        <div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                                    <FiMail />
                                </div>
                                <input
                                    type="email"
                                    {...register('email')}
                                    placeholder="Email Address"
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                                />
                            </div>
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                        </div>
                    </div>

                    {/*  Passwords */}
                    <div className="grid grid-cols-1  gap-4">
                        <div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                                    <FiLock />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password')}
                                    placeholder="Password"
                                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            {/*Strength Bar */}
                            <div className="h-1 mt-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-500 ${getStrengthColor(password)}`} />
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                        </div>

                        <div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                                    <FiLock />
                                </div>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    {...register('confirmPassword')}
                                    placeholder="Confirm Password"
                                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
                        </div>
                    </div>

                    {/* Terms & Submit */}
                    <div className="pt-2">
                        <label className="flex items-start space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                {...register('agreeToTerms')}
                                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                                I agree to the <Link href="/support/terms-of-service" className="text-primary-600 hover:underline">Terms</Link> & <Link href="/support/privacy-policy" className="text-primary-600 hover:underline">Privacy Policy</Link>
                            </span>
                        </label>
                        {errors.agreeToTerms && <p className="mt-1 text-xs text-red-500">{errors.agreeToTerms.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-linear-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                {/* Footer Section */}
                <div className="mt-6">

                    <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-primary-600 font-semibold hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}