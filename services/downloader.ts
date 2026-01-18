import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export const downloadVideo = async (url: string, outputDir: string) => {
    // Clean URL
    const cleanUrl = url.trim();

    // Generate a temporary ID for the filename to avoid collisions and invalid chars
    const timestamp = Date.now();
    const videoPath = path.join(outputDir, `video_${timestamp}.mp4`);

    console.log(`Downloading (Best Quality) from: ${cleanUrl} to ${videoPath}`);

    return new Promise<{ path: string; duration: number }>((resolve, reject) => {
        // Use yt-dlp for best quality video+audio merge
        const ytDlp = spawn('yt-dlp', [
            '-f', 'bestvideo+bestaudio/best', // Best video and best audio, merge them
            '--merge-output-format', 'mp4',   // Ensure output is MP4
            '-o', videoPath,                  // Output path
            '--no-playlist',                  // Single video only
            '--print-json',                   // Print JSON info to get duration (this will be tricky to parse from stdout along with progress, but we can verify file later. Actually let's just create file first)
            '--no-simulate',
            cleanUrl
        ]);

        let errorData = '';

        ytDlp.stdout.on('data', (data) => {
            // We could parse JSON output here if we used --print-json, but yt-dlp prints it all at once or messy.
            // Simplest is to let it finish.
            console.log(`yt-dlp stdout: ${data}`);
        });

        ytDlp.stderr.on('data', (data) => {
            errorData += data.toString();
            console.log(`yt-dlp stderr: ${data}`);
        });

        ytDlp.on('close', async (code) => {
            if (code === 0) {
                // Get Duration using ffmpeg or just re-probe
                // Since we don't have easy duration from spawn without parsing big JSON, 
                // let's do a quick verify or return a default/calculated duration.
                // Better: Use `yt-dlp --get-duration` separately or rely on transcription check.
                // For now, let's just return success. The Analysis step will check output.

                // Let's get actual duration via ffprobe if possible, or another lightweight check. 
                // Or easier: fetch info first.

                try {
                    // Quick duration check
                    const duration = await getVideoDuration(videoPath);
                    resolve({ path: videoPath, duration });
                } catch (e) {
                    console.warn("Could not determine duration, defaulting to 0", e);
                    resolve({ path: videoPath, duration: 0 }); // Fallback
                }
            } else {
                reject(new Error(`yt-dlp process exited with code ${code}: ${errorData}`));
            }
        });
    });
};

// Helper to get duration using ffprobe (since we know ffmpeg is installed)
const getVideoDuration = (filePath: string): Promise<number> => {
    return new Promise((resolve, reject) => {
        const ffprobe = spawn('ffprobe', [
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            filePath
        ]);

        let output = '';
        ffprobe.stdout.on('data', (data) => output += data.toString());

        ffprobe.on('close', (code) => {
            if (code === 0) {
                resolve(parseFloat(output.trim()));
            } else {
                reject(new Error('ffprobe failed'));
            }
        });
    });
};

export const getVideoInfo = async (url: string) => {
    // Fallback or lightweight info
    return {};
}
