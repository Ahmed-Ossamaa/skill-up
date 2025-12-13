'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useAuthStore from '@/store/authStore';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiAlertCircle } from 'react-icons/fi';
import { AiFillGoogleCircle, AiFillGithub } from 'react-icons/ai';

// Zod schema
const signupSchema = z
    .object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number'),
        confirmPassword: z.string(),
        role: z.enum(['student', 'instructor'], { required_error: 'Please select a role' }),
        agreeToTerms: z.boolean().refine((val) => val === true, {
            message: 'You must agree to the terms and conditions',
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
        resolver: zodResolver(signupSchema),
        defaultValues: { role: 'student' },
    });

    const password = useWatch({
        control,
        name: 'password',
        defaultValue: '',
    });

    const onSubmit = async (data) => {
        const { confirmPassword, agreeToTerms, ...userData } = data;
        const result = await registerUser(userData);
        if (result.success) router.push('/');
    };

    // Password strength function
    const getPasswordStrength = (pwd) => {
        if (!pwd) return { strength: 0, label: '', color: '' };
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[a-z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[^A-Za-z0-9]/.test(pwd)) strength++;

        const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

        return {
            strength: (strength / 5) * 100,
            label: labels[strength - 1] || '',
            color: colors[strength - 1] || 'bg-gray-300',
        };
    };

    const passwordStrength = getPasswordStrength(password);

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="glass-card p-8 animate-scale-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">Create Account</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Join thousands of learners worldwide
                    </p>
                </div>

                {/* Auth Error */}
                {authError && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-3 animate-slide-down">
                        <FiAlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-500">{authError}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiUser className="w-5 h-5 text-gray-500" />
                            </div>
                            <input
                                type="text"
                                {...register('name')}
                                placeholder="John Doe"
                                className="w-full pl-10 pr-4 py-3 glass rounded-lg focus-ring"
                            />
                        </div>
                        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiMail className="w-5 h-5 text-gray-500" />
                            </div>
                            <input
                                type="email"
                                {...register('email')}
                                placeholder="you@example.com"
                                className="w-full pl-10 pr-4 py-3 glass rounded-lg focus-ring"
                            />
                        </div>
                        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">I want to</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['student', 'instructor'].map((role) => (
                                <label key={role} className="relative cursor-pointer">
                                    <input type="radio" {...register('role')} value={role} className="peer sr-only" />
                                    <div className="glass rounded-lg p-4 border-2 border-transparent peer-checked:border-primary-500 peer-checked:bg-primary-500/10 transition-all">
                                        <div className="text-center">
                                            <div className="text-2xl mb-2">{role === 'student' ? '🎓' : '👨‍🏫'}</div>
                                            <div className="font-semibold">{role === 'student' ? 'Learn' : 'Teach'}</div>
                                            <div className="text-xs text-gray-500">
                                                {role === 'student' ? 'As a Student' : 'As Instructor'}
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                        {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiLock className="w-5 h-5 text-gray-500" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                {...register('password')}
                                placeholder="Create a strong password"
                                className="w-full pl-10 pr-12 py-3 glass rounded-lg focus-ring"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showPassword ? <FiEyeOff className="w-5 h-5 text-gray-500" /> : <FiEye className="w-5 h-5 text-gray-500" />}
                            </button>
                        </div>

                        {/* Password Strength */}
                        {password && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-500">Password strength</span>
                                    <span className="text-xs font-medium">{passwordStrength.label}</span>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                        style={{ width: `${passwordStrength.strength}%` }}
                                    />
                                </div>
                            </div>
                        )}
                        {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Confirm Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiLock className="w-5 h-5 text-gray-500" />
                            </div>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                {...register('confirmPassword')}
                                placeholder="Confirm your password"
                                className="w-full pl-10 pr-12 py-3 glass rounded-lg focus-ring"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showConfirmPassword ? <FiEyeOff className="w-5 h-5 text-gray-500" /> : <FiEye className="w-5 h-5 text-gray-500" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    {/* Terms */}
                    <div>
                        <label className="flex items-start space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                {...register('agreeToTerms')}
                                className="w-4 h-4 mt-1 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                I agree to the{' '}
                                <Link href="/terms" className="text-primary-500 hover:text-primary-600">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link href="/privacy" className="text-primary-500 hover:text-primary-600">
                                    Privacy Policy
                                </Link>
                            </span>
                        </label>
                        {errors.agreeToTerms && (
                            <p className="mt-1 text-sm text-red-500">{errors.agreeToTerms.message}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-linear-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {isLoading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-transparent text-gray-500">Or sign up with</span>
                    </div>
                </div>

                {/* Social Signup */}
                <div className="grid grid-cols-1">
                    <button className="flex items-center justify-center space-x-2 py-3 glass-button">
                        <AiFillGoogleCircle className="w-5 h-5 text-red-500" />
                        <span>Google</span>
                    </button>
                </div>

                {/* Login Link */}
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="text-primary-500 hover:text-primary-600 font-semibold">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
