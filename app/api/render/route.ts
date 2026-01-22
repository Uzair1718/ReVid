import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";
import os from "os";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 900; // 15 minutes

// Simple in-memory cache for bundle location
let cachedBundleLocation: string | null = null;
let lastBundleTime = 0;
const BUNDLE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Quality presets for faster rendering
const QUALITY_PRESETS = {
    draft: { crf: 32, concurrency: 16, codec: 'h264' as const }, // Fastest, lower quality
    standard: { crf: 24, concurrency: 8, codec: 'h264' as const },  // Balanced
    premium: { crf: 18, concurrency: 4, codec: 'h264' as const },   // Slower, best quality
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        let { inputProps, compositionId, format = 'mp4', resolution = '1080p', quality = 'standard', language = 'en' } = body;

        // Validate quality preset
        const qualityPreset = QUALITY_PRESETS[quality as keyof typeof QUALITY_PRESETS] || QUALITY_PRESETS.standard;

        console.log("[RENDER] Starting render request for composition:", compositionId);
        console.log("[RENDER] Export settings - Format:", format, "Resolution:", resolution, "Quality:", quality, "Language:", language);
        console.log("[RENDER] Quality preset:", qualityPreset);
        console.log("[RENDER] InputProps received:", JSON.stringify(inputProps, null, 2));
        console.log("[RENDER] Captions count:", inputProps?.captions?.length || 0);

        const host = req.headers.get('host') || 'localhost:3000';
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const baseUrl = `${protocol}://${host}`;

        const resolveLocalPath = (src: any) => {
            if (typeof src === 'string' && src.startsWith('/')) {
                // Return absolute URL so Remotion's downloader can fetch it via HTTP
                const absoluteUrl = `${baseUrl}${src}`;
                console.log(`[RENDER] Resolved local asset: ${src} -> ${absoluteUrl}`);
                return absoluteUrl;
            }
            return src;
        };

        // Resolve all potential asset paths
        inputProps.videoSrc = resolveLocalPath(inputProps.videoSrc);
        inputProps.bgMusicUrl = resolveLocalPath(inputProps.bgMusicUrl);
        inputProps.voiceoverUrl = resolveLocalPath(inputProps.voiceoverUrl);

        console.log("[RENDER] Bundling...");
        const entry = path.join(process.cwd(), "remotion", "index.ts");

        // Use cached bundle if still fresh
        let bundleLocation = cachedBundleLocation;
        if (!bundleLocation || Date.now() - lastBundleTime > BUNDLE_CACHE_DURATION) {
            console.log("[RENDER] Creating new bundle (cache expired or not found)");
            bundleLocation = await bundle({
                entryPoint: entry,
                webpackOverride: (config: any) => config,
            });
            cachedBundleLocation = bundleLocation;
            lastBundleTime = Date.now();
        } else {
            console.log("[RENDER] Using cached bundle");
        }
        console.log("[RENDER] Bundle location:", bundleLocation);

        // Pass language to inputProps
        inputProps.language = language;

        console.log("[RENDER] Selecting composition...");
        const composition = await selectComposition({
            serveUrl: bundleLocation,
            id: compositionId || "ShortsComposition",
            inputProps,
        });
        console.log("[RENDER] Composition selected, duration:", composition.durationInFrames);

        console.log("[RENDER] Starting render...");
        const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "remotion-"));
        const outputLocation = path.join(tmpDir, "out.mp4");

        console.log(`[RENDER] Rendering at resolution: ${resolution} with quality: ${quality}`);

        await renderMedia({
            composition,
            serveUrl: bundleLocation,
            codec: qualityPreset.codec,
            outputLocation,
            inputProps,
            concurrency: qualityPreset.concurrency, // Use preset concurrency
            crf: qualityPreset.crf, // Use preset quality factor
        });

        console.log("[RENDER] Render complete, reading file...");
        const fileBuffer = await fs.promises.readFile(outputLocation);
        console.log("[RENDER] File size:", fileBuffer.length, "bytes");

        // Cleanup temp files
        // await fs.promises.rm(tmpDir, { recursive: true });

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": "video/mp4",
                "Content-Disposition": `attachment; filename="video.mp4"`,
            },
        });

    } catch (err) {
        console.error("[RENDER] Error rendering video:", err);
        const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
        console.error("[RENDER] Error details:", errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
