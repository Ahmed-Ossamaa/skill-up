'use client';

import { FiAlertTriangle, FiX, FiCheck } from 'react-icons/fi';
import { cn } from '@/lib/utils';


export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger', // 'danger', 'warning', 'info', 'success'
    loading = false,
}) {
    if (!isOpen) return null;

    const typeStyles = {
        danger: {
            icon: FiAlertTriangle,
            iconBg: 'bg-red-500/20',
            iconColor: 'text-red-500',
            button: 'bg-red-500 hover:bg-red-600',
        },
        warning: {
            icon: FiAlertTriangle,
            iconBg: 'bg-yellow-500/20',
            iconColor: 'text-yellow-500',
            button: 'bg-yellow-500 hover:bg-yellow-600',
        },
        info: {
            icon: FiAlertTriangle,
            iconBg: 'bg-blue-500/20',
            iconColor: 'text-blue-500',
            button: 'bg-blue-500 hover:bg-blue-600',
        },
        success: {
            icon: FiCheck,
            iconBg: 'bg-green-500/20',
            iconColor: 'text-green-500',
            button: 'bg-green-500 hover:bg-green-600',
        },
    };

    const style = typeStyles[type];
    const Icon = style.icon;

    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-100 p-4"
            onClick={onClose}
        >
            <div
                className="glass-card p-6 max-w-md w-full animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className={cn('w-16 h-16 rounded-full flex items-center justify-center', style.iconBg)}>
                        <Icon className={cn('w-8 h-8', style.iconColor)} />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl text-gray-200 font-bold text-center mb-3">{title}</h2>

                {/* Message */}
                <p className="text-white text-center mb-6">{message}</p>

                {/* Actions */}
                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-3 glass-button font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className={cn(
                            'flex-1 px-4 py-3 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
                            style.button
                        )}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center space-x-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Processing...</span>
                            </span>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}