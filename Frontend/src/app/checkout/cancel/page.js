import Link from "next/link";

export default function CheckoutCancelPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
            <h1 className="text-4xl font-bold text-red-600 mb-4">
                Payment Canceled
            </h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-xl">
                Your payment was not completed.  
                You can try again anytime.
            </p>

            <Link
                href="/courses"
                className="mt-8 bg-gray-900 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-700 transition"
            >
                Back to Courses
            </Link>
        </div>
    );
}
