"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html>
            <body className="bg-slate-950 text-white font-sans flex items-center justify-center min-h-screen p-4">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
                    <p className="text-slate-400 mb-8">{error.message || "A global error occurred."}</p>
                    <button
                        onClick={() => reset()}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-colors"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
