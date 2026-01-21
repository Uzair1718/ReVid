import AgentChat from '@/components/Agent/AgentChat';

export default function AgentPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-zinc-950 text-white gap-8">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                    Autonomous Agent
                </h1>
                <p className="text-zinc-400">Delegate tasks to your AI assistant.</p>
            </div>

            <AgentChat />
        </div>
    );
}
