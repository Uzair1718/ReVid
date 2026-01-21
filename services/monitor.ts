import os from 'os';

export interface SystemMetrics {
    cpuUsage: number;
    freeMemPercentage: number;
    loadAverage: number[]; // 1, 5, 15 min
}

// Simple CPU Usage Helper (since os.cpus() returns absolute times)
async function getCpuUsage(): Promise<number> {
    const start = os.cpus();
    await new Promise(r => setTimeout(r, 100));
    const end = os.cpus();

    let idleDiff = 0;
    let totalDiff = 0;

    for (let i = 0; i < start.length; i++) {
        const startCpu = start[i].times;
        const endCpu = end[i].times;

        const idle = endCpu.idle - startCpu.idle;
        const total = (endCpu.user + endCpu.nice + endCpu.sys + endCpu.irq + endCpu.idle) -
            (startCpu.user + startCpu.nice + startCpu.sys + startCpu.irq + startCpu.idle);

        idleDiff += idle;
        totalDiff += total;
    }

    return totalDiff > 0 ? 1 - (idleDiff / totalDiff) : 0;
}

export async function getSystemMetrics(): Promise<SystemMetrics> {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const cpu = await getCpuUsage();

    return {
        cpuUsage: Number(cpu.toFixed(2)),
        freeMemPercentage: Number((freeMem / totalMem).toFixed(2)),
        loadAverage: os.loadavg()
    };
}
