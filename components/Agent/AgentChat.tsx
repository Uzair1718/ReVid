"use client";

import { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type Message = {
    role: 'user' | 'agent';
    content: string;
};

export default function AgentChat() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'agent', content: "Hello! I'm your autonomous agent. You can ask me to schedule video tasks or analyze content." }
    ]);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/agent/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });
            const data = await res.json();

            setMessages(prev => [...prev, {
                role: 'agent',
                content: data.success ? data.message : "Sorry, something went wrong."
            }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'agent', content: "Error connecting to agent." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px] w-full max-w-md border rounded-xl overflow-hidden bg-background shadow-xl">
            <div className="bg-primary/10 p-4 flex items-center gap-2 border-b">
                <Bot className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">ReVid Agent</h3>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="flex flex-col gap-4">
                    {messages.map((m, i) => (
                        <div key={i} className={cn(
                            "flex gap-3 max-w-[80%]",
                            m.role === 'user' ? "self-end flex-row-reverse" : "self-start"
                        )}>
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                m.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                            )}>
                                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div className={cn(
                                "p-3 rounded-lg text-sm",
                                m.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                            )}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3 self-start">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <Bot className="w-4 h-4 animate-pulse" />
                            </div>
                            <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground animate-pulse">
                                Thinking...
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="p-4 border-t flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask me to schedule a task..."
                />
                <Button size="icon" onClick={handleSend} disabled={loading}>
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
