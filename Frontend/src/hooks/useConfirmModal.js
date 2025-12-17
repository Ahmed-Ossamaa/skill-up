'use client';

import { useState } from 'react';

export default function useConfirmModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState({
        title: 'Confirm Action',
        message: 'Are you sure?',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'danger',
        onConfirm: () => { },
    });

    const openConfirm = ({
        title,
        message,
        confirmText,
        cancelText,
        type = 'danger',
        onConfirm,
    }) => {
        setConfig({
            title: title || 'Confirm Action',
            message: message || 'Are you sure?',
            confirmText: confirmText || 'Confirm',
            cancelText: cancelText || 'Cancel',
            type,
            onConfirm: onConfirm || (() => { }),
        });
        setIsOpen(true);
    };

    const closeConfirm = () => {
        setIsOpen(false);
    };

    const handleConfirm = async () => {
        await config.onConfirm();
        closeConfirm();
    };

    return {
        isOpen,
        config,
        openConfirm,
        closeConfirm,
        handleConfirm,
    };
}