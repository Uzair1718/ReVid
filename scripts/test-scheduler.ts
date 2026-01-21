import { prisma } from '../lib/db';

async function main() {
    console.log("Creating test job...");

    const job = await prisma.job.create({
        data: {
            type: 'VIDEO_GENERATION',
            payload: JSON.stringify({ url: "https://www.youtube.com/watch?v=TEST_VIDEO" }),
            status: 'PENDING',
            runAt: new Date() // Due now
        }
    });

    console.log(`Job created: ${job.id}`);
    console.log("Run 'npx tsx scripts/agent-worker.ts' to process it.");
}

main().catch(console.error);
