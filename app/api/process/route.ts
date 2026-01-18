import { NextRequest, NextResponse } from 'next/server';
import { downloadVideo } from '@/services/downloader';
import { transcribeAudio } from '@/services/transcription';
import { analyzeTranscript } from '@/services/analysis';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();
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

        // 2. Transcribe (Fail-Safe)
        const transcription = await transcribeAudio(videoPath);

        if (transcription.isFallback) {
            console.warn("Using fallback transcription strategy.");
        }

        // 3. Analyze (Fail-Safe)
        // Now passing duration so fallback strategy can work if needed
        let moments = await analyzeTranscript(transcription.text, duration);

        return NextResponse.json({
            success: true,
            videoUrl: relativeVideoPath,
            transcription,
            moments
        });

    } catch (error: any) {
        console.error('Processing error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
