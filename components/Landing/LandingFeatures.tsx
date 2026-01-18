'use client';

import { motion } from 'framer-motion';
import { Wand2, Type, Video, Zap, Layers, Sparkles } from 'lucide-react';

export const LandingFeatures = () => {
    const features = [
        {
            icon: Type,
            title: "AI Captions",
            desc: "Generate 99% accurate captions in 48 languages with one click.",
            color: "text-blue-400",
            bg: "bg-blue-500/10"
        },
        {
            icon: Wand2,
            title: "Auto B-Roll",
            desc: "AI automatically finds and inserts relevant B-roll to keep retention high.",
            color: "text-purple-400",
            bg: "bg-purple-500/10"
        },
        {
            icon: Video,
            title: "Magic Cut",
            desc: "Remove silences and bad takes instantly. Turn 1 hour into 60 seconds.",
            color: "text-pink-400",
            bg: "bg-pink-500/10"
        },
        {
            icon: Zap,
            title: "Trendy Transitions",
            desc: "Add zoom-ins, shakes, and slides to make your video dynamic.",
            color: "text-yellow-400",
            bg: "bg-yellow-500/10"
        }
    ];

    return (
        <section className="py-32 bg-black relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                        Everything you need to go <span className="text-purple-500">Viral</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Stop spending hours editing. Let our AI handle the boring stuff while you focus on creating.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group hover:-translate-y-2"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform`}>
                                <feature.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
