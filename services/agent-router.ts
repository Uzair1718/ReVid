import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from '@/lib/db';

const getModel = () => {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        console.log("[AGENT-ROUTER] Gemini model initialized successfully");
        return model;
    } catch (e) {
        console.error("[AGENT-ROUTER] Failed to initialize Gemini model:", e);
        throw e;
    }
};

// Available Tools Definition for Gemini
const tools = [
    {
        name: "schedule_job",
        description: "Schedule a video generation task or analysis.",
        parameters: {
            type: "object",
            properties: {
                url: { type: "string", description: "The YouTube URL to process" },
                type: { type: "string", enum: ["VIDEO_GENERATION"], description: "Type of job" },
                runAt: { type: "string", description: "ISO date string for when to run" }
            },
            required: ["url", "type"]
        }
    }
];

export async function routeUserPrompt(prompt: string) {
    const model = getModel();

    const systemPrompt = `
    You are an autonomous agent controller for a video editing system.
    Your goal is to understand the user's intent and call the appropriate tool.
    Current Date: ${new Date().toISOString()}
    
    If the user asks to "schedule a video from [URL] for tomorrow", calculate the date and call schedule_job.
    `;

    // Note: Gemini function calling implementation varies by SDK version. 
    // For simplicity in this roadmap prototype, we'll ask for JSON output matching a schema 
    // if native tool Calling config is complex to setup in one file without correct type defs.

    // Let's us JSON mode enforcing.
    const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}\n\nRespond with a JSON object: { "tool": "tool_name", "args": { ... } } or { "reply": "text response" }`;

    try {
        const result = await model.generateContent(fullPrompt);
        const text = result.response.text();
        const jsonFn = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const action = JSON.parse(jsonFn);

        if (action.tool === 'schedule_job') {
            const { url, type, runAt } = action.args;

            // Execute the tool
            const job = await prisma.job.create({
                data: {
                    type: type || 'VIDEO_GENERATION',
                    payload: JSON.stringify({ url }), // Simplified payload
                    status: 'PENDING',
                    runAt: runAt || new Date().toISOString()
                }
            });

            return {
                success: true,
                message: `Scheduled job ${job.id} for ${runAt || 'now'}.`,
                data: job
            };
        } else {
            return { success: true, message: action.reply || "I'm not sure how to help with that." };
        }

    } catch (e: any) {
        console.error("Agent Router Error:", e);
        return { success: false, message: "Failed to understand request." };
    }
}
