import React from 'react';
import { LandingHeader } from '@/components/Landing/LandingHeader';
import { LandingFooter } from '@/components/Landing/LandingFooter';
import { Star } from 'lucide-react';

export default function SuccessStoriesPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            <LandingHeader />
            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <h1 className="text-5xl font-bold mb-6 text-center bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Creator Success Stories
                </h1>
                <p className="text-slate-400 text-center text-xl mb-16 max-w-2xl mx-auto">
                    See how creators are growing their channels 10x faster with ReVid Magic.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            name: "Alex Hormozi Style",
                            role: "Business Coach",
                            image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
                            quote: "ReVid Magic cut my editing time by 90%. I can now post 3x more content without hiring more editors.",
                            stats: "1M+ Views Gained"
                        },
                        {
                            name: "Sarah Jenkins",
                            role: "Lifestyle Vlogger",
                            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
                            quote: "The auto-captions are incredibly accurate. It used to take me hours, now it takes minutes.",
                            stats: "500k+ Subscribers"
                        },
                        {
                            name: "Tech Daily",
                            role: "Tech Reviewer",
                            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
                            quote: "The B-roll insertion feature is a game changer. It makes my talking head videos so much more engaging.",
                            stats: "200% Engagement Boost"
                        },
                        {
                            name: "Fitness Pro",
                            role: "Personal Trainer",
                            image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop",
                            quote: "I love the face tracking for my workout videos. It keeps me in frame perfectly for vertical shorts.",
                            stats: "50k to 150k Followers"
                        },
                        {
                            name: "Cooking with Joy",
                            role: "Food Creator",
                            image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop",
                            quote: "The templates are beautiful and easy to customize. My food videos look so professional now.",
                            stats: "Viral on TikTok"
                        },
                        {
                            name: "Crypto King",
                            role: "Finance Analyst",
                            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
                            quote: "Fastest workflow I've ever used. From recording to publishing in under 15 minutes.",
                            stats: "Daily Upload Streak"
                        }
                    ].map((story, i) => (
                        <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-6">
                            <div className="flex items-center gap-4">
                                <img src={story.image} alt={story.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/50" />
                                <div>
                                    <h3 className="font-bold">{story.name}</h3>
                                    <p className="text-sm text-slate-400">{story.role}</p>
                                </div>
                            </div>
                            <div className="flex gap-1 text-yellow-500">
                                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 fill-current" />)}
                            </div>
                            <p className="text-slate-300 italic">"{story.quote}"</p>
                            <div className="mt-auto pt-4 border-t border-white/10">
                                <span className="text-purple-400 font-bold text-sm">{story.stats}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
