import { notFound } from 'next/navigation';
import { courseAPI, reviewAPI } from '@/lib/api';
import CourseDetailsClient from '@/components/courses/client/CourseDetailsClient';

// Metadata
export async function generateMetadata({ params }) {
    try {
        const { id } = await params;
        const res = await courseAPI.getCourseContent(id);
        const course = res.data?.data || res.data;
        if (!course) {
            return {
                title: 'Course Not Found',
            };
        }

        return {
            title: `${course.title} | SkillUp`,
            description:  course.description?.substring(0, 160),
            openGraph: {
                title: course.title,
                description: course?.description?.substring(0, 160),
                images: [
                    {
                        url: course?.thumbnail?.url || '/placeholder-course.png',
                        width: 1200,
                        height: 630,
                    },
                ],
                type: 'website',
            },
        };
    } catch (error) {
        return {
            title: 'Course Details',
        };
    }
}

export default async function Page({ params }) {
    const { id } = await params;
    let course = null;
    let reviews = [];

    try {
        const [courseRes, reviewRes] = await Promise.all([
            courseAPI.getCourseContent(id),
            reviewAPI.getAll({ course: id })
        ]);
        course = courseRes.data?.data ;
        reviews = reviewRes.data?.data?.data || [];

    } catch (err) {
        console.error('Error fetching course data on server:', err);
    }

    if (!course) {
        notFound();
    }
    return <CourseDetailsClient course={course} initialReviews={reviews} />;
}