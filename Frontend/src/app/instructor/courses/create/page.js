'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// React Hook Form & Zod
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Components & Hooks
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import useAuthStore from '@/store/authStore';
import ConfirmModal from '@/components/ui/ConfirmModal';
import useConfirmModal from '@/hooks/useConfirmModal';

// APIs & Icons
import { courseAPI, categoryAPI } from '@/lib/api';
import {
    FiSave,
    FiX,
    FiAlertCircle,
    FiImage,
    FiPlus, // Used for Add Array Item
    FiTrash2, // Used for Remove Array Item
} from 'react-icons/fi';
import Image from 'next/image';

// --- Zod Validation Schema (No Change) ---
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const arrayItemSchema = z.string().trim().min(1, { message: 'Item cannot be empty' });

// Base Schema for the Form Data
const courseSchema = z
    .object({
        title: z
            .string()
            .trim()
            .min(10, { message: 'Title must be at least 10 characters' })
            .max(100, { message: 'Title must be less than 100 characters' }),
        description: z
            .string()
            .trim()
            .min(20, { message: 'Description must be at least 20 characters' }),
        category: z.string().min(1, { message: 'Category is required' }),
        level: z.enum(['beginner', 'intermediate', 'advanced', 'all levels']),
        language: z.string().min(1, { message: 'Language is required' }),
        isFree: z.boolean(),
        // Note: price and discount are validated in a refinement based on isFree
        // Use z.string().pipe(z.coerce.number()) for better empty string handling if you don't use the ternary check below
        price: z.coerce.number().min(0, { message: 'Price must be a valid number' }),
        discount: z.coerce
            .number()
            .min(0, { message: 'Discount must be a valid number' })
            .max(100, { message: 'Discount cannot exceed 100%' }),

        // Array fields, must have at least one non-empty item
        requirements: z.array(arrayItemSchema).min(1, { message: 'At least one requirement is required' }),
        learningOutcomes: z.array(arrayItemSchema).min(1, { message: 'At least one learning outcome is required' }),
        targetAudience: z.array(arrayItemSchema).min(1, { message: 'At least one target audience is required' }),

        // Thumbnail validation (can be null/File)
        thumbnail: z
            .any()
            .refine((file) => file === null || file instanceof File, {
                message: 'Thumbnail must be a file or null.',
            })
            .refine((file) => file === null || file.size <= MAX_FILE_SIZE, {
                message: 'Image must be less than 5MB',
            })
            .refine(
                (file) => file === null || ACCEPTED_IMAGE_TYPES.includes(file.type),
                {
                    message: 'File must be a PNG, JPG, or WEBP image',
                }
            ),
    })
    // Refinement for conditional logic (Price & Discount for paid courses)
    .superRefine((data, ctx) => {
        if (!data.isFree) {
            // Price required for paid course
            // Check for price being 0 or equivalent to empty string after coercion
            if (data.price <= 0 || data.price === null || data.price === undefined) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Price is required and must be greater than 0 for paid courses',
                    path: ['price'],
                });
            }

            // Discount check against price
            // Ensure price is valid before checking discount against it
            if (data.price > 0 && data.discount >= data.price) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Discount amount cannot be greater than or equal to the price',
                    path: ['discount'],
                });
            }
        }
    });

// Infer the TypeScript type from the Zod schema
// type CourseFormData = z.infer<typeof courseSchema>; // Kept as comment for context

