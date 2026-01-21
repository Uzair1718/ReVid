import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export interface TranscriptionResult {
    text: string;
    words: { word: string; start: number; end: number }[];
    isFallback: boolean;
}

export const transcribeAudio = async (mediaPath: string): Promise<TranscriptionResult> => {
    // NETLIFY / SERVERLESS STUB
    // We cannot run local Python Whisper scripts on Netlify Functions.
    // In production, you would call an external API (like OpenAI Whisper or Deepgram).
    console.warn("Local Whisper transcription is disabled on Serverless/Netlify.");
    return {
        text: "Transcription unavailable in Serverless Deployment. Please run locally or connect an external API.",
        words: [],
        isFallback: true
    };
};
