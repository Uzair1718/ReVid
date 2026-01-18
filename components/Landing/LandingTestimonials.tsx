'use client';

import { Star } from 'lucide-react';

export const LandingTestimonials = () => {
    return (
        <section className="py-32 bg-black border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-black text-white mb-6">Loved by Creators</h2>
                    <p className="text-slate-400 text-lg">Join 50,000+ creators who are scaling their content with AI.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            name: "Sarah Jenkins",
                            role: "Lifestyle Vlogger",
                            image: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
                            text: "I used to spend 4 hours editing a single short. Now it takes me 5 minutes. This tool is a game changer."
                        },
                        {
                            name: "Marcus Chen",
                            role: "Tech Reviewer",
                            image: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
                            text: "The auto-captions are incredibly accurate, and the B-roll suggestions are spot on. Highly recommended."
                        },
                        {
                            name: "Elena Rodriguez",
                            role: "Digital Marketer",
                            image: "https://i.pravatar.cc/150?u=a04258114e29026302d",
                            text: "We've seen a 300% increase in engagement since we started using ClipMagic for our client's reels."
                        }
                    ].map((t, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
                            <div className="flex gap-1 mb-6">
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 text-yellow-500 fill-current" />)}
                            </div>
                            <p className="text-slate-300 text-lg mb-8 leading-relaxed">"{t.text}"</p>
                            <div className="flex items-center gap-4">
                                <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full border-2 border-white/10" />
                                <div>
                                    <div className="font-bold text-white">{t.name}</div>
                                    <div className="text-sm text-slate-500">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
