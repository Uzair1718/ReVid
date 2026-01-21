import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import Groq from 'groq-sdk';

export interface TranscriptionResult {
    text: string;
    words: { word: string; start: number; end: number }[];
    isFallback: boolean;
}

// Extract audio from video and compress it for Groq API (25MB limit)
async function extractAudio(videoPath: string): Promise<string> {
    const audioPath = videoPath.replace(/\.(mp4|webm|mov)$/i, '_audio.mp3');

    // If audio already exists, return it
    if (fs.existsSync(audioPath)) {
        console.log("Using existing audio file:", audioPath);
        return audioPath;
    }

    return new Promise((resolve, reject) => {
        console.log("Extracting audio from video...");

        // Use FFmpeg to extract audio and compress to mono 64kbps MP3
        const ffmpeg = spawn('ffmpeg', [
            '-i', videoPath,
            '-vn', // No video
            '-ac', '1', // Mono
            '-ar', '16000', // 16kHz sample rate (good for speech)
            '-ab', '64k', // 64kbps bitrate
            '-f', 'mp3',
            audioPath
        ]);

        let stderr = '';
        ffmpeg.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        ffmpeg.on('close', (code) => {
            if (code === 0) {
                console.log("✓ Audio extracted successfully");
                resolve(audioPath);
            } else {
                console.error("FFmpeg failed:", stderr);
                reject(new Error("Audio extraction failed"));
            }
        });
    });
}

export const transcribeAudio = async (mediaPath: string): Promise<TranscriptionResult> => {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        console.error("GROQ_API_KEY not found in environment variables!");
        return {
            text: "Transcription unavailable - Please add GROQ_API_KEY to your environment variables",
            words: [],
            isFallback: true
        };
    }

    if (!fs.existsSync(mediaPath)) {
        console.warn(`File not found: ${mediaPath}`);
        return { text: "", words: [], isFallback: true };
    }

    try {
        // Extract and compress audio first
        let audioPath = mediaPath;

        // If it's a video file, extract audio
        if (/\.(mp4|webm|mov)$/i.test(mediaPath)) {
            try {
                audioPath = await extractAudio(mediaPath);
            } catch (error) {
                console.error("Audio extraction failed, trying original file:", error);
                // Continue with original file
            }
        }

        // Check file size
        const stats = fs.statSync(audioPath);
        const fileSizeMB = stats.size / (1024 * 1024);
        console.log(`Audio file size: ${fileSizeMB.toFixed(2)} MB`);

        if (fileSizeMB > 25) {
            console.error("File too large for Groq API (>25MB). Consider using a shorter video.");
            return {
                text: "File too large for transcription (>25MB limit)",
                words: [],
                isFallback: true
            };
        }

        const groq = new Groq({ apiKey });

        console.log("Transcribing with Groq Whisper API...");

        // Read the audio file
        const audioFile = fs.createReadStream(audioPath);

        const transcription = await groq.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-large-v3-turbo",
            response_format: "verbose_json",
            timestamp_granularities: ["word"]
        });

        // Extract word-level timestamps
        const words = (transcription.words || []).map((w: any) => ({
            word: w.word,
            start: w.start,
            end: w.end
        }));

        console.log(`✓ Transcribed ${words.length} words successfully`);

        // Clean up extracted audio file if it was created
        if (audioPath !== mediaPath && fs.existsSync(audioPath)) {
            fs.unlinkSync(audioPath);
            console.log("✓ Cleaned up temporary audio file");
        }

        return {
            text: transcription.text || "",
            words,
            isFallback: false
        };
    } catch (error: any) {
        console.error("Groq transcription failed:", error.message);
        return {
            text: "Transcription failed - " + error.message,
            words: [],
            isFallback: true
        };
    }
};
