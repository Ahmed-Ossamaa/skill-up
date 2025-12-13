'use client';

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { toast } from "react-hot-toast";
import useAuthStore from "@/store/authStore";

export default function StripePaymentForm({ course }) {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useAuthStore();

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/checkout/success`,
            },
        });

        if (error) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>

            {/* User Info */}
            <div className="space-y-2">
                <label className="block text-sm font-medium">Name</label>
                <input value={user?.name} readOnly className="w-full border rounded px-3 py-2" />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium">Email</label>
                <input value={user?.email} readOnly className="w-full border rounded px-3 py-2" />
            </div>

            {/* Stripe Element */}
            <PaymentElement />

            <button
                disabled={loading || !stripe}
                className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition"
            >
                {loading ? "Processing..." : `Pay $${course.price}`}
            </button>
        </form>
    );
}
