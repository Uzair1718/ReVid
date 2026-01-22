'use client';

import { useProjectStore } from '@/store/useProjectStore';
import { motion } from 'framer-motion';
import { Zap, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export const AgentPanel = () => {
    const { sourceVideoPath, videoUrl, setClips, isLoading, setIsLoading, loadingStep, setIsLoading: setLoadingState } = useProjectStore();
    const [isAgentRunning, setIsAgentRunning] = useState(false);
    const [agentStatus, setAgentStatus] = useState<'idle' | 'generating' | 'complete' | 'error'>('idle');
    const [agentMessage, setAgentMessage] = useState('');
    const [statistics, setStatistics] = useState<any>(null);

    const runAgent = async () => {
        if (!sourceVideoPath && !videoUrl) {
            setAgentMessage('Please download a video first');
            setAgentStatus('error');
            return;
        }

        setIsAgentRunning(true);
        setAgentStatus('generating');
        setAgentMessage('Agent: Analyzing video...');

        try {
            const response = await fetch('/api/agent/clips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    videoPath: sourceVideoPath || videoUrl,
                    targetClipCount: 6,
                    qualityThreshold: 7
                })
            });

            if (!response.ok) {
                throw new Error('Agent failed');
            }

            const data = await response.json();
            
            // Update clips in store
            setClips(data.clips);
            setStatistics(data.statistics);

            setAgentStatus('complete');
            setAgentMessage(`✓ Agent generated ${data.statistics.qualityClips} high-quality clips!`);

            console.log('[AGENT-PANEL] Reflection:', data.reflection);

        } catch (error) {
            setAgentStatus('error');
            setAgentMessage(error instanceof Error ? error.message : 'Agent encountered an error');
        } finally {
            setIsAgentRunning(false);
        }
    };

    return (
        <div className="p-6 space-y-4 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl border border-purple-500/30">
            <div>
                <h3 className="font-bold text-white text-lg mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    AI Agent Auto-Generate
                </h3>
                <p className="text-xs text-slate-400">Let the agent autonomously create optimized clips</p>
            </div>

            <button
                onClick={runAgent}
                disabled={isAgentRunning}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-lg font-bold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
                {isAgentRunning ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Agent Working...
                    </>
                ) : (
                    <>
                        <Zap className="w-5 h-5" />
                        Generate Clips with AI
                    </>
                )}
            </button>

            {/* Status Messages */}
            {agentStatus !== 'idle' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border ${
                        agentStatus === 'error' 
                            ? 'bg-red-500/10 border-red-500/30' 
                            : agentStatus === 'complete'
                            ? 'bg-green-500/10 border-green-500/30'
                            : 'bg-blue-500/10 border-blue-500/30'
                    }`}
                >
                    <div className="flex items-start gap-3">
                        {agentStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />}
                        {agentStatus === 'complete' && <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />}
                        {agentStatus === 'generating' && <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0 mt-0.5" />}
                        <div>
                            <p className={`text-sm font-semibold ${
                                agentStatus === 'error' ? 'text-red-400' :
                                agentStatus === 'complete' ? 'text-green-400' :
                                'text-blue-400'
                            }`}>
                                {agentMessage}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Statistics */}
            {statistics && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-2"
                >
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <span className="text-slate-400">Generated:</span>
                            <p className="text-lg font-bold text-white">{statistics.totalGenerated}</p>
                        </div>
                        <div>
                            <span className="text-slate-400">Quality Clips:</span>
                            <p className="text-lg font-bold text-green-400">{statistics.qualityClips}</p>
                        </div>
                        <div>
                            <span className="text-slate-400">Avg Score:</span>
                            <p className="text-lg font-bold text-purple-400">{statistics.averageScore}/10</p>
                        </div>
                        <div>
                            <span className="text-slate-400">Discarded:</span>
                            <p className="text-lg font-bold text-orange-400">{statistics.discardedCount}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Info Box */}
            <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-xs text-slate-400 space-y-1">
                <p>✓ Autonomous analysis & scoring</p>
                <p>✓ Intelligent clip selection</p>
                <p>✓ Quality filtering (7+/10)</p>
                <p>✓ Self-reflection & improvement</p>
            </div>
        </div>
    );
};
