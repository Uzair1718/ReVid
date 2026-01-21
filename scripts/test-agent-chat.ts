import { routeUserPrompt } from '../services/agent-router';
import { prisma } from '@/lib/db';

async function main() {
    console.log("Testing Agent Router...");

    const prompt = "Please schedule a video generation for https://youtube.com/watch?v=agent-test starting tomorrow at 10am.";
    console.log(`User Prompt: "${prompt}"`);

    const result = await routeUserPrompt(prompt);
    console.log("Agent Response:", JSON.stringify(result, null, 2));

    if (result.success && result.data) {
        console.log("SUCCESS: Intent recognized and job created.");

        // Verify DB
        const job = await prisma.job.findFirst({
            where: { id: result.data.id }
        });

        if (job) {
            console.log("DB Verification: PASS");
            console.log("Job:", job);
        } else {
            console.error("DB Verification: FAIL - Job not found in DB.");
        }

    } else {
        console.error("FAILURE: Intent not recognized or job not created.");
    }
}

main().catch(console.error);
