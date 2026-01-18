'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

export const LandingHero = ({ onStart }: { onStart: () => void }) => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background Video Loop */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10" />
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-50"
                >
                    <source src="https://cdn.pixabay.com/video/2023/10/22/186115-877653483_large.mp4" type="video/mp4" />
                </video>
            </div>

            <div className="relative z-20 max-w-5xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">AI Video Editor 2.0 is here</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
                        Create Viral Shorts <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
                            10x Faster with AI
                        </span>
                    </h1>

                    <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Generate captions, B-roll, and transitions automatically. The all-in-one AI video editor used by top creators.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <Button
                            size="lg"
                            onClick={onStart}
                            className="h-16 px-10 rounded-full bg-white text-black hover:bg-slate-200 text-lg font-bold shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all hover:scale-105 w-full md:w-auto"
                        >
                            Try for Free
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-16 px-10 rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-md text-lg font-bold w-full md:w-auto"
                        >
                            <Play className="mr-2 w-5 h-5 fill-current" />
                            Watch Demo
                        </Button>
                    </div>

                    <div className="mt-12 flex items-center justify-center gap-8 text-slate-500 grayscale opacity-70">
                        {/* Trust Logos */}
                        {['Netflix', 'Spotify', 'Google', 'Airbnb'].map(brand => (
                            <span key={brand} className="text-xl font-bold">{brand}</span>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
