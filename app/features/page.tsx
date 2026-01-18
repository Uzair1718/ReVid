import React from 'react';
import { LandingHeader } from '@/components/Landing/LandingHeader';
import { LandingFooter } from '@/components/Landing/LandingFooter';

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            <LandingHeader />
            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <h1 className="text-5xl font-bold mb-12 text-center bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Powerful Features for Creators
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            title: "AI Auto-Clipping",
                            description: "Automatically identify and extract the most engaging moments from your long-form videos.",
                            icon: "✂️"
                        },
                        {
                            title: "Smart Captions",
                            description: "Generate accurate, animated captions in seconds with support for multiple languages.",
                            icon: "📝"
                        },
                        {
                            title: "Face Tracking",
                            description: "Keep the speaker centered in vertical video format automatically.",
                            icon: "👤"
                        },
                        {
                            title: "B-Roll Magic",
                            description: "Automatically insert relevant stock footage to keep viewers engaged.",
                            icon: "🎬"
                        },
                        {
                            title: "Voiceover Studio",
                            description: "Record and edit voiceovers directly within the platform.",
                            icon: "🎙️"
                        },
                        {
                            title: "Custom Branding",
                            description: "Add your logo, colors, and fonts to maintain brand consistency.",
                            icon: "🎨"
                        }
                    ].map((feature, i) => (
                        <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all hover:bg-white/10">
                            <div className="text-4xl mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
