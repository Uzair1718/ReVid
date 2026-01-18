'use client';

import { useProjectStore } from '@/store/useProjectStore';
import { motion } from 'framer-motion';
import { Download, Loader2, FileVideo, Share2 } from 'lucide-react';
import { useState } from 'react';

export const ExportPanel = () => {
    const { activeClipId, clips, videoUrl, exportSettings, setExportSettings } = useProjectStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const activeClip = clips.find(c => c.id === activeClipId);

    const handleExport = async () => {
        if (!activeClip) return;

        setIsProcessing(true);
        setExportSettings({ isExporting: true, progress: 10 }); // Start progress

        try {
            const inputProps = {
                videoSrc: videoUrl,
                captions: activeClip.words,
                title: `Clip ${parseInt(activeClip.id) + 1}`,
                clipStart: activeClip.start,
                captionStyle: activeClip.theme.captionStyle,
                captionColor: activeClip.theme.captionColor,
                bgMusicUrl: activeClip.theme.bgMusicUrl,
                bgMusicVolume: activeClip.theme.bgMusicVolume
            };

            const response = await fetch('/api/render', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputProps,
                    compositionId: 'ShortsComposition'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Export failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `clip-${parseInt(activeClip.id) + 1}.mp4`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setExportSettings({ isExporting: false, progress: 100 });
        } catch (error) {
            console.error("Export error:", error);
            alert("Export Failed: " + (error instanceof Error ? error.message : "Unknown error"));
            setExportSettings({ isExporting: false, progress: 0 });
        } finally {
            setIsProcessing(false);
        }
    };

    if (!activeClipId) return <div className="p-6 text-slate-500 text-sm">Select a clip to export</div>;

    return (
        <div className="p-6 space-y-8 h-full flex flex-col">
            <div>
                <h3 className="font-bold text-white text-lg mb-4">Export & Share</h3>
                <p className="text-xs text-slate-400 mb-6">Render your viral short in high quality.</p>

                <div className="space-y-6">
                    {/* Format Selection */}
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Format</span>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setExportSettings({ format: 'mp4' })}
                                className={`p-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${exportSettings.format === 'mp4' ? 'bg-purple-500 text-white shadow-lg' : 'bg-black/40 text-slate-400 hover:bg-white/10'}`}
                            >
                                <FileVideo className="w-4 h-4" /> MP4
                            </button>
                            <button
                                onClick={() => setExportSettings({ format: 'mov' })}
                                className={`p-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${exportSettings.format === 'mov' ? 'bg-purple-500 text-white shadow-lg' : 'bg-black/40 text-slate-400 hover:bg-white/10'}`}
                            >
                                <FileVideo className="w-4 h-4" /> MOV
                            </button>
                        </div>
                    </div>

                    {/* Resolution Selection */}
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Resolution</span>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setExportSettings({ resolution: '1080p' })}
                                className={`p-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${exportSettings.resolution === '1080p' ? 'bg-purple-500 text-white shadow-lg' : 'bg-black/40 text-slate-400 hover:bg-white/10'}`}
                            >
                                HD
                                <span className="text-xs font-normal opacity-60">1080p</span>
                            </button>
                            <button
                                onClick={() => setExportSettings({ resolution: '720p' })}
                                className={`p-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${exportSettings.resolution === '720p' ? 'bg-purple-500 text-white shadow-lg' : 'bg-black/40 text-slate-400 hover:bg-white/10'}`}
                            >
                                HD
                                <span className="text-xs font-normal opacity-60">720p</span>
                            </button>
                        </div>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        disabled={isProcessing}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl font-bold text-white shadow-xl shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Rendering {exportSettings.progress}%
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                Export {exportSettings.format.toUpperCase()}
                            </>
                        )}
                    </button>

                    {/* Batch Export (Visual Only for now) */}
                    <button
                        className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-slate-300 text-sm transition-all flex items-center justify-center gap-2 border border-white/5"
                        onClick={() => alert("Batch Export started! (Simulation)")}
                    >
                        <Share2 className="w-4 h-4" />
                        Export All Clips ({clips.length})
                    </button>

                    {exportSettings.progress > 0 && isProcessing && (
                        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${exportSettings.progress}%` }}
                                className="h-full bg-purple-500"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
