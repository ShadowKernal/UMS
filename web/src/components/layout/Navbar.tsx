"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const navLinks = [
    { name: "Features", href: "/features" },
    { name: "How it Works", href: "/how-it-works" },
    { name: "Pricing", href: "/pricing" },
    { name: "Recipes", href: "/recipes" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
                "fixed w-full z-50 transition-all duration-300",
                scrolled ? "glass-nav shadow-sm" : "bg-transparent py-2"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-emerald-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-200/50">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-emerald-950 group-hover:text-emerald-700 transition-colors">
                            PrepMaster
                        </span>
                    </Link>

                    <div className="hidden md:flex space-x-1 items-center bg-white/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-emerald-100/50">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={cn(
                                        "relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300",
                                        isActive ? "text-emerald-700 font-semibold" : "text-slate-600 hover:text-emerald-600"
                                    )}
                                >
                                    {link.name}
                                    {isActive && (
                                        <motion.div
                                            layoutId="navbar-indicator"
                                            className="absolute inset-0 rounded-full bg-emerald-100 -z-10"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" className="hidden sm:inline-flex text-slate-600 hover:text-emerald-700">
                                Log in
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button className="rounded-full px-6 shadow-emerald-300/40 hover:shadow-emerald-300/60">
                                Start Prepping
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
