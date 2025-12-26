'use client';

import { useState, useEffect } from 'react';
import { feedbackAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { AiOutlineEye, AiOutlineLoading3Quarters, AiOutlineInbox, AiOutlineClose } from 'react-icons/ai';
import { formatDate } from '@/lib/utils';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { FiTrash2 } from 'react-icons/fi';
import useConfirmModal from '@/hooks/useConfirmModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function AdminFeedbackPage() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const {
        isOpen: isConfirmOpen,
        openConfirm,
        closeConfirm,
        handleConfirm,
        config: confirmConfig
    } = useConfirmModal();

    // Fetch Feedbacks
    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                setLoading(true);
                //GET /feedbacks?page=1&limit=10 (havent applied sorting yet)
                const { data } = await feedbackAPI.getAll({ page: page, limit: 10 });
                const result = data.data;
                setFeedbacks(result.data || []);
                setTotalPages(result.pages || 1);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load messages");
            } finally {
                setLoading(false);
            }
        };

        fetchFeedbacks();
    }, [page]);

    // Handle Delete
    const handleDelete = (id) => {
        openConfirm({
            title: 'Delete Feedback',
            message: 'Are you sure you want to delete this message? This action cannot be undone.',
            confirmText: 'Delete',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await feedbackAPI.delete(id);
                    toast.success("Message deleted");
                    setFeedbacks(prev => prev.filter(f => f._id !== id));
                } catch (error) {
                    toast.error(error.response?.data?.message || "Failed to delete");
                }
            },
        });
    };

    const handleStatusChange = async (id, newStatus) => {
        setFeedbacks(prev => prev.map(item =>
            item._id === id ? { ...item, status: newStatus } : item
        ));

        try {
            await feedbackAPI.updateStatus(id, { status: newStatus });
            toast.success(`Status updated to ${newStatus}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    // Loading
    if (loading && feedbacks.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center">
                <AiOutlineLoading3Quarters className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <DashboardLayout role="admin">

            <div className="pb-6 pt-1  min-h-screen">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inbox & Feedback</h1>
                            <p className="text-gray-500 dark:text-gray-400">Manage contact messages and user feedback</p>
                        </div>
                    </div>

                    {/* Table Card */}
                    <div className="glass-card bg-white dark:bg-gray-800 overflow-hidden shadow-sm">
                        {feedbacks.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-sm uppercase">
                                            <th className="p-4 font-semibold">Sender</th>
                                            <th className="p-4 font-semibold">Subject</th>
                                            <th className="p-4 font-semibold">Date</th>
                                            <th className="p-4 font-semibold text-center">Status</th>
                                            <th className="p-4 font-semibold text-right pr-6">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {feedbacks.map((item) => (
                                            <tr key={item._id} className="hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-colors">
                                                {/* Sender Info */}
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-gray-900 dark:text-white">{item.name}</span>
                                                        <span className="text-sm text-gray-500">{item.email}</span>
                                                        {item.user && <span className="text-xs text-primary-500 font-medium">Registered User</span>}
                                                    </div>
                                                </td>

                                                {/* Subject */}
                                                <td className="p-4">
                                                    <span className="text-gray-700 dark:text-gray-300 font-medium truncate block max-w-[200px]">
                                                        {item.subject}
                                                    </span>
                                                </td>

                                                {/* Date */}
                                                <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                                                    {formatDate(item.createdAt) || new Date(item.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    <div className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </td>

                                                {/* Status */}
                                                <td className="p-4">
                                                    <div className="relative text-center">
                                                        <select
                                                            value={item.status}
                                                            onChange={(e) => handleStatusChange(item._id, e.target.value)}
                                                            className={`cursor-pointer px-2 py-1  text-xs font-semibold uppercase rounded-2xl  focus:outline-none focus:ring-1 focus:ring-gray-200 transition-all border-0
                                                                ${item.status === 'new' ? 'bg-green-100/50  text-green-700 ' :
                                                                    item.status === 'read' ? 'bg-gray-100 text-gray-700  ' :
                                                                        'bg-blue-100 text-blue-700  '}`
                                                            }
                                                        >
                                                            <option value="new">New</option>
                                                            <option value="read">Read</option>
                                                            <option value="replied">Replied</option>
                                                        </select>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setSelectedFeedback(item)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                            title="Read Message"
                                                        >
                                                            <AiOutlineEye />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item._id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            // Empty State
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <AiOutlineInbox className="w-16 h-16 mb-4 opacity-50" />
                                <p className="text-lg font-medium">No messages found</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-center gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/*Msg Details Modal*/}
                {selectedFeedback && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                        {selectedFeedback.subject}
                                    </h3>
                                    <div className="text-sm text-gray-500">
                                        From: <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedFeedback.name}</span> &lt;{selectedFeedback.userEmail || selectedFeedback.email}&gt;
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedFeedback(null)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    <AiOutlineClose size={24} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50 max-h-[60vh] overflow-y-auto">
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">
                                    {selectedFeedback.message}
                                </p>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                                <a
                                    href={`mailto:${selectedFeedback.email}?subject=Re: ${selectedFeedback.subject}`}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
                                >
                                    Reply via Email
                                </a>
                                <button
                                    onClick={() => setSelectedFeedback(null)}
                                    className="px-4 py-2 bg-red-500  text-gray-100  rounded-lg hover:bg-red-400 font-medium transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={closeConfirm}
                {...confirmConfig}
                onConfirm={handleConfirm}
            />
        </DashboardLayout >
    );
}