export default function CreateCoursePage() {
    const router = useRouter();
    const { user, isAuthenticated, isReady } = useAuthStore();
    const { isOpen, config, openConfirm, closeConfirm, handleConfirm } = useConfirmModal();

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [thumbnailPreview, setThumbnailPreview] = useState(null); // Managed state for preview URL

    // --- React Hook Form Setup ---
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        control,
        formState: { errors, isValid, isDirty },
    } = useForm({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            title: '',
            description: '',
            category: '',
            level: 'beginner',
            price: 0, // Default to 0, will be validated based on isFree
            discount: 0,
            isFree: false,
            language: 'English',
            requirements: [''],
            learningOutcomes: [''],
            targetAudience: [''],
            thumbnail: null,
        },
        // Validate on blur/change for better UX
        mode: 'onTouched',
    });

    // Watch fields for dynamic changes and progress calculation
    const watchedFields = watch();
    const isFreeWatched = watch('isFree');
    const priceWatched = watch('price');
    const discountWatched = watch('discount');
    const thumbnailWatched = watch('thumbnail');

    // Use useFieldArray for dynamic lists (No Change)
    const {
        fields: reqFields,
        append: appendReq,
        remove: removeReq,
    } = useFieldArray({ control, name: 'requirements' });

    const {
        fields: outcomeFields,
        append: appendOutcome,
        remove: removeOutcome,
    } = useFieldArray({ control, name: 'learningOutcomes' });

    const {
        fields: audienceFields,
        append: appendAudience,
        remove: removeAudience,
    } = useFieldArray({ control, name: 'targetAudience' });

    useEffect(() => {
        if (!isReady) return;
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        if (user && user.role !== 'instructor') {
            router.push('/');
            return;
        }

        fetchCategories();
    }, [isReady, isAuthenticated, user, router]);


    useEffect(() => {
        let newPreview = null;

        if (thumbnailWatched instanceof File) {
            newPreview = URL.createObjectURL(thumbnailWatched);
            setThumbnailPreview(newPreview);
        } else {
            setThumbnailPreview(null);
        }

        // Clean up the object URL that was created in THIS run
        return () => {
            if (newPreview) {
                URL.revokeObjectURL(newPreview);
            }
        };
    }, [thumbnailWatched]);

    const fetchCategories = async () => {
        try {
            const res = await categoryAPI.getAll();
            setCategories(res.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // --- Helper Functions ---
    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        // RHF setValue to update the form state with the File object
        setValue('thumbnail', file || null, { shouldValidate: true });
        e.target.value = null; // Clear the input so the same file can be selected again
    };

    // NEW: Handler for isFree change to manage price/discount side effects
    const handleIsFreeChange = (e) => {
        const isChecked = e.target.checked;

        // 1. Update the isFree value
        setValue('isFree', isChecked, { shouldValidate: true, shouldDirty: true });

        // 2. Handle side effects on other fields
        if (isChecked) {
            // Set price/discount to 0 for free courses
            setValue('price', 0, { shouldValidate: true, shouldDirty: true });
            setValue('discount', 0, { shouldValidate: true, shouldDirty: true });
        } else {
            // For paid courses, reset to default/empty if they were previously 0
            if (priceWatched === 0) setValue('price', '', { shouldValidate: true, shouldDirty: true });
            if (discountWatched === 0) setValue('discount', 0, { shouldValidate: true, shouldDirty: true }); // Keep discount at 0 or ''
        }
    };


    const calculateFinalPrice = () => {
        if (isFreeWatched) return 0;
        // Use the validated price and discount from RHF state
        const price = Number(priceWatched) || 0;
        const discount = Number(discountWatched) || 0;

        if (price <= 0 || discount >= 100) return price.toFixed(2);

        return price * (1 - discount / 100);
    };

    const calculateProgress = useCallback(() => {
        const fields = ['title', 'description', 'category', 'price', 'language', 'level'];
        const arrayFields = ['requirements', 'learningOutcomes', 'targetAudience'];

        let completed = 0;
        const total = fields.length + arrayFields.length + 1; // +1 for thumbnail

        fields.forEach(field => {
            const value = watchedFields[field];
            if (value && String(value).trim() && (field !== 'price' || (field === 'price' && (isFreeWatched || value > 0)))) completed++;
        });

        // Check if any item in the array is non-empty
        arrayFields.forEach(field => {
            const items = watchedFields[field];
            if (Array.isArray(items) && items.some(item => item && item.trim())) completed++;
        });

        if (watchedFields.thumbnail instanceof File) completed++;

        return Math.round((completed / total) * 100);
    }, [watchedFields, isFreeWatched]);

    // --- Submission Handler (RHF) (No Change) ---
    const onSubmit = async (data) => {
        // RHF has already validated the data via Zod
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Create FormData for file upload
            const submitData = new FormData();

            // Append basic fields (data is the validated object from Zod)
            submitData.append('title', data.title);
            submitData.append('description', data.description);
            submitData.append('category', data.category);
            submitData.append('level', data.level);
            submitData.append('language', data.language);
            submitData.append('isFree', data.isFree);
            submitData.append('price', data.isFree ? 0 : Number(data.price));
            submitData.append('discount', data.isFree ? 0 : Number(data.discount || 0));

            // Append array fields (filter empty strings which shouldn't happen with Zod arrayItemSchema validation)
            data.requirements.filter(r => r.trim()).forEach(req => {
                submitData.append('requirements[]', req);
            });
            data.learningOutcomes.filter(l => l.trim()).forEach(outcome => {
                submitData.append('learningOutcomes[]', outcome);
            });
            data.targetAudience.filter(t => t.trim()).forEach(audience => {
                submitData.append('targetAudience[]', audience);
            });

            // Append thumbnail if exists
            if (data.thumbnail instanceof File) {
                submitData.append('thumbnail', data.thumbnail);
            }

            const res = await courseAPI.create(submitData);
            const courseId = res.data.data?._id || res.data.data?.id;

            setMessage({ type: 'success', text: 'Course created successfully!' });

            // Redirect to courses list after 1 second
            setTimeout(() => {
                router.push(`/instructor/courses`);
            }, 1000);
        } catch (error) {
            console.error('Error creating course:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to create course',
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Check if form is dirty (RHF property) before confirming
        if (!isDirty) {
            router.push('/instructor/courses');
            return;
        }

        openConfirm({
            title: 'Discard Changes?',
            message: 'Are you sure you want to leave? All unsaved changes will be lost.',
            confirmText: 'Yes, Discard',
            cancelText: 'Keep Editing',
            variant: 'warning',
            onConfirm: () => {
                router.push('/instructor/courses');
            },
        });
    };

    // --- Render Logic ---
    if (!isReady) {
        return (
            <DashboardLayout role="instructor">
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="instructor">
            {/* Progress Bar (No Change) */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm p-4 mb-6 rounded-lg glass-card">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Form Progress</span>
                    <span className="text-sm text-primary-500 font-semibold">{calculateProgress()}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-linear-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${calculateProgress()}%` }}
                    />
                </div>
            </div>

            {/* Header (No Change) */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Create New Course</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Fill in the details below to create your course
                </p>
            </div>

            {/* Message Alert (No Change) */}
            {message.text && (
                <div
                    className={`mb-6 p-4 rounded-lg flex items-start space-x-3 animate-slide-down ${message.type === 'success'
                            ? 'bg-green-500/20 border border-green-500/20 text-green-500'
                            : 'bg-red-500/20 border border-red-500/20 text-red-500'
                        }`}
                >
                    <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>{message.text}</p>
                </div>
            )}

            {/* Form - RHF's handleSubmit wraps the custom onSubmit */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Course Thumbnail (No Change) */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4">Course Thumbnail</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Upload an eye-catching thumbnail (recommended: 1280x720px, max 5MB)
                    </p>

                    <div className="space-y-4">
                        {thumbnailPreview ? (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-dashed border-primary-500">
                                <Image
                                    src={thumbnailPreview}
                                    alt="Thumbnail preview"
                                    className="object-cover w-full h-full"
                                    width={1280}
                                    height={720}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        // Clear the value in RHF state
                                        setValue('thumbnail', null, { shouldValidate: true });
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                    <FiX className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            // File Upload Area
                            <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FiImage className="w-12 h-12 mb-3 text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        PNG, JPG or WEBP (MAX. 5MB)
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnailChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                        {errors.thumbnail && (
                            <p className="text-sm text-red-500">{errors.thumbnail.message}</p>
                        )}
                    </div>
                </div>

                {/* Basic Information (No Change) */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-6">Basic Information</h2>

                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Course Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                // RHF registration
                                {...register('title')}
                                placeholder="e.g., Complete JavaScript Course for Beginners"
                                className="w-full px-4 py-3 glass rounded-lg focus-ring"
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
                            )}
                            <p className={`mt-1 text-sm ${watchedFields.title.length > 100 ? 'text-red-500' : 'text-gray-500'
                                }`}>
                                {watchedFields.title.length}/100 characters
                            </p>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                // RHF registration
                                {...register('description')}
                                rows="6"
                                placeholder="Describe what students will learn in this course..."
                                className="w-full px-4 py-3 glass rounded-lg focus-ring"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                            )}
                            <p className={`mt-1 text-sm ${watchedFields.description.length < 50 ? 'text-red-500' : 'text-gray-500'
                                }`}>
                                {watchedFields.description.length} characters (min 50)
                            </p>
                        </div>

                        {/* Category & Level */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    // RHF registration
                                    {...register('category')}
                                    className="w-full px-4 py-3 glass rounded-lg focus-ring"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && (
                                    <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Level</label>
                                <select
                                    // RHF registration
                                    {...register('level')}
                                    className="w-full px-4 py-3 glass rounded-lg focus-ring"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                    <option value="all levels">All Levels</option>
                                </select>
                            </div>
                        </div>

                        {/* Language */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Language</label>
                            <select
                                // RHF registration
                                {...register('language')}
                                className="w-full px-4 py-3 glass rounded-lg focus-ring"
                            >
                                <option value="English">English</option>
                                <option value="Spanish">Spanish</option>
                                <option value="French">French</option>
                                <option value="German">German</option>
                                <option value="Arabic">Arabic</option>
                                <option value="Chinese">Chinese</option>
                                <option value="Hindi">Hindi</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4">Pricing</h2>

                    {/* Free Course Toggle - UPDATED to use onChange handler */}
                    <div className="mb-6 p-4 bg-primary-500/10 rounded-lg">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                // RHF registration for checkbox is REMOVED
                                // {...register('isFree')}
                                // RHF value/onChange used to manage side effects on other fields
                                checked={isFreeWatched}
                                onChange={handleIsFreeChange}
                                className="w-5 h-5 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                            />
                            <span className="ml-3 text-sm font-medium">
                                This is a free course
                            </span>
                        </label>
                        {isFreeWatched && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Free courses are great for building your audience and reputation
                            </p>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Price (USD) {!isFreeWatched && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="number"
                                // RHF registration (number fields must be coerced for number type validation)
                                // Note: For an empty string to be validly set, the number type may need adjustment
                                {...register('price', { valueAsNumber: true })}
                                placeholder="0"
                                min="0"
                                step="0.01"
                                disabled={isFreeWatched}
                                className="w-full px-4 py-3 glass rounded-lg focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            {errors.price && (
                                <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>
                            )}
                        </div>

                        {/* Discount */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Discount (%)
                            </label>
                            <input
                                type="number"
                                // RHF registration
                                {...register('discount', { valueAsNumber: true })}
                                placeholder="0"
                                min="0"
                                max="100"
                                step="1"
                                disabled={isFreeWatched}
                                className="w-full px-4 py-3 glass rounded-lg focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            {errors.discount && (
                                <p className="mt-1 text-sm text-red-500">{errors.discount.message}</p>
                            )}
                            {discountWatched > 0 && !isFreeWatched && priceWatched > 0 && (
                                <p className="mt-1 text-sm text-green-500">
                                    Final price: ${calculateFinalPrice().toFixed(2)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Learning Outcomes (Array Field) (No Change) */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4">What Students Will Learn</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Add 4-6 learning outcomes that students will achieve
                    </p>

                    <div className="space-y-3">
                        {outcomeFields.map((field, index) => (
                            <div key={field.id} className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    // RHF registration for array field
                                    {...register(`learningOutcomes.${index}`)}
                                    placeholder={`Learning outcome ${index + 1}`}
                                    className="flex-1 px-4 py-2 glass rounded-lg focus-ring"
                                />
                                {outcomeFields.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOutcome(index)}
                                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                    >
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {errors.learningOutcomes?.message && (
                        <p className="mt-2 text-sm text-red-500">{errors.learningOutcomes.message}</p>
                    )}

                    <button
                        type="button"
                        onClick={() => appendOutcome('')}
                        className="mt-4 px-4 py-2 glass-button text-sm flex items-center space-x-2"
                    >
                        <FiPlus className='w-4 h-4' />
                        <span>Add Learning Outcome</span>
                    </button>
                </div>

                {/* Requirements (Array Field) (No Change) */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4">Requirements</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        What students need before taking this course
                    </p>

                    <div className="space-y-3">
                        {reqFields.map((field, index) => (
                            <div key={field.id} className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    // RHF registration for array field
                                    {...register(`requirements.${index}`)}
                                    placeholder={`Requirement ${index + 1}`}
                                    className="flex-1 px-4 py-2 glass rounded-lg focus-ring"
                                />
                                {reqFields.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeReq(index)}
                                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                    >
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {errors.requirements?.message && (
                        <p className="mt-2 text-sm text-red-500">{errors.requirements.message}</p>
                    )}

                    <button
                        type="button"
                        onClick={() => appendReq('')}
                        className="mt-4 px-4 py-2 glass-button text-sm flex items-center space-x-2"
                    >
                        <FiPlus className='w-4 h-4' />
                        <span>Add Requirement</span>
                    </button>
                </div>

                {/* Target Audience (Array Field) (No Change) */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-bold mb-4">Target Audience</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Who is this course for?
                    </p>

                    <div className="space-y-3">
                        {audienceFields.map((field, index) => (
                            <div key={field.id} className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    // RHF registration for array field
                                    {...register(`targetAudience.${index}`)}
                                    placeholder={`Target audience ${index + 1}`}
                                    className="flex-1 px-4 py-2 glass rounded-lg focus-ring"
                                />
                                {audienceFields.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeAudience(index)}
                                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                    >
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {errors.targetAudience?.message && (
                        <p className="mt-2 text-sm text-red-500">{errors.targetAudience.message}</p>
                    )}

                    <button
                        type="button"
                        onClick={() => appendAudience('')}
                        className="mt-4 px-4 py-2 glass-button text-sm flex items-center space-x-2"
                    >
                        <FiPlus className='w-4 h-4' />
                        <span>Add Target Audience</span>
                    </button>
                </div>

                {/* Actions (No Change) */}
                <div className="flex justify-end space-x-4 sticky bottom-0 glass-card p-4">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-6 py-3 glass-button font-semibold disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Creating...</span>
                            </>
                        ) : (
                            <>
                                <FiSave className="w-5 h-5" />
                                <span>Create Course</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Confirmation Modal (No Change) */}
            <ConfirmModal
                isOpen={isOpen}
                onClose={closeConfirm}
                onConfirm={handleConfirm}
                {...config}
            />
        </DashboardLayout>
    );
}