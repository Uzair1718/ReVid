import fs from 'fs';
import Groq from 'groq-sdk';

export interface TranscriptionResult {
    text: string;
    words: { word: string; start: number; end: number }[];
    isFallback: boolean;
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
        const groq = new Groq({ apiKey });

        console.log("Transcribing with Groq Whisper API...");

        // Read the audio file
        const audioFile = fs.createReadStream(mediaPath);

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
