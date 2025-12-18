"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Meal, MealService } from "@/lib/meal-service";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Add, Delete, RestaurantMenu } from "@mui/icons-material";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import LottiePlayer from "@/components/ui/LottiePlayer";


const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type WeeklyPlan = {
    [day: string]: Meal[];
};

export default function MealPlanner() {
    const [plan, setPlan] = useState<WeeklyPlan>({});
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Load plan from localStorage on mount
    useEffect(() => {
        const savedPlan = localStorage.getItem("mealPlan");
        if (savedPlan) {
            setPlan(JSON.parse(savedPlan));
        }
    }, []);

    // Save plan to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("mealPlan", JSON.stringify(plan));
    }, [plan]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        try {
            const meals = await MealService.searchMeals(searchQuery);
            setSearchResults(meals);
        } catch (error) {
            console.error("Failed to search meals", error);
        } finally {
            setLoading(false);
        }
    };

    const openSearch = (day: string) => {
        setSelectedDay(day);
        setSearchQuery("");
        setSearchResults([]);
        setIsSearchOpen(true);
        loadSuggestions();
    };

    const loadSuggestions = async () => {
        setLoading(true);
        try {
            const meal = await MealService.getRandomMeal();
            if (meal) setSearchResults([meal]);
        } finally {
            setLoading(false);
        }
    }

    const addToPlan = (meal: Meal) => {
        if (!selectedDay) return;
        setPlan(prev => ({
            ...prev,
            [selectedDay]: [...(prev[selectedDay] || []), meal]
        }));
        setIsSearchOpen(false);
    };

    const removeFromPlan = (day: string, mealId: string) => {
        setPlan(prev => ({
            ...prev,
            [day]: prev[day].filter(m => m.idMeal !== mealId)
        }));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Weekly Meal Planner</h1>
                    <p className="text-slate-500 mt-1">Plan your nutrition for the week ahead</p>
                </div>
                <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={() => {
                        if (confirm("Clear entire plan?")) setPlan({});
                    }}
                >
                    Reset Week
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {DAYS.map((day) => (
                    <motion.div
                        key={day}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">{day}</h3>
                            <span className="text-xs font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                {plan[day]?.length || 0} meals
                            </span>
                        </div>

                        <div className="flex-1 p-4 space-y-3 min-h-[200px] bg-slate-50/30">
                            <AnimatePresence>
                                {(plan[day] || []).map((meal) => (
                                    <motion.div
                                        key={meal.idMeal}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        layout
                                        className="group relative bg-white rounded-xl shadow-sm border border-slate-100 p-2 flex gap-3 overflow-hidden"
                                    >
                                        <div className="w-16 h-16 rounded-lg overflow-hidden relative flex-shrink-0">
                                            <Image
                                                src={meal.strMealThumb}
                                                alt={meal.strMeal}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 pr-6">
                                            <h4 className="font-semibold text-sm text-slate-900 truncate" title={meal.strMeal}>
                                                {meal.strMeal}
                                            </h4>
                                            <p className="text-xs text-slate-500 truncate">{meal.strCategory} • {meal.strArea}</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromPlan(day, meal.idMeal)}
                                            className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Delete fontSize="small" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {(!plan[day] || plan[day].length === 0) && (
                                <div className="h-full flex flex-col items-center justify-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                    <div className="w-24 h-24 mb-2 opacity-70">
                                        <LottiePlayer src="https://assets10.lottiefiles.com/packages/lf20_FYx0Ph.json" /> {/* Empty Plate - reusing healthy food for now */}
                                    </div>
                                    <span className="text-sm font-medium">No meals planned</span>
                                </div>
                            )}
                        </div>

                        <div className="p-4 mt-auto border-t border-slate-100">
                            <Button
                                variant="outline"
                                className="w-full border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400"
                                onClick={() => openSearch(day)}
                            >
                                <Add className="mr-2 h-4 w-4" /> Add Meal
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <Modal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                title={
                    <div className="flex items-center gap-2">
                        <span className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600">
                            <RestaurantMenu fontSize="small" />
                        </span>
                        Add Meal to {selectedDay}
                    </div>
                }
            >
                <div className="space-y-6">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <Input
                                placeholder="Search recipes (e.g., Chicken, Pasta, Pie)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-10 h-12 text-lg"
                                autoFocus
                            />
                        </div>
                        <Button size="lg" onClick={handleSearch} disabled={loading} className="px-8">
                            {loading ? "Searching..." : "Search"}
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {searchResults.map((meal) => (
                                <div
                                    key={meal.idMeal}
                                    onClick={() => addToPlan(meal)}
                                    className="group cursor-pointer bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-emerald-300 transition-all hover:-translate-y-1"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <Image
                                            src={meal.strMealThumb}
                                            alt={meal.strMeal}
                                            fill
                                            className="object-cover transform group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                        <div className="absolute bottom-3 left-3 text-white">
                                            <p className="text-xs font-medium bg-emerald-500/90 px-2 py-0.5 rounded-full inline-block mb-1 backdrop-blur-sm">
                                                {meal.strCategory}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{meal.strMeal}</h3>
                                        <p className="text-sm text-slate-500">{meal.strArea} Cuisine</p>
                                    </div>
                                </div>
                            ))}
                            {!loading && searchResults.length === 0 && searchQuery && (
                                <div className="col-span-full py-12 text-center text-slate-500">
                                    No recipes found. Try a different search term.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
