'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export const LandingShowcase = () => {
    return (
        <section className="py-32 bg-gradient-to-b from-black to-purple-900/20 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
                            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Interactive Editor</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                            Edit like a Pro, <br />
                            <span className="text-purple-400">Without the learning curve.</span>
                        </h2>
                        <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                            Our intuitive dashboard gives you granular control over every aspect of your video. Adjust captions, change styles, and export in seconds.
                        </p>

                        <ul className="space-y-4 mb-10">
                            {[
                                'Real-time preview of all changes',
                                'Drag-and-drop timeline editor',
                                'One-click aspect ratio conversion',
                                'Export in 4K quality'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-300">
                                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                        <Check className="w-3 h-3" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <Button className="h-14 px-8 rounded-full bg-white text-black hover:bg-slate-200 font-bold text-lg">
                            Start Creating Now
                        </Button>
                    </div>

                    <div className="relative">
                        {/* Mockup Frame */}
                        <div className="relative rounded-3xl overflow-hidden border-8 border-slate-800 bg-slate-900 shadow-2xl shadow-purple-900/50 aspect-[4/3] group">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black opacity-50" />

                            {/* Simulated UI */}
                            {/* Video Demo */}
                            <div className="absolute inset-0 bg-slate-900">
                                <video
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    poster="/dashboard-preview.jpg"
                                >
                                    {/* Placeholder video - User to replace src */}
                                    <source src="/demo.mp4" type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>

                                {/* Overlay gradient for better text readability if needed, or just polish */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent pointer-events-none" />
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="absolute -top-10 -right-10 bg-white p-4 rounded-2xl shadow-xl z-10"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-2xl">🚀</div>
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase">Views</div>
                                    <div className="text-xl font-black text-slate-900">+1.2M</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
