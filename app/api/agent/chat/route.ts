import { NextRequest, NextResponse } from 'next/server';
import { routeUserPrompt } from '@/services/agent-router';

export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json();
        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const result = await routeUserPrompt(message);
        return NextResponse.json(result);

    } catch (err: any) {
        console.error("Chat API Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
