"use client";

import { motion } from "framer-motion";

export default function FeaturesPage() {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    // Features data
    const features = [
        {
            title: "Custom Meal Plans",
            description: "Tailored to your dietary needs (Vegan, Keto, GF) and fitness goals.",
            icon: "🥗"
        },
        {
            title: "Smart Shopping List",
            description: "Automatically aggregated lists sorted by aisle. Never forget an item again.",
            icon: "🛒"
        },
        {
            title: "Batch Cooking Mode",
            description: "Step-by-step guides for 90-minute power cooking sessions.",
            icon: "⏱️"
        },
        {
            title: "Macro Tracking",
            description: "Detailed nutritional info for every meal to keep you on track.",
            icon: "📊"
        },
        {
            title: "Pantry Management",
            description: "Reduce waste by using what you already have in stock.",
            icon: "🏠"
        },
        {
            title: "Family Friendly",
            description: "Scale recipes for families of any size with one click.",
            icon: "👨‍👩‍👧‍👦"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6"
                    >
                        Features that <span className="text-emerald-600">Empower You</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-600"
                    >
                        We&apos;ve built the ultimate toolkit to make healthy eating effortless, affordable, and delicious.
                    </motion.p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            variants={item}
                            whileHover={{ y: -5 }}
                            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-3xl mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                            <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
