"use client";

import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";
import { useEffect } from "react";

interface RiveLoaderProps {
    className?: string;
}

export function RiveLoader({ className = "" }: RiveLoaderProps) {
    const { RiveComponent, rive } = useRive({
        src: "/loading-animation.riv",
        layout: new Layout({
            fit: Fit.Contain,
            alignment: Alignment.Center,
        }),
        autoplay: true,
    });

    useEffect(() => {
        if (rive) {
            // Ensure the animation plays for the full duration
            rive.play();

            // Set up a loop to restart the animation every 4 seconds
            const interval = setInterval(() => {
                if (rive) {
                    rive.play();
                }
            }, 4000);

            return () => clearInterval(interval);
        }
    }, [rive]);

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <RiveComponent className="w-50 h-50" />
        </div>
    );
}
