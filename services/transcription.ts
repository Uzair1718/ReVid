import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export interface TranscriptionResult {
    text: string;
    words: { word: string; start: number; end: number }[];
    isFallback: boolean;
}

export const transcribeAudio = async (mediaPath: string): Promise<TranscriptionResult> => {
    console.log(`Transcribing with Local Whisper: ${mediaPath}`);

    if (!fs.existsSync(mediaPath)) {
        console.warn(`File not found: ${mediaPath}`);
        return { text: "", words: [], isFallback: true };
    }

    return new Promise((resolve) => {
        // Path to python script
        const scriptPath = path.resolve('./services/transcribe.py');

        // Use -u for unbuffered output to see real-time logs
        const pythonProcess = spawn('python', ['-u', scriptPath, mediaPath]);

        let stdoutBuffer = '';
        let resultJson = '';
        let stderrData = '';

        pythonProcess.stdout.on('data', (data) => {
            stdoutBuffer += data.toString();

            // split by newline
            let lines = stdoutBuffer.split('\n');

            // The last item might be incomplete, put it back in buffer
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
                    // Ignore
                }
            }
        });

        pythonProcess.stderr.on('data', (data) => {
            stderrData += data.toString();
            // console.error(`Whisper Error: ${data}`); // Optional verbosity
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Whisper process exited with code ${code}`);
                console.error(`Stderr: ${stderrData}`);
                // Fallback
                resolve({ text: "Transcription Failed due to python error", words: [], isFallback: true });
                return;
            }

            try {
                // Parse the last valid JSON result we found
                if (!resultJson) {
                    throw new Error("No JSON result received from Whisper script");
                }
                const result = JSON.parse(resultJson);
                if (result.error) {
                    console.error("Whisper Script Error:", result.error);
                    resolve({ text: "", words: [], isFallback: true });
                } else {
                    resolve({
                        text: result.text || "",
                        words: result.words || [],
                        isFallback: false
                    });
                }
            } catch (e) {
                console.error("Failed to parse Whisper JSON output:", e);
                console.log("Last Result Chunk:", resultJson);
                resolve({ text: "", words: [], isFallback: true });
            }
        });

        // Safety timeout (e.g., 5 minutes for long videos)
        // setTimeout(() => { ... }, 300000)
    });
};
