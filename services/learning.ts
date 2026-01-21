import { prisma } from '@/lib/db';

export async function getTopPerformingClips(limit: number = 3) {
    // Fetch metrics sorted by score descending
    const metrics = await prisma.engagementMetric.findMany({
        orderBy: { score: 'desc' },
        take: limit
    });

    // In a real relation, we would include the job via filtering, but for RAG context
    // we mostly need the summary/reason and the score.
    // If the 'summary' field captures the "Why this was good" aspect, that's enough.

    return metrics.map(m => ({
        reason: m.summary || "High engagement",
        score: m.score
    }));
}
