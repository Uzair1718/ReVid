import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_PATH = path.resolve(process.cwd(), 'agent-db.json');

// Types based on our Schema
export type Job = {
    id: string;
    type: string;
    payload: string;
    status: string;
    result?: string | null;
    runAt: Date | string;
    createdAt: Date | string;
    updatedAt: Date | string;
};

export type Schedule = {
    id: string;
    url: string;
    frequency: string;
    day?: string | null;
    lastRun?: Date | string | null;
    isActive: boolean;
    createdAt: Date | string;
};

export type EngagementMetric = {
    id: string;
    jobId: string;
    type: string; // 'feedback', 'page_view'
    value: number;
    score: number; // specific virality score
    summary?: string; // qualitative reasoning
    timestamp: Date | string;
    metadata?: Record<string, any>;
    createdAt: Date | string;
};

interface Schema {
    Job: Job[];
    Schedule: Schedule[];
    EngagementMetric: EngagementMetric[];
}

// Initial State
const initialState: Schema = {
    Job: [],
    Schedule: [],
    EngagementMetric: []
};

class SimpleDB {
    private data: Schema;

    constructor() {
        this.data = this.load();
    }

    private load(): Schema {
        if (!fs.existsSync(DB_PATH)) {
            fs.writeFileSync(DB_PATH, JSON.stringify(initialState, null, 2));
            return JSON.parse(JSON.stringify(initialState));
        }
        try {
            const loaded = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
            // Ensure all collections exist
            if (!loaded.EngagementMetric) loaded.EngagementMetric = [];
            return loaded;
        } catch (e) {
            console.error("DB Load Error, resetting:", e);
            return JSON.parse(JSON.stringify(initialState));
        }
    }

    private save() {
        fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2));
    }

    // --- Job Collection Mimic ---
    public job = {
        findFirst: async (args: { where: any, orderBy?: any }) => {
            this.data = this.load(); // Reload to get latest
            const jobs = this.data.Job.filter(j => this.match(j, args.where));
            if (args.orderBy) {
                // simple sort logic if needed, for scheduler usually date
                jobs.sort((a, b) => new Date(a.runAt).getTime() - new Date(b.runAt).getTime());
            }
            return jobs.length > 0 ? jobs[0] : null;
        },
        findMany: async (args: { where: any }) => {
            this.data = this.load();
            return this.data.Job.filter(j => this.match(j, args.where));
        },
        create: async (args: { data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'> }) => {
            this.data = this.load();
            const newJob: Job = {
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                result: null,
                ...args.data,
                // Ensure dates are strings or handled consistently
                runAt: args.data.runAt instanceof Date ? args.data.runAt.toISOString() : args.data.runAt
            };
            this.data.Job.push(newJob);
            this.save();
            return newJob;
        },
        update: async (args: { where: { id: string }, data: Partial<Job> }) => {
            this.data = this.load();
            const index = this.data.Job.findIndex(j => j.id === args.where.id);
            if (index === -1) throw new Error("Job not found");

            const updated = {
                ...this.data.Job[index],
                ...args.data,
                updatedAt: new Date().toISOString()
            };

            // Handle runAt update if present
            if (args.data.runAt && args.data.runAt instanceof Date) {
                updated.runAt = args.data.runAt.toISOString();
            }

            this.data.Job[index] = updated;
            this.save();
            return updated;
        }
    };

    // --- EngagementMetric Collection Mimic ---
    public engagementMetric = {
        findMany: async (args: { where?: any, orderBy?: any, take?: number }) => {
            this.data = this.load();
            let metrics = this.data.EngagementMetric;
            if (args.where) {
                metrics = metrics.filter(m => this.match(m, args.where));
            }
            if (args.orderBy) {
                // Support { views: 'desc' } etc.
                const key = Object.keys(args.orderBy)[0];
                const dir = args.orderBy[key];
                metrics.sort((a: any, b: any) => {
                    return dir === 'desc' ? b[key] - a[key] : a[key] - b[key];
                });
            }
            if (args.take) {
                metrics = metrics.slice(0, args.take);
            }
            return metrics;
        },
        create: async (args: { data: Omit<EngagementMetric, 'id' | 'createdAt'> }) => {
            this.data = this.load();
            const newMetric: EngagementMetric = {
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                ...args.data,
                timestamp: args.data.timestamp instanceof Date ? args.data.timestamp.toISOString() : args.data.timestamp
            };
            this.data.EngagementMetric.push(newMetric);
            this.save();
            return newMetric;
        }
    };


    // --- Helper to match 'where' clause (simple version) ---
    private match(item: any, where: any): boolean {
        for (const key in where) {
            const val = where[key];

            // Handle { lte: Date }
            if (typeof val === 'object' && val !== null && 'lte' in val) {
                const itemDate = new Date(item[key]).getTime();
                const compareDate = new Date(val.lte).getTime();
                if (itemDate > compareDate) return false;
                continue;
            }

            // Exact match
            if (item[key] !== val) return false;
        }
        return true;
    }
}

export const prisma = new SimpleDB();
