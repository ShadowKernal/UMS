"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, RestaurantMenu, Timer, LocalFireDepartment, ArrowForward } from "@mui/icons-material";
import { Meal, MealService } from "@/lib/meal-service";
import Image from "next/image";

export default function RecipesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [recipes, setRecipes] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);

    const loadInitialRecipes = async () => {
        setLoading(true);
        try {
            // Load some popular chicken recipes as initial state
            const results = await MealService.searchMeals("chicken");
            setRecipes(results.slice(0, 9));
        } catch (err) {
            console.error("Failed to load recipes", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) {
            loadInitialRecipes();
            return;
        }
        setLoading(true);
        try {
            const results = await MealService.searchMeals(searchQuery);
            setRecipes(results);
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitialRecipes();
    }, []);

    return (
        <div className="min-h-screen bg-white relative selection:bg-emerald-500/30">
            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none -z-50 overflow-hidden bg-white">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_30%_20%,_#ecfdf5_0%,_transparent_40%),radial-gradient(circle_at_70%_80%,_#f8fafc_0%,_transparent_40%)]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-32 pb-32 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-emerald-700 font-bold text-xs uppercase tracking-widest mb-8 border border-emerald-500/20 shadow-sm">
                            <RestaurantMenu className="text-sm" />
                            Premium Culinary Library
                        </div>
                        <h1 className="text-6xl md:text-8xl font-bold leading-[0.95] mb-8 tracking-tighter text-slate-900">
                            Explore <span className="text-gradient-emerald">Recipes.</span>
                        </h1>
                        <p className="text-xl text-slate-500 leading-relaxed font-light">
                            Discover nutrition-dense, chef-crafted meals engineered for peak performance and effortless preparation.
                        </p>
                    </motion.div>
                </div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-2xl mx-auto mb-20"
                >
                    <form onSubmit={handleSearch} className="group relative">
                        <div className="absolute inset-0 bg-emerald-500/10 rounded-[2.5rem] blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
                        <div className="relative glass-card bg-white/80 p-3 rounded-[2.5rem] border-slate-200/60 shadow-2xl flex items-center gap-2">
                            <div className="pl-4 text-slate-400">
                                <Search />
                            </div>
                            <Input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by ingredient or dish..."
                                className="flex-1 bg-transparent border-none text-lg placeholder:text-slate-400 focus-visible:ring-0 h-14"
                            />
                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-14 px-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg shadow-[0_10px_30px_-5px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95 border-none"
                            >
                                {loading ? "..." : "Search"}
                            </Button>
                        </div>
                    </form>
                </motion.div>

                {/* Results Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <AnimatePresence mode="popLayout">
                        {recipes.map((recipe, idx) => (
                            <motion.div
                                key={recipe.idMeal}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: (idx % 9) * 0.05 }}
                                whileHover={{ y: -12 }}
                                className="group relative"
                            >
                                <div className="absolute inset-0 bg-emerald-500/5 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 group-hover:shadow-2xl group-hover:border-emerald-500/30 transition-all duration-500">
                                    {/* Image Section */}
                                    <div className="h-64 relative bg-slate-50 overflow-hidden">
                                        <Image
                                            src={recipe.strMealThumb}
                                            alt={recipe.strMeal}
                                            fill
                                            className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                                        <div className="absolute top-6 right-6">
                                            <div className="glass-card bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border-none shadow-lg text-emerald-700 font-bold text-xs">
                                                {recipe.strCategory}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-8">
                                        <h3 className="text-2xl font-bold text-slate-900 mb-4 line-clamp-2 min-h-[4rem] group-hover:text-emerald-600 transition-colors">
                                            {recipe.strMeal}
                                        </h3>

                                        <div className="flex items-center gap-6 text-sm text-slate-500 mb-8 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Timer className="text-emerald-500 text-sm" />
                                                25-35 min
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <LocalFireDepartment className="text-emerald-500 text-sm" />
                                                ~450 kcal
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            className="w-full h-14 rounded-2xl border-slate-200 text-slate-600 font-bold group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 group-hover:shadow-[0_10px_30px_-5px_rgba(16,185,129,0.4)] transition-all flex items-center justify-between px-6"
                                        >
                                            View Preparation
                                            <ArrowForward className="text-sm" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {!loading && recipes.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="text-slate-300 mb-4">
                                    <RestaurantMenu className="text-8xl" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">No culinary matches found</h3>
                                <p className="text-slate-500">Try refining your search terms for better results.</p>
                                <Button
                                    variant="link"
                                    onClick={loadInitialRecipes}
                                    className="text-emerald-600 font-bold mt-4"
                                >
                                    Reset to curated collection
                                </Button>
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>

            {/* CTA Section */}
            <section className="py-24 px-6 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="relative rounded-[3rem] overflow-hidden bg-emerald-900 border border-emerald-500/30 p-12 md:p-24 text-center"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent blur-3xl" />
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
                                Fuel Your Ambition with <span className="text-emerald-400">PrepMaster.</span>
                            </h2>
                            <p className="text-lg text-emerald-100/60 mb-12 max-w-xl mx-auto">
                                Join high-performers who trust our science-backed culinary engine for their nutrition.
                            </p>
                            <Button className="h-20 px-16 text-xl rounded-full bg-white text-emerald-900 hover:bg-emerald-50 font-bold transition-transform hover:-translate-y-1 shadow-[0_0_50px_rgba(255,255,255,0.2)] border-none">
                                Start Free Trial
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
