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

export const transcribeAudio = async (mediaPath: string, language: 'en' | 'hi' | 'ur' = 'en'): Promise<TranscriptionResult> => {
    const apiKey = process.env.GROQ_API_KEY?.trim();

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

        console.log(`[GROQ] Initializing Groq client with API key (${apiKey.slice(0, 10)}...)`);
        const groq = new Groq({ apiKey, timeout: 60 * 1000 }); // 60 second timeout

        // Map language codes to Groq language codes
        const languageMap: { [key: string]: string } = {
            'en': 'en',      // English
            'hi': 'hi',      // Hindi
            'ur': 'ur'       // Urdu
        };

        const groqLanguage = languageMap[language] || 'en';
        console.log(`[GROQ] Transcribing with language: ${language} (Groq code: ${groqLanguage})`);

        // Read the audio file
        const audioFile = fs.createReadStream(audioPath);

        const transcription = await groq.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-large-v3-turbo",
            language: groqLanguage,
            response_format: "verbose_json",
            timestamp_granularities: ["word"]
        }) as any; // Type cast needed for word-level timestamps

        // Extract word-level timestamps
        const words = (transcription.words || []).map((w: any) => ({
            word: w.word,
            start: w.start,
            end: w.end
        }));

        console.log(`✓ Transcribed ${words.length} words in ${language} successfully`);

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
        console.error("[GROQ] Transcription error:", {
            message: error.message,
            status: error.status,
            code: error.code,
            type: error.type,
            fullError: JSON.stringify(error, null, 2)
        });
        
        // Log specific error types
        if (error.message?.includes("ECONNREFUSED")) {
            console.error("[GROQ] Connection refused - Groq API might be unreachable");
        } else if (error.status === 401 || error.message?.includes("401")) {
            console.error("[GROQ] Unauthorized - Check your GROQ_API_KEY");
        } else if (error.status === 429 || error.message?.includes("429")) {
            console.error("[GROQ] Rate limited - Try again later");
        } else if (error.message?.includes("timeout")) {
            console.error("[GROQ] Request timeout - Check your internet connection");
        }
        
        return {
            text: "Transcription failed - " + error.message,
            words: [],
            isFallback: true
        };
    }
};
