// 'use client';

// import { useState, useEffect } from "react";
// import { Elements } from "@stripe/react-stripe-js";
// import { loadStripe } from "@stripe/stripe-js";
// import StripePaymentForm from "./StripePaymentFrom";



// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// export default function CheckoutPage({ course }) {
//     return (
//         <Elements stripe={stripePromise}>
//             <StripePaymentForm course={course} />
//         </Elements>
//     );
// }

'use client';

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import useAuthStore from "@/store/authStore";
import { toast } from "react-hot-toast";

export default function StripeCheckout({ course }) {
    const { accessToken } = useAuthStore();
    const [clientSecret, setClientSecret] = useState("");
    const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

    useEffect(() => {
        if (!accessToken) return;

        const createPaymentIntent = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-payment-intent`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ courseId: course._id })
                });

                const data = await res.json();

                if (!res.ok) throw new Error(data.message || "Failed to create payment intent");

                setClientSecret(data.clientSecret);
            } catch (err) {
                console.error(err);
                toast.error(err.message);
            }
        };

        createPaymentIntent();
    }, [accessToken, course._id]);

    if (!clientSecret) return <p>Loading payment info...</p>;

    return (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm course={course} />
        </Elements>
    );
}

function CheckoutForm({ course }) {
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
            <input type="text" value={user?.name} readOnly className="w-full border rounded px-3 py-2" />
            <input type="email" value={user?.email} readOnly className="w-full border rounded px-3 py-2" />

            {/* Stripe Payment Element */}
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


