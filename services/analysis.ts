import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini safely inside function or try/catch
const getModel = () => {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
        console.warn("[ANALYSIS] No GEMINI_API_KEY found in environment");
        return null;
    }
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        console.log("[ANALYSIS] Gemini model initialized successfully");
        return model;
    } catch (e) {
        console.error("[ANALYSIS] Failed to initialize Gemini model:", e);
        return null;
    }
};

export interface ViralMoment {
    start: number;
    end: number;
    reason: string;
    score: number;
}

export const analyzeTranscript = async (
    transcript: string | null,
    videoDuration: number
): Promise<ViralMoment[]> => {
    const fallbackStrategy = () => {
        console.log("Using Fallback Clip Selection Strategy (Heuristic Distribution)");

        // STRICT RULE: Must generate 6 clips
        const TARGET_CLIPS = 6;
        const MIN_DURATION = 20;
        const MAX_DURATION = 40;

        const clips: ViralMoment[] = [];
        const safeStart = 10; // Skip intro 10s
        const safeEnd = Math.max(videoDuration - 10, safeStart + MIN_DURATION);
        const availableDuration = safeEnd - safeStart;

        if (availableDuration < MIN_DURATION) {
            clips.push({ start: 0, end: videoDuration, reason: "Full short video", score: 85 });
            return clips;
        }

        // Calculate optimal spacing
        let step = availableDuration / TARGET_CLIPS;
        if (step < MIN_DURATION) step = MIN_DURATION;

        for (let i = 0; i < TARGET_CLIPS; i++) {
            const clipStart = safeStart + (i * step);
            const clipDuration = Math.floor(Math.random() * (MAX_DURATION - 25 + 1)) + 25;
            let clipEnd = clipStart + clipDuration;

            if (clipEnd > safeEnd) {
                clipEnd = safeEnd;
                if (clipEnd - clipStart < MIN_DURATION) continue;
            }

            clips.push({
                start: Number(clipStart.toFixed(1)),
                end: Number(clipEnd.toFixed(1)),
                reason: `Visual Start ${i + 1} (Fallback)`,
                score: 70 + Math.floor(Math.random() * 20)
            });
        }

        return clips;
    };

    // Fail-fast checks
    if (!transcript || transcript.length < 50 || transcript.includes("Audio transcription unavailable")) {
        return fallbackStrategy();
    }

    const model = getModel();
    if (!model) {
        console.warn("Analysis: No API Key, using fallback.");
        return fallbackStrategy();
    }

    // --- AGENTIC BEHAVIOR: Adaptive Learning (RAG) ---
    // Fetch successful past clips to guide the model (Few-Shot Prompting)
    let dynamicGuidance = "";
    try {
        const { getTopPerformingClips } = require('./learning'); // Lazy import to avoid cycle if any
        const topClips = await getTopPerformingClips(3);
        if (topClips.length > 0) {
            dynamicGuidance = `
    Here are examples of high-performing clips from your previous work. Use these as a style guide:
    ${topClips.map((c: any, i: number) => `- Example ${i + 1}: "${c.reason}" (Virality Score: ${c.score})`).join('\n')}
    `;
        }
    } catch (e) {
        console.warn("Analysis: Failed to fetch learning data", e);
    }

    const prompt = `
    You are an expert video editor for YouTube Shorts.
    Analyze the following transcript and identify EXACTLY 6 engaging, viral-worthy moments.
    
    ${dynamicGuidance}

    Criteria:
    - 20-45 seconds long (STRICTLY)
    - Strong opinions, insights, or emotional delivery
    - Clear start and end
    - Standalone coherence
    - Spacing: Distribute selected clips across the entire duration. Avoid consecutive minutes if possible.

    Transcript:
    ${transcript.substring(0, 100000)}

    Return valid JSON strictly in this format:
    [
        { "start": 0.0, "end": 10.0, "reason": "...", "score": 90 }
    ]
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        let moments: ViralMoment[] = JSON.parse(jsonStr);

        if (!Array.isArray(moments) || moments.length === 0) throw new Error("Invalid Analysis Result");

        // --- POST-PROCESSING: Deduplication & Spacing Enforcement ---

        // 1. Sort by start time
        moments.sort((a, b) => a.start - b.start);

        // 2. Remove significant overlaps (more than 5s overlap)
        const uniqueMoments: ViralMoment[] = [];
        for (const m of moments) {
            const last = uniqueMoments[uniqueMoments.length - 1];
            if (!last) {
                uniqueMoments.push(m);
                continue;
            }

            // If current starts before last ends - 5s buffer, it's overlapping
            const overlap = last.end - m.start;
            if (overlap > 5) {
                console.warn(`Analysis: Found overlapping clip ${m.start}-${m.end} with ${last.start}-${last.end}. Skipping/merging.`);
                // If this one has better score, maybe swap? For now, just skip to preserve spacing.
                continue;
            }
            uniqueMoments.push(m);
        }

        moments = uniqueMoments;

        // 3. Fill missing clips if deduplication reduced count below 6
        if (moments.length < 6) {
            console.log(`Analysis: Only found ${moments.length} unique clips. Backfilling from heuristic.`);
            const needed = 6 - moments.length;
            // Use fallback strategy but only take what we need and ensure they don't overlap existing
            // This is complex, so for now we'll just append from the fallback list if they don't overlap too much.
            const fallbackClips = fallbackStrategy();

            for (const fc of fallbackClips) {
                if (moments.length >= 6) break;
                // Check overlap with ALL existing
                const hasOverlap = moments.some(ex => {
                    return (fc.start < ex.end && fc.end > ex.start);
                });
                if (!hasOverlap) {
                    moments.push(fc);
                }
            }
            // Sort again
            moments.sort((a, b) => a.start - b.start);
        }

        return moments.slice(0, 6); // Ensure max 6
    } catch (error: any) {
        // Handle different error types
        const errorStr = error.toString();
        const errorMsg = error.message || "";
        
        // Check if it's actually an auth error vs other errors
        const isAuthError = errorMsg.includes("API key") || errorMsg.includes("authentication") || errorMsg.includes("UNAUTHENTICATED");
        
        // 400 errors can be various things - not necessarily key issues
        const isBadRequest = error.status === 400 || errorStr.includes("400");
        
        // Actual API key validation errors from Google
        const isActualKeyError = errorMsg.includes("INVALID_ARGUMENT") || errorMsg.includes("does not have") || errorMsg.includes("permission denied");
        
        if (isActualKeyError || (isAuthError && !isBadRequest)) {
            console.warn("Analysis: Gemini API Key issue detected. Switching to fallback strategy.", errorMsg);
        } else if (isBadRequest) {
            console.warn("Analysis: API returned 400. This might be a temporary issue or key problem. Using fallback.", errorMsg);
        } else {
            console.error("Analysis failed:", errorMsg || error);
        }

        return fallbackStrategy();
    }
}
