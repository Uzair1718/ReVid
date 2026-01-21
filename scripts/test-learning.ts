import { prisma } from '../lib/db';
import { getTopPerformingClips } from '../services/learning';

async function main() {
    console.log("Testing Learning Service...");

    // 1. Seed a fake engagement metric
    console.log("Seeding fake feedback...");
    await prisma.engagementMetric.create({
        data: {
            jobId: 'test-job-123',
            type: 'feedback',
            value: 95,
            score: 95,
            summary: 'Great pacing and emotional hook at the start',
            timestamp: new Date()
        }
    });

    // 2. Fetch top clips
    console.log("Fetching top clips...");
    const clips = await getTopPerformingClips(3);

    console.log("Result:", JSON.stringify(clips, null, 2));

    if (clips.length > 0 && clips[0].score === 95) {
        console.log("SUCCESS: Retrieved seeded metric correctly.");
    } else {
        console.error("FAILURE: Did not retrieve expected metric.");
        process.exit(1);
    }
}

main().catch(console.error);
