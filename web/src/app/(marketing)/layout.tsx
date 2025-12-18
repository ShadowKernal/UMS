"use client";

import Navbar from "@/components/layout/Navbar";
import { ReactNode } from "react";

export default function MarketingLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <Navbar />
            <div className="pt-20">
                {children}
            </div>
        </>
    );
}
