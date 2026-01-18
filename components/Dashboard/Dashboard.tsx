'use client';

import { useState } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { Player } from '@remotion/player';
import { ShortsComposition } from '@/remotion/ShortsComposition';
import { Sidebar } from './Sidebar';
import { CaptionEditor } from '@/components/Editor/CaptionEditor';
import { AdjustmentPanel } from './AdjustmentPanel';
import { ExportPanel } from './ExportPanel';
import { AudioPanel } from './AudioPanel';
import { LayoutGrid, Type, Sliders, Music, Download, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'clips' | 'captions' | 'adjust' | 'audio' | 'export';

export const Dashboard = () => {
    const { activeClipId, clips, videoUrl, sourceVideoPath, resetProject, setActiveClip } = useProjectStore();
    const activeClip = clips.find(c => c.id === activeClipId);
    const [activeTab, setActiveTab] = useState<Tab>('clips');

    if (!activeClip) return null;

    // Determine which panel to show on the right
    const renderRightPanel = () => {
        switch (activeTab) {
            case 'clips': return <Sidebar />; // Reusing Sidebar as the "Clips" panel
            case 'captions': return <CaptionEditor />;
            case 'adjust': return <AdjustmentPanel />;
            case 'audio': return <AudioPanel />;
            case 'export': return <ExportPanel />;
            default: return <Sidebar />;
        }
    };

    return (
        <div className="h-screen bg-black text-white flex overflow-hidden font-sans">
            {/* 1. Left Navigation Rail */}
            <div className="w-20 border-r border-white/10 flex flex-col items-center py-6 bg-slate-950 z-20">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-lg mb-8 shadow-lg shadow-purple-900/20">
                    C
                </div>

                <div className="flex flex-col gap-4 w-full px-2">
                    {[
                        { id: 'clips', icon: LayoutGrid, label: 'Clips' },
                        { id: 'captions', icon: Type, label: 'Text' },
                        { id: 'adjust', icon: Sliders, label: 'Edit' },
                        { id: 'audio', icon: Music, label: 'Audio' },
                        { id: 'export', icon: Download, label: 'Export' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as Tab)}
                            className={`
                                flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-all w-full group relative
                                ${activeTab === item.id
                                    ? 'bg-purple-500/10 text-purple-400'
                                    : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}
                            `}
                        >
                            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'fill-current' : ''}`} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                            {activeTab === item.id && (
                                <motion.div layoutId="activeTab" className="absolute left-0 w-1 h-8 bg-purple-500 rounded-r-full" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="mt-auto">
                    <button
                        onClick={resetProject}
                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 flex items-center justify-center transition-colors"
                        title="Exit Project"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* 2. Main Workspace (Center) */}
            <div className="flex-1 flex flex-col bg-slate-900/50 relative">
                {/* Top Bar */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/20 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <h1 className="font-bold text-slate-200">Project: Viral Shorts</h1>
                        <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">Saved</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-xs text-slate-500 font-mono">00:00 / {((activeClip.end - activeClip.start)).toFixed(1)}s</div>
                    </div>
                </header>

                {/* Player Area */}
                <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-slate-950/50 to-slate-950 -z-10" />

                    <div className="relative h-full aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl shadow-black ring-1 ring-white/10">
                        <Player
                            key={activeClip.id + activeClip.theme.captionStyle + activeClip.theme.captionColor + activeClip.theme.bgMusicVolume}
                            component={ShortsComposition}
                            inputProps={{
                                videoSrc: sourceVideoPath || videoUrl, // Use local path if available
                                captions: activeClip.words,
                                title: `Clip ${parseInt(activeClip.id) + 1}`,
                                clipStart: activeClip.start,
                                captionStyle: activeClip.theme.captionStyle,
                                captionColor: activeClip.theme.captionColor,
                                bgMusicUrl: activeClip.theme.bgMusicUrl,
                                bgMusicVolume: activeClip.theme.bgMusicVolume,
                                voiceoverUrl: activeClip.theme.voiceoverUrl,
                                brightness: activeClip.adjustments?.brightness ?? 1,
                                contrast: activeClip.adjustments?.contrast ?? 1,
                                saturation: activeClip.adjustments?.saturation ?? 1
                            }}
                            durationInFrames={30 * (activeClip.end - activeClip.start)}
                            fps={30}
                            compositionWidth={1080}
                            compositionHeight={1920}
                            style={{ width: '100%', height: '100%' }}
                            controls
                        />
                    </div>
                </div>

                {/* Bottom Timeline (Simplified for now) */}
                <div className="h-32 border-t border-white/10 bg-black/40 backdrop-blur-md p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                        <span>Timeline</span>
                        <span>{clips.length} Clips</span>
                    </div>
                    <div className="flex-1 bg-white/5 rounded-lg border border-white/5 relative overflow-hidden flex items-center px-2 gap-1 overflow-x-auto custom-scrollbar">
                        {clips.map((clip, i) => (
                            <div
                                key={clip.id}
                                className={`
                                    h-16 rounded-md border transition-all cursor-pointer relative group overflow-hidden flex-shrink-0
                                    ${activeClipId === clip.id ? 'bg-purple-500/20 border-purple-500 w-48' : 'bg-white/5 border-white/5 w-24 hover:bg-white/10'}
                                `}
                                onClick={() => setActiveClip(clip.id)}
                            >
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:text-slate-300">
                                    Clip {i + 1}
                                </div>
                                {activeClipId === clip.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Right Contextual Panel */}
            <div className="w-96 border-l border-white/10 bg-slate-950 flex flex-col z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 overflow-y-auto custom-scrollbar"
                    >
                        {renderRightPanel()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
