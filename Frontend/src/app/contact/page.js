import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import React from 'react';


export default function ContactPage() {
return (
    <>
    <Header />
    <div className="container mx-auto px-4 py-8 pt-30">
        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
        <p className="text-gray-600">If you have any questions or feedback, please dont hesitate to contact us.</p>

        {/* //.................// */}
        <p>to be added later</p>
    </div>
    <Footer/>
    </>
);
}