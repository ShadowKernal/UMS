"use client";

import { motion } from "framer-motion";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6"
                    >
                        Simple, Transparent <span className="text-emerald-600">Pricing</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-600"
                    >
                        Start for free, upgrade when you&apos;re ready. No hidden fees.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Tier */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 relative overflow-hidden"
                    >
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Free Starter</h3>
                            <p className="text-slate-500">Perfect for getting organized.</p>
                            <div className="mt-6 flex items-baseline">
                                <span className="text-5xl font-extrabold text-slate-900">$0</span>
                                <span className="text-slate-500 ml-2">/month</span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {[
                                "3 Recipes per week",
                                "Basic Shopping List",
                                "Community Recipes",
                                "Mobile App Access"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700">
                                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <button className="w-full py-4 rounded-xl border-2 border-slate-200 font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                            Get Started Free
                        </button>
                    </motion.div>

                    {/* Pro Tier */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl border border-emerald-800 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                            MOST POPULAR
                        </div>
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold mb-2">PrepMaster Pro</h3>
                            <p className="text-emerald-200">For serious meal preppers.</p>
                            <div className="mt-6 flex items-baseline">
                                <span className="text-5xl font-extrabold">$12</span>
                                <span className="text-emerald-200 ml-2">/month</span>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {[
                                "Unlimited Recipes",
                                "Smart Automated Lists",
                                "Macro & Calorie Tracking",
                                "Batch Cooking Guides",
                                "Priority Support"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-emerald-100">
                                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <button className="w-full py-4 rounded-xl bg-emerald-500 font-bold text-white hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-900/50">
                            Start 14-Day Free Trial
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
