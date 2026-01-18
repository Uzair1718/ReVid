import React from 'react';
import { LandingHeader } from '@/components/Landing/LandingHeader';
import { LandingFooter } from '@/components/Landing/LandingFooter';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            <LandingHeader />
            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <h1 className="text-5xl font-bold mb-6 text-center bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Simple, Transparent Pricing
                </h1>
                <p className="text-slate-400 text-center text-xl mb-16 max-w-2xl mx-auto">
                    Choose the plan that fits your content creation needs. No hidden fees.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {[
                        {
                            name: "Starter",
                            price: "$0",
                            period: "/month",
                            description: "Perfect for trying out ReVid Magic.",
                            features: ["3 videos per month", "720p export quality", "Basic AI captions", "Watermarked"],
                            cta: "Start for Free",
                            popular: false
                        },
                        {
                            name: "Pro",
                            price: "$29",
                            period: "/month",
                            description: "For serious creators growing their audience.",
                            features: ["Unlimited videos", "4K export quality", "Advanced AI features", "No watermark", "Priority support"],
                            cta: "Get Pro",
                            popular: true
                        },
                        {
                            name: "Agency",
                            price: "$99",
                            period: "/month",
                            description: "For teams and agencies managing multiple brands.",
                            features: ["Everything in Pro", "Team collaboration", "API access", "Custom branding kits", "Dedicated account manager"],
                            cta: "Contact Sales",
                            popular: false
                        }
                    ].map((plan, i) => (
                        <div key={i} className={`relative p-8 rounded-3xl border ${plan.popular ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-white/5'} flex flex-col`}>
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                                    Most Popular
                                </div>
                            )}
                            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-4xl font-bold">{plan.price}</span>
                                <span className="text-slate-400">{plan.period}</span>
                            </div>
                            <p className="text-slate-400 mb-8">{plan.description}</p>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, j) => (
                                    <li key={j} className="flex items-center gap-3">
                                        <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button className={`w-full py-6 text-lg font-bold rounded-xl ${plan.popular ? 'bg-white text-black hover:bg-slate-200' : 'bg-white/10 hover:bg-white/20'}`}>
                                {plan.cta}
                            </Button>
                        </div>
                    ))}
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
