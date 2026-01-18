'use client';
'use client';

import { useProjectStore } from '@/store/useProjectStore';
import { motion } from 'framer-motion';
import { Sun, Contrast, Droplets } from 'lucide-react';

export const AdjustmentPanel = () => {
    const { clips, activeClipId, updateClipAdjustments, setClips } = useProjectStore();
    const activeClip = clips.find(c => c.id === activeClipId);

    if (!activeClip) return <div className="p-6 text-slate-500 text-sm">Select a clip to adjust</div>;

    const adjustments = activeClip.adjustments || { brightness: 1, contrast: 1, saturation: 1 };

    const handleUpdate = (key: 'brightness' | 'contrast' | 'saturation', value: number) => {
        updateClipAdjustments(activeClip.id, { [key]: value });
    };

    const handleTimingChange = (field: 'start' | 'end', value: string) => {
        const val = parseFloat(value);
        if (isNaN(val)) return;

        const updatedClips = clips.map(c =>
            c.id === activeClip.id ? { ...c, [field]: val } : c
        );
        setClips(updatedClips);
    };

    return (
        <div className="p-6 space-y-8">
            <div>
                <h3 className="font-bold text-white text-lg mb-4">Clip Settings</h3>
                <p className="text-xs text-slate-400 mb-6">Fine-tune your clip duration and look.</p>

                <div className="space-y-6">
                    {/* Timing Controls */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            Timing
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 font-bold">START (s)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={activeClip.start}
                                    onChange={(e) => handleTimingChange('start', e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 font-bold">END (s)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={activeClip.end}
                                    onChange={(e) => handleTimingChange('end', e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stabilization (Visual Only) */}
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                                    <Contrast className="w-4 h-4" />
                                </motion.div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-200">Stabilization</div>
                                <div className="text-[10px] text-slate-500">Reduce camera shake</div>
                            </div>
                        </div>
                        <div className="w-10 h-5 bg-purple-600 rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                        </div>
                    </div>

                    {/* Brightness */}
                    <div className="space-y-3 pt-2">
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <Sun className="w-3 h-3" />
                                <span>Brightness</span>
                            </div>
                            <span className="text-white">{(adjustments.brightness * 100).toFixed(0)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0.5" max="1.5" step="0.05"
                            value={adjustments.brightness}
                            onChange={(e) => handleUpdate('brightness', parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
                        />
                    </div>

                    {/* Contrast */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <Contrast className="w-3 h-3" />
                                <span>Contrast</span>
                            </div>
                            <span className="text-white">{(adjustments.contrast * 100).toFixed(0)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0.5" max="1.5" step="0.05"
                            value={adjustments.contrast}
                            onChange={(e) => handleUpdate('contrast', parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
                        />
                    </div>

                    {/* Saturation */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <Droplets className="w-3 h-3" />
                                <span>Saturation</span>
                            </div>
                            <span className="text-white">{(adjustments.saturation * 100).toFixed(0)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0" max="2" step="0.1"
                            value={adjustments.saturation}
                            onChange={(e) => handleUpdate('saturation', parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
