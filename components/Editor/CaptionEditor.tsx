import React from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { Palette, Type } from 'lucide-react';

export const CaptionEditor = () => {
    const { clips, activeClipId, updateClipWord, updateClipTheme, platform, setPlatform } = useProjectStore();
    const activeClip = clips.find(c => c.id === activeClipId);

    if (!activeClip) return <div className="text-slate-400 text-sm p-10 text-center font-medium">Select a clip to begin editing context.</div>;

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex bg-slate-100/80 p-1.5 rounded-xl">
                    {(['youtube', 'instagram', 'tiktok'] as const).map(p => (
                        <button
                            key={p}
                            onClick={() => setPlatform(p)}
                            className={`
                                flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all capitalize 
                                ${platform === p
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }
                            `}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">

                {/* Style Controls */}
                <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Palette className="w-3 h-3" /> Visual Style
                    </label>

                    {/* Animation Style */}
                    <div className="grid grid-cols-3 gap-2">
                        {(['pop', 'bounce', 'slide', 'neon', 'fade'] as const).map(style => (
                            <button
                                key={style}
                                onClick={() => updateClipTheme(activeClip.id, { captionStyle: style })}
                                className={`
                                    py-2 px-1 rounded-lg text-[10px] font-bold uppercase transition-all border truncate
                                    ${activeClip.theme.captionStyle === style
                                        ? 'border-purple-200 bg-purple-50 text-purple-700 ring-2 ring-purple-500/20'
                                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                    }
                                `}
                            >
                                {style}
                            </button>
                        ))}
                    </div>

                    {/* Color Picker */}
                    <div className="flex gap-2">
                        {[
                            '#ffffff', // White
                            '#fbbf24', // Amber 400
                            '#34d399', // Emerald 400
                            '#60a5fa', // Blue 400
                            '#f472b6', // Pink 400
                            '#e879f9', // Purple 400
                            '#f87171', // Red 400
                        ].map(color => (
                            <button
                                key={color}
                                onClick={() => updateClipTheme(activeClip.id, { captionColor: color })}
                                className={`
                                    w-8 h-8 rounded-full border-2 transition-transform hover:scale-110
                                    ${activeClip.theme.captionColor === color ? 'border-purple-500 scale-110 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'}
                                `}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>

                {/* Music Controls */}
                <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                        Background Music
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                        {[
                            { label: 'None', url: undefined },
                            { label: 'Motivation (Upbeat)', url: 'https://cdn.pixabay.com/audio/2022/10/24/audio_0df976809e.mp3' }, // Good generic upbeat
                            { label: 'Corporate (Clean)', url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' }, // Soft corporate
                            { label: 'Happy (Chill)', url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3' }, // Chill lo-fi
                        ].map(track => (
                            <button
                                key={track.label}
                                onClick={() => updateClipTheme(activeClip.id, { bgMusicUrl: track.url, bgMusicVolume: activeClip.theme.bgMusicVolume ?? 0.2 })}
                                className={`
                                    flex items-center justify-between text-left px-4 py-3 rounded-xl border text-xs font-medium transition-all
                                    ${activeClip.theme.bgMusicUrl === track.url
                                        ? 'bg-purple-50 border-purple-200 text-purple-900 shadow-sm'
                                        : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                                    }
                                `}
                            >
                                <span>{track.label}</span>
                                {activeClip.theme.bgMusicUrl === track.url && <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />}
                            </button>
                        ))}
                    </div>

                    {/* Volume Slider */}
                    {activeClip.theme.bgMusicUrl && (
                        <div className="pt-2">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                                <span>MUSIC VOLUME</span>
                                <span>{Math.round((activeClip.theme.bgMusicVolume ?? 0.2) * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={activeClip.theme.bgMusicVolume ?? 0.2}
                                onChange={(e) => updateClipTheme(activeClip.id, { bgMusicVolume: parseFloat(e.target.value) })}
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                        </div>
                    )}
                </div>

                {/* Word Editor */}
                <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Type className="w-3 h-3" /> Transcript
                    </label>

                    <div className="bg-white rounded-2xl p-1 border border-slate-200 shadow-sm overflow-hidden">
                        <div className="max-h-[400px] overflow-y-auto p-3 space-y-1">
                            {activeClip.words.map((word, idx) => (
                                <div key={idx} className="flex gap-3 group items-center hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
                                    <span className="text-[10px] text-slate-400 font-mono w-10 text-right pt-1">{word.start.toFixed(1)}s</span>
                                    <input
                                        className="bg-transparent border-none focus:ring-0 text-sm text-slate-700 font-medium w-full p-0 leading-relaxed"
                                        value={word.word}
                                        onChange={(e) => updateClipWord(activeClip.id, idx, { word: e.target.value })}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
