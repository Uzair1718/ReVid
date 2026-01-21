import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { AssemblyAI } from 'assemblyai';

export interface TranscriptionResult {
    text: string;
    words: { word: string; start: number; end: number }[];
    isFallback: boolean;
}

// AssemblyAI Cloud Transcription (Free: 5 hours/month)
async function transcribeWithAssemblyAI(mediaPath: string): Promise<TranscriptionResult> {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;

    if (!apiKey) {
        console.warn("AssemblyAI API key not found. Using fallback.");
        return { text: "No transcription API configured", words: [], isFallback: true };
    }

    try {
        const client = new AssemblyAI({ apiKey });

        console.log("Uploading to AssemblyAI...");
        const transcript = await client.transcripts.transcribe({
            audio: mediaPath,
            word_boost: ['AI', 'YouTube', 'video'],
            language_code: 'en'
        });

        if (transcript.status === 'error') {
            console.error("AssemblyAI Error:", transcript.error);
            return { text: "", words: [], isFallback: true };
        }

        // Convert AssemblyAI word format to our format
        const words = (transcript.words || []).map(w => ({
            word: w.text,
            start: w.start / 1000, // Convert ms to seconds
            end: w.end / 1000
        }));

        return {
            text: transcript.text || "",
            words,
            isFallback: false
        };
    } catch (error) {
        console.error("AssemblyAI transcription failed:", error);
        return { text: "", words: [], isFallback: true };
    }
}

// Local Whisper Transcription (for development)
async function transcribeWithLocalWhisper(mediaPath: string): Promise<TranscriptionResult> {
    console.log(`Transcribing with Local Whisper: ${mediaPath}`);

    if (!fs.existsSync(mediaPath)) {
        console.warn(`File not found: ${mediaPath}`);
        return { text: "", words: [], isFallback: true };
    }

    return new Promise((resolve) => {
        const scriptPath = path.resolve('./services/transcribe.py');
        const pythonProcess = spawn('python', ['-u', scriptPath, mediaPath]);

        let stdoutBuffer = '';
        let resultJson = '';
        let stderrData = '';

        pythonProcess.stdout.on('data', (data) => {
            stdoutBuffer += data.toString();
            let lines = stdoutBuffer.split('\n');
            stdoutBuffer = lines.pop() || '';

            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const msg = JSON.parse(line);
                    if (msg.status) {
                        console.log(`[Whisper]: ${msg.status} ${msg.device ? `(${msg.device})` : ''}`);
                    } else if (msg.text || msg.words) {
                        resultJson = line;
                    } else if (msg.error) {
                        console.error(`[Whisper Error]: ${msg.error}`);
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            }
        });

        pythonProcess.stderr.on('data', (data) => {
            stderrData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Whisper process exited with code ${code}`);
                console.error(`Stderr: ${stderrData}`);
                resolve({ text: "Transcription Failed", words: [], isFallback: true });
                return;
            }

            try {
                if (!resultJson) {
                    throw new Error("No JSON result received");
                }
                const result = JSON.parse(resultJson);
                if (result.error) {
                    console.error("Whisper Error:", result.error);
                    resolve({ text: "", words: [], isFallback: true });
                } else {
                    resolve({
                        text: result.text || "",
                        words: result.words || [],
                        isFallback: false
                    });
                }
            } catch (e) {
                console.error("Failed to parse Whisper output:", e);
                resolve({ text: "", words: [], isFallback: true });
            }
        });
    });
}

export const transcribeAudio = async (mediaPath: string): Promise<TranscriptionResult> => {
    // Check if running in serverless/production environment
    const isServerless = process.env.VERCEL || process.env.NETLIFY;

    if (isServerless || process.env.ASSEMBLYAI_API_KEY) {
        // Use cloud transcription (AssemblyAI)
        return transcribeWithAssemblyAI(mediaPath);
    } else {
        // Use local Whisper for development
        return transcribeWithLocalWhisper(mediaPath);
    }
};
