'use client';

import { useProjectStore } from '@/store/useProjectStore';
import { motion } from 'framer-motion';
import { Download, Loader2, FileVideo, Share2, RotateCcw, Zap } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ExportProgress } from './ExportProgress';

type ExportStatus = 'rendering' | 'downloading' | 'complete' | 'error' | undefined;
type QualityPreset = 'draft' | 'standard' | 'premium';

export const ExportPanel = () => {
    const { activeClipId, clips, videoUrl, sourceVideoPath, exportSettings, setExportSettings, language, setLanguage } = useProjectStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [exportStatus, setExportStatus] = useState<ExportStatus>(undefined);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [qualityPreset, setQualityPreset] = useState<QualityPreset>('draft'); // Default to draft for speed
    const [currentClip, setCurrentClip] = useState(0);
    const [batchMode, setBatchMode] = useState(false);
    const isMountedRef = useRef(true);
    const activeClip = clips.find(c => c.id === activeClipId);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const handleExport = async () => {
        if (!activeClip) return;

        setIsProcessing(true);
        setExportStatus('rendering');
        setErrorMessage('');
        setExportSettings({ isExporting: true, progress: 5 }); // Start at 5%

        try {
            const inputProps = {
                videoSrc: sourceVideoPath || videoUrl,
                captions: activeClip.words,
                title: `Clip ${parseInt(activeClip.id) + 1}`,
                clipStart: activeClip.start,
                clipEnd: activeClip.end,
                captionStyle: activeClip.theme.captionStyle,
                captionColor: activeClip.theme.captionColor,
                bgMusicUrl: activeClip.theme.bgMusicUrl || undefined,
                bgMusicVolume: activeClip.theme.bgMusicVolume
            };

            // Estimate render time and show realistic progress
            const startTime = Date.now();
            const estimatedRenderTime = 60000; // Estimate 60 seconds for full render

            const progressInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const estimatedProgress = Math.min(5 + (elapsed / estimatedRenderTime) * 85, 95);
                
                if (isMountedRef.current) {
                    setExportSettings({
                        progress: Math.round(estimatedProgress)
                    });
                }
            }, 500);

            const response = await fetch('/api/render', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputProps,
                    compositionId: 'ShortsComposition',
                    format: exportSettings.format || 'mp4',
                    resolution: exportSettings.resolution || '1080p',
                    quality: qualityPreset,
                    language: language
                }),
            });

            clearInterval(progressInterval);
            
            if (isMountedRef.current) {
                setExportSettings({ isExporting: true, progress: 90 }); // Almost done
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Export failed');
            }

            if (isMountedRef.current) {
                setExportStatus('downloading');
                setExportSettings({ isExporting: true, progress: 95 }); // Processing blob
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

            if (isMountedRef.current) {
                setExportStatus('complete');
                setExportSettings({ isExporting: false, progress: 100 });
            }
        } catch (error) {
            console.error("Export error:", error);
            const message = error instanceof Error ? error.message : "Unknown error";
            if (isMountedRef.current) {
                setExportStatus('error');
                setErrorMessage(message);
                setExportSettings({ isExporting: false, progress: 0 });
            }
        } finally {
            if (isMountedRef.current) {
                setIsProcessing(false);
            }
        }
    };

    const handleBatchExport = async () => {
        if (clips.length === 0) {
            setErrorMessage("No clips to export");
            return;
        }

        setIsProcessing(true);
        setBatchMode(true);
        setExportStatus('rendering');
        setErrorMessage('');
        
        let successCount = 0;
        let failureCount = 0;

        for (let i = 0; i < clips.length; i++) {
            const clip = clips[i];
            setCurrentClip(i);
            
            try {
                setExportSettings({ isExporting: true, progress: Math.floor((i / clips.length) * 100) + 5 });

                const inputProps = {
                    videoSrc: sourceVideoPath || videoUrl,
                    captions: clip.words,
                    title: `Clip ${parseInt(clip.id) + 1}`,
                    clipStart: clip.start,
                    clipEnd: clip.end,
                    captionStyle: clip.theme.captionStyle,
                    captionColor: clip.theme.captionColor,
                    bgMusicUrl: clip.theme.bgMusicUrl || undefined,
                    bgMusicVolume: clip.theme.bgMusicVolume
                };

                const response = await fetch('/api/render', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        inputProps,
                        compositionId: 'ShortsComposition',
                        format: exportSettings.format || 'mp4',
                        resolution: exportSettings.resolution || '1080p',
                        quality: qualityPreset,
                        language: language
                    }),
                });

                if (!response.ok) {
                    failureCount++;
                    console.error(`Failed to render clip ${parseInt(clip.id) + 1}`);
                    continue;
                }

                if (isMountedRef.current) {
                    setExportStatus('downloading');
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `clip-${parseInt(clip.id) + 1}.mp4`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                successCount++;
                
                // Small delay between clips to prevent overload
                await new Promise(resolve => setTimeout(resolve, 800));

            } catch (error) {
                console.error(`Export error for clip ${parseInt(clip.id) + 1}:`, error);
                failureCount++;
            }
        }

        if (isMountedRef.current) {
            setExportStatus('complete');
            setExportSettings({ isExporting: false, progress: 100 });
            const summary = `✓ ${successCount}/${clips.length} exported${failureCount > 0 ? ` (${failureCount} failed)` : ''}`;
            setErrorMessage(summary);
            setBatchMode(false);
        }

        if (isMountedRef.current) {
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

                    {/* Language Selection */}
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Caption Language</span>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setLanguage('en')}
                                className={`p-3 rounded-lg text-xs font-bold transition-all ${language === 'en' ? 'bg-blue-500 text-white shadow-lg' : 'bg-black/40 text-slate-400 hover:bg-white/10'}`}
                            >
                                🇬🇧 English
                            </button>
                            <button
                                onClick={() => setLanguage('hi')}
                                className={`p-3 rounded-lg text-xs font-bold transition-all ${language === 'hi' ? 'bg-orange-500 text-white shadow-lg' : 'bg-black/40 text-slate-400 hover:bg-white/10'}`}
                            >
                                🇮🇳 Hindi
                            </button>
                            <button
                                onClick={() => setLanguage('ur')}
                                className={`p-3 rounded-lg text-xs font-bold transition-all ${language === 'ur' ? 'bg-green-500 text-white shadow-lg' : 'bg-black/40 text-slate-400 hover:bg-white/10'}`}
                            >
                                🇵🇰 Urdu
                            </button>
                            <button
                                onClick={() => setLanguage('ps')}
                                className={`p-3 rounded-lg text-xs font-bold transition-all ${language === 'ps' ? 'bg-red-500 text-white shadow-lg' : 'bg-black/40 text-slate-400 hover:bg-white/10'}`}
                            >
                                🇦🇫 Pashto
                            </button>
                        </div>
                    </div>

                    {/* Quality Selection */}
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Render Quality</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setQualityPreset('draft')}
                                className={`p-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 ${qualityPreset === 'draft' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-black/40 text-slate-400 hover:bg-white/10'}`}
                            >
                                <Zap className="w-4 h-4" />
                                DRAFT
                                <span className="text-xs opacity-75 font-normal">~30s</span>
                            </button>
                            <button
                                onClick={() => setQualityPreset('standard')}
                                className={`p-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 ${qualityPreset === 'standard' ? 'bg-purple-500 text-white shadow-lg' : 'bg-black/40 text-slate-400 hover:bg-white/10'}`}
                            >
                                <FileVideo className="w-4 h-4" />
                                STANDARD
                                <span className="text-xs opacity-75 font-normal">~2min</span>
                            </button>
                            <button
                                onClick={() => setQualityPreset('premium')}
                                className={`p-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 ${qualityPreset === 'premium' ? 'bg-indigo-500 text-white shadow-lg' : 'bg-black/40 text-slate-400 hover:bg-white/10'}`}
                            >
                                <FileVideo className="w-4 h-4" />
                                PREMIUM
                                <span className="text-xs opacity-75 font-normal">~5min</span>
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
                        {isProcessing && !batchMode ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Rendering...
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                Export {exportSettings.format.toUpperCase()}
                            </>
                        )}
                    </button>

                    {/* Batch Export Button */}
                    <button
                        onClick={handleBatchExport}
                        disabled={isProcessing}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-slate-300 text-sm transition-all flex items-center justify-center gap-2 border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Share2 className="w-4 h-4" />
                        {isProcessing && batchMode ? 'Exporting All...' : `Export All Clips (${clips.length})`}
                    </button>

                    {/* Progress Display */}
                    {(isProcessing || exportStatus !== undefined) && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-white/5 rounded-xl border border-white/10"
                        >
                            <ExportProgress
                                progress={exportSettings.progress}
                                isExporting={isProcessing}
                                status={exportStatus as 'rendering' | 'downloading' | 'complete' | 'error'}
                                errorMessage={errorMessage}
                                currentClip={batchMode ? currentClip : undefined}
                                totalClips={batchMode ? clips.length : undefined}
                            />
                        </motion.div>
                    )}

                    {/* Retry Button on Error */}
                    {exportStatus === 'error' && (
                        <button
                            onClick={() => {
                                setExportStatus(undefined);
                                setErrorMessage('');
                                handleExport();
                            }}
                            className="w-full py-2 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg text-orange-400 text-sm font-semibold transition-all flex items-center justify-center gap-2 border border-orange-500/30"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Retry Export
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
