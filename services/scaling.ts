import { getSystemMetrics } from './monitor';

export const DEFAULT_CONCURRENCY = 8; // Increased for faster rendering
export const MIN_CONCURRENCY = 2;

export async function getOptimalConcurrency(): Promise<number> {
    try {
        const metrics = await getSystemMetrics();
        console.log("System Metrics:", metrics);

        // If CPU usage is > 80% or Free Mem < 20%, throttle down
        if (metrics.cpuUsage > 0.8 || metrics.freeMemPercentage < 0.2) {
            console.warn("High Load Detected! Throttling concurrency.");
            return MIN_CONCURRENCY;
        }

        // If CPU < 50% and plenty of RAM, maybe boost (if we supported > default)
        // For now, return default.
        return DEFAULT_CONCURRENCY;
    } catch (e) {
        console.error("Scaling Error:", e);
        return MIN_CONCURRENCY; // Fail safe
    }
}
