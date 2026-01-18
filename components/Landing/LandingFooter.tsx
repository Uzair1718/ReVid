'use client';

import { Button } from '@/components/ui/button';
import { Play, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';

export const LandingFooter = () => {
    return (
        <footer className="bg-black border-t border-white/10 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <Play className="w-4 h-4 text-white fill-current" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">ReVid Magic</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            The #1 AI video editor for creators who want to grow faster.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Instagram, Youtube, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white hover:text-black transition-all">
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {[
                        { title: "Product", links: ["Features", "Pricing", "Showcase", "Changelog"] },
                        { title: "Resources", links: ["Blog", "Community", "Help Center", "API Docs"] },
                        { title: "Company", links: ["About", "Careers", "Legal", "Contact"] }
                    ].map((col, i) => (
                        <div key={i}>
                            <h4 className="font-bold text-white mb-6">{col.title}</h4>
                            <ul className="space-y-4">
                                {col.links.map(link => (
                                    <li key={link}>
                                        <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">{link}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-500 text-sm">© 2024 ReVid Magic AI. All rights reserved.</p>
                    <div className="flex gap-8">
                        <a href="#" className="text-slate-500 hover:text-white text-sm">Privacy Policy</a>
                        <a href="#" className="text-slate-500 hover:text-white text-sm">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
