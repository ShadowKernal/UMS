"use client";

import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import { DotLottiePlayer } from "@dotlottie/react-player";
import { cn } from "@/lib/utils";

interface LottiePlayerProps {
    src: string | object; // URL or JSON object
    className?: string;
    loop?: boolean;
    autoplay?: boolean;
}

export default function LottiePlayer({
    src,
    className,
    loop = true,
    autoplay = true,
}: LottiePlayerProps) {
    const [animationData, setAnimationData] = useState<object | null>(
        typeof src === "object" ? src : null
    );
    const [isDotLottie, setIsDotLottie] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (typeof src === "string") {
            if (src.endsWith(".lottie")) {
                setIsDotLottie(true);
            } else {
                setIsDotLottie(false);
                fetch(src)
                    .then((response) => {
                        if (!response.ok) throw new Error("Failed to fetch");
                        return response.json();
                    })
                    .then((data) => setAnimationData(data))
                    .catch((err) => {
                        console.error("Error loading Lottie animation:", err);
                        setError(true);
                    });
            }
        } else {
            setIsDotLottie(false);
            setAnimationData(src);
        }
    }, [src]);

    if (error) {
        return (
            <div className={cn("flex items-center justify-center text-slate-400 text-[10px] min-h-[50px]", className)}>
                Animation error
            </div>
        );
    }

    if (isDotLottie && typeof src === "string") {
        return (
            <div className={cn("flex items-center justify-center overflow-hidden", className)}>
                <DotLottiePlayer
                    src={src}
                    loop={loop}
                    autoplay={autoplay}
                    className="w-full h-full"
                />
            </div>
        );
    }

    if (!animationData) {
        return (
            <div className={cn("flex items-center justify-center text-slate-400 text-[10px] min-h-[50px]", className)}>
                {/* Loading state or placeholder */}
            </div>
        );
    }

    return (
        <div className={cn("flex items-center justify-center overflow-hidden", className)}>
            <Lottie
                animationData={animationData}
                loop={loop}
                autoplay={autoplay}
                className="w-full h-full"
                rendererSettings={{
                    preserveAspectRatio: "xMidYMid slice",
                }}
            />
        </div>
    );
}
