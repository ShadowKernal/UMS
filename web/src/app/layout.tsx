import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry/ThemeRegistry";
import { Outfit, Inter } from "next/font/google";
import type { Metadata } from "next";
import { ReactNode } from "react";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PrepMaster - Meal Prepping Made Simple",
  description: "Custom meal plans, smart grocery lists, and batch cooking guidance that make weekly meal prep effortless."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable} ${inter.variable}`}>
      <body suppressHydrationWarning data-gramm="false" data-gramm_editor="false" className="bg-slate-950 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
