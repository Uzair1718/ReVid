// import { bundle } from "@remotion/bundler";
// import { renderMedia, selectComposition } from "@remotion/renderer";

// Mocking Remotion for Netlify Deployment (Size Limit Workaround)
const bundle = async (args: any) => { throw new Error("Server-side rendering disabled on Netlify due to size limits. Use local or Docker environment."); };
const selectComposition = async (args: any) => { return {} as any; };
const renderMedia = async (args: any) => { return; };
import path from "path";
import fs from "fs";
import os from "os";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300; // 5 minutes

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        let { inputProps, compositionId } = body;

        if (!inputProps) {
            return NextResponse.json({ error: "Missing inputProps" }, { status: 400 });
        }

        // Resolve videoSrc if it's a relative path (e.g. /downloads/video.mp4)
        if (typeof inputProps.videoSrc === 'string' && inputProps.videoSrc.startsWith('/')) {
            const publicDir = path.join(process.cwd(), 'public');
            const absolutePath = path.join(publicDir, inputProps.videoSrc);
            // Check if file exists
            if (fs.existsSync(absolutePath)) {
                // Convert to file URL for Remotion/Puppeteer
                // On Windows, path.join might use backslashes, we need to handle that for URL
                const fileUrl = `file://${absolutePath.split(path.sep).join('/')}`;
                inputProps.videoSrc = fileUrl;
                console.log("Resolved videoSrc to:", fileUrl);
            } else {
                console.warn("Could not resolve video path:", absolutePath);
            }
        }

        console.log("Bundling...");
        const entry = path.join(process.cwd(), "remotion", "index.ts");

        const bundleLocation = await bundle({
            entryPoint: entry,
            webpackOverride: (config) => config, // Default webpack config
        });

        console.log("Selecting composition...");
        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: compositionId || "ShortsComposition",
            inputProps,
        });

        console.log("Rendering...");
        const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "remotion-"));
        const outputLocation = path.join(tmpDir, "out.mp4");

        // --- AGENTIC BEHAVIOR: Self-Optimization ---
        const { getOptimalConcurrency } = require('@/services/scaling'); // Lazy import
        const concurrency = await getOptimalConcurrency();
        console.log(`Render Pipeline: Using concurrency = ${concurrency} based on system load.`);

        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: "h264",
            outputLocation,
            inputProps,
            concurrency, // Dynamic concurrency
        });

        console.log("Render done, reading file...");
        const fileBuffer = await fs.promises.readFile(outputLocation);

        // Cleanup temp files
        // await fs.promises.rm(tmpDir, { recursive: true });

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": "video/mp4",
                "Content-Disposition": 'attachment; filename="video.mp4"',
            },
        });

    } catch (err) {
        console.error("Error rendering video:", err);
        return NextResponse.json({ error: err instanceof Error ? err.message : JSON.stringify(err) }, { status: 500 });
    }
}
