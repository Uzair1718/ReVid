import { NextRequest, NextResponse } from 'next/server';
import { downloadVideo } from '@/services/downloader';
import { transcribeAudio } from '@/services/transcription';
import { analyzeTranscript } from '@/services/analysis';
import { ReVidAgent } from '@/services/agent-system';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        const { url, transcriptionLanguage = 'en', useAgent = true } = await req.json();
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const outputDir = path.resolve('./public/downloads');
        // Ensure dir exists
        const fs = require('fs');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // 1. Download
        const { path: videoPath, duration } = await downloadVideo(url, outputDir);
        const relativeVideoPath = `/downloads/${path.basename(videoPath)}`;

        console.log(`[PROCESS] Starting transcription in language: ${transcriptionLanguage}`);

        // 2. Transcribe with selected language (Fail-Safe)
        const transcription = await transcribeAudio(videoPath, transcriptionLanguage as 'en' | 'hi' | 'ur');

        if (transcription.isFallback) {
            console.warn("Using fallback transcription strategy.");
        }

        // 3. Generate Clips - Using ReVidAgent for intelligent clip selection
        let moments: any[] = [];
        let reflection: any = {};

        if (useAgent) {
            console.log('[PROCESS] Using ReVidAgent for intelligent clip generation...');
            try {
                const agent = new ReVidAgent(videoPath);
                const scoredClips = await agent.generateClips(6); // Generate 6 clips
                reflection = agent.getReflection();

                // Filter high-quality clips (above threshold 7)
                moments = scoredClips
                    .filter(clip => !clip.shouldDiscard)
                    .map(clip => ({
                        start: clip.start,
                        end: clip.end,
                        reason: clip.reason,
                        score: Math.round(clip.overallScore)
                    }));

                console.log(`[PROCESS] Agent generated ${moments.length} high-quality clips`);
            } catch (agentError: any) {
                console.warn('[PROCESS] Agent failed, falling back to analysis:', agentError.message);
                moments = await analyzeTranscript(transcription.text, duration);
            }
        } else {
            // Fallback to basic analysis
            moments = await analyzeTranscript(transcription.text, duration);
        }

        return NextResponse.json({
            success: true,
            videoUrl: relativeVideoPath,
            transcription,
            moments,
            reflection: useAgent ? reflection : undefined
        });

    } catch (error: any) {
        console.error('Processing error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
