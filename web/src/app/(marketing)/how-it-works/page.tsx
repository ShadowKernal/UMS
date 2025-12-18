"use client";

import { motion } from "framer-motion";

export default function HowItWorksPage() {
    const steps = [
        {
            num: "01",
            title: "Set Your Preferences",
            description: "Tell us about your diet, allergies, and fitness goals. We support everything from Keto to Vegan.",
            color: "bg-blue-100 text-blue-600"
        },
        {
            num: "02",
            title: "Get Your Plan",
            description: "We instantly generate a weekly meal plan that matches your macros and tastes.",
            color: "bg-purple-100 text-purple-600"
        },
        {
            num: "03",
            title: "Shop with Ease",
            description: "Access a smart grocery list on your phone. Items are sorted by aisle for a speedy run.",
            color: "bg-orange-100 text-orange-600"
        },
        {
            num: "04",
            title: "Prep in batches",
            description: "Use our step-by-step batch cooking guide to prep a whole week of food in under 2 hours.",
            color: "bg-emerald-100 text-emerald-600"
        }
    ];

    return (
        <div className="min-h-screen bg-white pt-20 pb-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6"
                    >
                        How <span className="text-emerald-600">it Works</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-600"
                    >
                        From chaos to organized bliss in four simple steps.
                    </motion.p>
                </div>

                <div className="space-y-24">
                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-24`}
                        >
                            <div className="flex-1">
                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 ${step.color}`}>
                                    {step.num}
                                </div>
                                <h3 className="text-3xl font-bold text-slate-900 mb-4">{step.title}</h3>
                                <p className="text-lg text-slate-600 leading-relaxed">{step.description}</p>
                            </div>
                            <div className="flex-1 w-full">
                                <div className="aspect-video rounded-3xl bg-slate-100 border border-slate-200 shadow-xl flex items-center justify-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 opacity-50" />
                                    <span className="text-slate-400 font-medium z-10">Illustration Placeholder</span>
                                    {/* In a real app, you'd put an image here. */}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
