import StripeCheckout from "@/components/payment/StripeCheckoutForm";
import CourseCard from "@/components/courses/CourseCard";
import Header from "@/components/layout/Header";

export default async function CheckoutPage({ params }) {
    const resolved = await params;
    const courseId = resolved.courseId;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`, { cache: "no-store" });
    const course = (await res.json()).data;

    if (!course) return <p>Course not found</p>;

    return (
        <div className="min-h-screen">
            <Header />
            <div className="container mx-auto px-4 pb-10 pt-30 grid lg:grid-cols-2 gap-10">
                <StripeCheckout course={course} />
                <CourseCard course={course} variant="checkout" />
            </div>
        </div>
    );
}
