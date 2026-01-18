'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Check, Star, Menu, X } from 'lucide-react';
import Link from 'next/link';

export const LandingHeader = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg overflow-hidden shadow-purple-500/20 ring-1 ring-white/10">
                        <img src="/favicon.ico" alt="ReVid Magic Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">ReVid Magic</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    {[
                        { name: 'Features', href: '/features' },
                        { name: 'Pricing', href: '/pricing' },
                        { name: 'Success Stories', href: '/success-stories' }
                    ].map((item) => (
                        <Link key={item.name} href={item.href} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 bg-black border-b border-white/10 p-6 md:hidden flex flex-col gap-4"
                >
                    {[
                        { name: 'Features', href: '/features' },
                        { name: 'Pricing', href: '/pricing' },
                        { name: 'Success Stories', href: '/success-stories' }
                    ].map((item) => (
                        <Link key={item.name} href={item.href} className="text-lg font-medium text-slate-300 hover:text-white">
                            {item.name}
                        </Link>
                    ))}
                </motion.div>
            )}
        </header>
    );
};
