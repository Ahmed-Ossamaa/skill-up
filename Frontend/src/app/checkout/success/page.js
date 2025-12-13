import Link from "next/link";


export default function CheckoutSuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
            <h1 className="text-4xl font-bold text-green-600 mb-4">
                Payment Successful!
            </h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-xl">
                Your payment has been processed successfully.
                You are now enrolled in the course!
            </p>

            <Link
                href="/courses"
                className="mt-8 bg-primary-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-primary-600 transition"
            >
                Go to My Courses
            </Link>
        </div>
    );
}
