"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search } from "@mui/icons-material";

export default function RecipesPage() {
    const recipes = [
        { title: "Keto Beef Tacos", calories: 450, time: "25 min", image: "🌮", tags: ["Keto", "Dinner"] },
        { title: "Avocado Toast", calories: 320, time: "10 min", image: "🥑", tags: ["Vegan", "Breakfast"] },
        { title: "Grilled Salmon", calories: 500, time: "30 min", image: "🐟", tags: ["GF", "Dinner"] },
        { title: "Protein Smoothie", calories: 280, time: "5 min", image: "🥤", tags: ["High Protein"] },
        { title: "Chicken Salad", calories: 410, time: "15 min", image: "🥗", tags: ["Lunch", "Low Carb"] },
        { title: "Quinoa Bowl", calories: 380, time: "20 min", image: "🍲", tags: ["Vegan", "Lunch"] },
    ];

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight"
                    >
                        Explore <span className="text-emerald-600">Recipes</span>
                    </motion.h1>
                    <p className="text-lg text-slate-600">Thousands of healthy, prep-friendly meals.</p>
                </div>

                {/* Search & Filter Mock */}
                <div className="flex justify-center mb-16">
                    <div className="bg-white p-2 rounded-full shadow-lg shadow-emerald-100 border border-slate-200 flex w-full max-w-md relative hover:shadow-xl transition-shadow">
                        <Input
                            type="text"
                            placeholder="Search recipes (e.g., 'chicken', 'vegan')..."
                            className="flex-1 border-0 shadow-none focus-visible:ring-0 px-4 h-12 text-base rounded-full"
                        />
                        <Button className="rounded-full px-8 h-12">
                            <Search className="mr-2 h-4 w-4" /> Search
                        </Button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recipes.map((recipe, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -8 }}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-300 group cursor-pointer"
                        >
                            <div className="h-48 bg-slate-50 relative overflow-hidden flex items-center justify-center text-6xl group-hover:bg-emerald-50 transition-colors duration-500">
                                <span className="transform group-hover:scale-110 transition-transform duration-500 block">{recipe.image}</span>
                                <div className="absolute top-3 right-3">
                                    <span className="text-xs font-bold text-slate-600 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
                                        ⭐ 4.8
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex gap-2 mb-4 flex-wrap">
                                    {recipe.tags.map(tag => (
                                        <span key={tag} className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">{recipe.title}</h3>
                                <div className="flex justify-between text-sm text-slate-500 mb-6">
                                    <span className="flex items-center gap-1">⏱️ {recipe.time}</span>
                                    <span className="flex items-center gap-1">🔥 {recipe.calories} kcal</span>
                                </div>
                                <Button variant="outline" className="w-full justify-between group-hover:bg-emerald-50 group-hover:border-emerald-200 group-hover:text-emerald-700">
                                    View Recipe
                                    <span className="text-lg">→</span>
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
