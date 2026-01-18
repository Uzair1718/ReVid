'use client';

import { useEffect } from 'react';

export const CaptionSimulator = ({ onTimeUpdate, isImage }: { onTimeUpdate: (t: number) => void, isImage: boolean }) => {
    useEffect(() => {
        if (!isImage) return;
        const interval = setInterval(() => {
            onTimeUpdate((Date.now() / 1000) % 100); // Continuous time
        }, 100);
        return () => clearInterval(interval);
    }, [isImage, onTimeUpdate]);

    return null;
};
