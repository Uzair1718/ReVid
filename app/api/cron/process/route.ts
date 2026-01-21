import { NextResponse } from 'next/server';
import { runScheduler } from '@/services/scheduler';

export const maxDuration = 60; // Allow up to 60 seconds execution

export async function GET() {
    try {
        console.log("Cron: Starting scheduler check...");
        await runScheduler();
        return NextResponse.json({ status: 'ok', time: new Date().toISOString() });
    } catch (error: any) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
