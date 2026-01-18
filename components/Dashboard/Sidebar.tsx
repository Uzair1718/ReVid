'use client';

import { motion } from 'framer-motion';
import { useProjectStore } from '@/store/useProjectStore';

export const Sidebar = () => {
    const { clips, activeClipId, setActiveClip } = useProjectStore();

    return (
        <div className="w-80 border-r border-white/5 bg-black/20 flex flex-col backdrop-blur-md">
            <div className="p-6 border-b border-white/5">
                <h3 className="font-bold text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-1">Generated Clips</h3>
                <div className="font-bold text-white text-lg">{clips.length} Viral Moments</div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {clips.map((clip, i) => (
                    <motion.div
                        key={clip.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => setActiveClip(clip.id)}
                        className={`
                            group p-4 rounded-2xl cursor-pointer transition-all border relative overflow-hidden
                            ${activeClipId === clip.id
                                ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/30'
                                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 hover:scale-[1.02]'
                            }
                        `}
                    >
                        <div className="flex justify-between items-start mb-3 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono transition-colors
                                    ${activeClipId === clip.id ? 'bg-purple-500 text-white shadow-lg' : 'bg-white/10 text-slate-400 group-hover:bg-white/20'}
                                `}>
                                    {i + 1}
                                </div>
                                <div>
                                    <span className={`block font-bold text-sm ${activeClipId === clip.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                        Clip {i + 1}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                        {clip.start.toFixed(1)}s - {clip.end.toFixed(1)}s
                                    </span>
                                </div>
                            </div>
                            <div className={`
                                w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                                ${activeClipId === clip.id ? 'border-purple-500 bg-purple-500 text-white' : 'border-slate-600 group-hover:border-slate-400'}
                            `}>
                                {activeClipId === clip.id && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`
                                    text-[10px] font-bold px-2 py-0.5 rounded-full border
                                    ${activeClipId === clip.id
                                        ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                        : 'bg-slate-800 text-slate-400 border-slate-700'}
                                `}>
                                    Score: {clip.score}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed group-hover:text-slate-300 transition-colors">
                                {clip.reason}
                            </p>
                        </div>

                        {activeClipId === clip.id && (
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent pointer-events-none"
                                layoutId="activeGlow"
                            />
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
