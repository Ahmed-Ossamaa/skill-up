'use client';
import { useState } from 'react';
import useAuthStore from '@/store/authStore';
import { toast } from 'react-hot-toast';

export default function PaymentButton({ course }) {
    const { accessToken } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const handlePay = async () => {
        try {
            setLoading(true);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/create-checkout-session`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ courseId: course._id }),
            });
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            window.location.href = data.url; // redirect user to Stripe
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold"
        >
            {loading ? "Redirecting..." : `Pay $${course.price}`}
        </button>
    );
}
