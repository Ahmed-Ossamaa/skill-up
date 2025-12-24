'use client';
import { useEffect, useState } from 'react';
import {adminAPI} from '@/lib/api';
import { FiFileText, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function AdminRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [actionType, setActionType] = useState(null); // approved || rejected
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await adminAPI.getAllRequests();
            setRequests(res.data.data);
        } catch (err) {
            toast.error("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    const openReviewModal = (request, type) => {
        setSelectedRequest(request);
        setActionType(type);
        setFeedback('');
    };

    const closeReviewModal = () => {
        setSelectedRequest(null);
        setActionType(null);
    };

    const handleSubmitReview = async () => {
        if (!selectedRequest || !actionType) return;

        setIsSubmitting(true);
        try {
            await adminAPI.reviewRequest(selectedRequest._id, {
                status: actionType,
                feedback: feedback
            });

            toast.success(`Request ${actionType} successfully`);

            setRequests(prev => prev.map(req => 
                req._id === selectedRequest._id 
                    ? { ...req, status: actionType } 
                    : req
            ));
            
            closeReviewModal();
        } catch (error) {
            toast.error(error.response?.data?.message || "Action failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <DashboardLayout role="admin">
        <div className="py-6">
            <h2 className="text-2xl font-bold mb-6">Instructor Applications</h2>
            
            <div className="glass-card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="p-4">Applicant</th>
                            <th className="p-4">Documents</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center ">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {requests.map((req) => (
                            <tr key={req._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                                <td className="p-4">
                                    <div className="font-bold text-gray-900 dark:text-white">{req.user?.name}</div>
                                    <div className="text-sm text-gray-500">{req.user?.email}</div>
                                    <div className="text-xs text-gray-400 mt-1">Exp: {req.experience?.substring(0, 30)}...</div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-2">
                                        <DocLink url={req.documents.nationalId.url} label="ID" />
                                        <DocLink url={req.documents.certificate.url} label="Cert" />
                                        <DocLink url={req.documents.resume.url} label="CV" />
                                    </div>
                                </td>
                                <td className="p-4">
                                    <StatusBadge status={req.status} />
                                </td>
                                <td className="p-4 text-center">
                                    {req.status === 'pending' ? (
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => openReviewModal(req, 'approved')}
                                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                                title="Approve"
                                            >
                                                <FiCheck className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => openReviewModal(req, 'rejected')}
                                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                title="Reject"
                                            >
                                                <FiX className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">Reviewed</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- Review Modal --- */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-bold mb-2 capitalize">
                            {actionType === 'approved' ? 'Approve Request' : 'Reject Request'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            You are about to {actionType} the application for <strong>{selectedRequest.user?.name}</strong>.
                        </p>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">
                                Feedback / Reason <span className="text-gray-400 font-normal">(Optional)</span>
                            </label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                rows="3"
                                placeholder={actionType === 'rejected' ? "Please explain why..." : "Welcome to the team!"}
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button 
                                onClick={closeReviewModal}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSubmitReview}
                                disabled={isSubmitting}
                                className={`px-4 py-2 text-white rounded-lg font-medium transition-all ${
                                    actionType === 'approved' 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {isSubmitting ? 'Processing...' : `Confirm ${actionType === 'approved' ? 'Approval' : 'Rejection'}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </DashboardLayout>
    );
}


function DocLink({ url, label }) {
    if (!url) return null;
    return (
        <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 bg-gray-100 border-gray-200 dark:border-gray-700 rounded text-xs hover:text-primary-600 hover:border-primary-500 transition-colors"
        >
            <FiFileText className="w-3 h-3" /> {label}
        </a>
    );
}

function StatusBadge({ status }) {
    const styles = {
        pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
        approved: "bg-green-100 text-green-700 border-green-200",
        rejected: "bg-red-100 text-red-700 border-red-200"
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
            {status.toUpperCase()}
        </span>
    );
}