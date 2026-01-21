import { schedule, Handler } from '@netlify/functions';
import { runScheduler } from '../../services/scheduler';

// Define the handler
// Note: We're importing the logic from our Next.js app services.
// Netlify's esbuild bundler should handle this relative import.
const task: Handler = async (event) => {
    console.log("Netlify Cron: Starting scheduler check...");
    try {
        await runScheduler();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Scheduler ran successfully" }),
        };
    } catch (error) {
        console.error("Netlify Cron Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: String(error) }),
        };
    }
};

// Schedule it to run every minute
// Cron syntax: "* * * * *"
export const handler = schedule("* * * * *", task);
