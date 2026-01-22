'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';

interface ExportProgressProps {
    progress: number;
    isExporting: boolean;
    currentClip?: number;
    totalClips?: number;
    status?: 'rendering' | 'downloading' | 'complete' | 'error';
    errorMessage?: string;
}

export const ExportProgress: React.FC<ExportProgressProps> = ({
    progress,
    isExporting,
    currentClip,
    totalClips,
    status = 'rendering',
    errorMessage
}) => {
    const getStatusMessage = () => {
        if (status === 'error') return 'Export failed';
        if (status === 'complete') return 'Export complete!';
        if (status === 'downloading') return 'Processing video...';
        return 'Rendering...';
    };

    const getStatusIcon = () => {
        if (status === 'error') return <AlertCircle className="w-5 h-5 text-red-500" />;
        if (status === 'complete') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
        if (status === 'downloading') return <Download className="w-5 h-5 text-blue-500" />;
        return <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />;
    };

    return (
        <div className="space-y-3">
            {/* Progress Bar */}
            <div className="h-3 bg-black/40 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", damping: 20 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                />
            </div>

            {/* Status Text */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <span className="text-sm font-semibold text-white">
                        {getStatusMessage()}
                    </span>
                </div>
                <span className="text-sm font-bold text-purple-400">{progress}%</span>
            </div>

            {/* Clip Counter for Batch Export */}
            {totalClips && currentClip !== undefined && (
                <div className="text-xs text-slate-400">
                    Processing clip {currentClip + 1} of {totalClips}
                </div>
            )}

            {/* Error Message */}
            {errorMessage && status === 'error' && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-xs text-red-400">{errorMessage}</p>
                </div>
            )}
        </div>
    );
};
