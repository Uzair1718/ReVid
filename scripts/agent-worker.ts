import { runScheduler } from '../services/scheduler';

async function main() {
    console.log("Agent Worker Started.");

    // Main Loop
    while (true) {
        try {
            await runScheduler();
        } catch (err) {
            console.error("Critical Worker Error:", err);
        }

        // Wait 10 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
}

main().catch(console.error);
