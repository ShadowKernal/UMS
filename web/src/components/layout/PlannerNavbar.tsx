"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const navLinks = [
    { name: "My Plan", href: "/planner" },
    { name: "Browse Recipes", href: "/planner/recipes" }, // Future placeholder or separate page
];

export default function PlannerNavbar({ user }: { user?: { display_name?: string } }) {
    const pathname = usePathname();
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [csrfToken, setCsrfToken] = useState<string | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = async () => {
        let token = csrfToken;
        if (!token) {
            try {
                const res = await fetch("/api/me");
                if (res.ok) {
                    const data = await res.json();
                    token = String(data?.csrfToken || "");
                    setCsrfToken(token || null);
                }
            } catch {
                // Ignore and attempt logout anyway.
            }
        }
        await fetch("/api/auth/logout", {
            method: "POST",
            headers: token ? { "x-csrf-token": token } : undefined
        });
        router.push("/");
        router.refresh();
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-emerald-100/50" : "bg-white/50 backdrop-blur-sm"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <Link href="/planner" className="flex items-center gap-2 group">
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
                        <span className="text-xl font-bold tracking-tight text-emerald-900 group-hover:text-emerald-700 transition-colors">
                            PrepMaster
                        </span>
                    </Link>

                    <div className="hidden md:flex space-x-1 items-center">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${isActive ? "text-emerald-700 bg-emerald-50" : "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50"
                                        }`}
                                >
                                    {link.name}
                                    {isActive && (
                                        <motion.div
                                            layoutId="navbar-indicator"
                                            className="absolute inset-0 rounded-full border-2 border-emerald-200"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm font-medium text-slate-600 hidden sm:block">
                            Hi, {user?.display_name || "Chef"}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
