import { NextRequest, NextResponse } from 'next/server';
import { ReVidAgent } from '@/services/agent-system';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        const { videoPath, targetClipCount = 5, qualityThreshold = 7 } = await req.json();

        if (!videoPath) {
            return NextResponse.json({ error: 'videoPath is required' }, { status: 400 });
        }

        console.log('[AGENT-ROUTE] Starting autonomous clip generation');
        console.log(`[AGENT-ROUTE] Video: ${videoPath}, Target: ${targetClipCount} clips, Threshold: ${qualityThreshold}`);

        // Initialize agent
        const agent = new ReVidAgent(videoPath);

        // Run autonomous generation (THINK → PLAN → ACT → OBSERVE → REFLECT → IMPROVE)
        const scoredClips = await agent.generateClips(targetClipCount);

        // Get internal reflection
        const reflection = agent.getReflection();

        // Filter to only high-quality clips
        const finalClips = scoredClips
            .filter(clip => !clip.shouldDiscard)
            .sort((a, b) => b.overallScore - a.overallScore)
            .slice(0, targetClipCount);

        console.log(`[AGENT-ROUTE] Generated ${finalClips.length} high-quality clips`);
        console.log(`[AGENT-ROUTE] Reflection:`, JSON.stringify(reflection, null, 2));

        return NextResponse.json({
            success: true,
            clips: finalClips,
            statistics: {
                totalGenerated: scoredClips.length,
                qualityClips: finalClips.length,
                averageScore: (finalClips.reduce((sum, c) => sum + c.overallScore, 0) / finalClips.length).toFixed(2),
                discardedCount: scoredClips.filter(c => c.shouldDiscard).length
            },
            reflection: {
                whatWorked: reflection.whatWorked,
                whatFailed: reflection.whatFailed,
                improvements: reflection.improvements,
                nextStrategy: reflection.nextStrategy
            }
        });

    } catch (error) {
        console.error('[AGENT-ROUTE] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
