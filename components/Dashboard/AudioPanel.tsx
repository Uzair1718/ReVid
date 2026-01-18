'use client';

import { useProjectStore } from '@/store/useProjectStore';
import { motion } from 'framer-motion';
import { Mic, Volume2, Play, Pause, Trash2 } from 'lucide-react';
import { useState } from 'react';

export const AudioPanel = () => {
    const { activeClipId, clips, updateClipTheme } = useProjectStore();
    const activeClip = clips.find(c => c.id === activeClipId);
    const [isRecording, setIsRecording] = useState(false);

    if (!activeClip) return <div className="p-6 text-slate-500 text-sm">Select a clip to edit audio</div>;

    const handleRecordToggle = async () => {
        if (isRecording) {
            // Stop Recording
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
            }
            setIsRecording(false);
        } else {
            // Start Recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream);
                let chunks: Blob[] = [];

                recorder.ondataavailable = (e) => chunks.push(e.data);
                recorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'audio/webm' });
                    const url = URL.createObjectURL(blob);
                    updateClipTheme(activeClip.id, { voiceoverUrl: url });
                };

                recorder.start();
                setMediaRecorder(recorder);
                setIsRecording(true);
            } catch (err) {
                console.error("Error accessing microphone:", err);
                alert("Could not access microphone. Please allow permissions.");
            }
        }
    };

    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

    return (
        <div className="p-6 space-y-8">
            <div>
                <h3 className="font-bold text-white text-lg mb-4">Audio & Voiceover</h3>
                <p className="text-xs text-slate-400 mb-6">Add narration or adjust background music.</p>

                <div className="space-y-6">
                    {/* Voiceover Recorder */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                                <Mic className="w-4 h-4 text-purple-400" />
                                Voiceover
                            </div>
                            {activeClip.theme.voiceoverUrl && (
                                <button
                                    onClick={() => updateClipTheme(activeClip.id, { voiceoverUrl: undefined })}
                                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                                >
                                    <Trash2 className="w-3 h-3" /> Remove
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRecordToggle}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'}`}
                            >
                                <div className={`w-4 h-4 rounded-sm bg-current ${isRecording ? 'rounded-sm' : 'rounded-full'}`} />
                            </button>
                            <div className="flex-1 h-12 bg-black/40 rounded-lg flex items-center justify-center px-4 overflow-hidden relative">
                                {isRecording ? (
                                    <div className="flex gap-1 items-center h-full w-full justify-center">
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                            <motion.div
                                                key={i}
                                                animate={{ height: [10, 30, 10] }}
                                                transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                                className="w-1 bg-red-500 rounded-full"
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-500">Click to record...</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Background Music Volume */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <Volume2 className="w-4 h-4" />
                                <span>Music Volume</span>
                            </div>
                            <span className="text-white">{Math.round((activeClip.theme.bgMusicVolume || 0) * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0" max="1" step="0.05"
                            value={activeClip.theme.bgMusicVolume || 0}
                            onChange={(e) => updateClipTheme(activeClip.id, { bgMusicVolume: parseFloat(e.target.value) })}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
