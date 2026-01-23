"use client";
import { useEffect, useState } from "react";

const EXTENSION_URL = process.env.NEXT_PUBLIC_CHROME_EXTENSION_URL;

export function StickyBanner() {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down and past 100px
                setIsVisible(false);
            } else {
                // Scrolling up
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    if (!EXTENSION_URL) return null;

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"
                }`}
        >
            <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center gap-4">
                        <span className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                                ✨ <strong>Best Chrome Extension for Learners</strong> — Get
                                instant AI explanations for any text you read!
                            </span>
                        </span>

                        <a
                            href={EXTENSION_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-gray-900 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-sm flex-shrink-0"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-3.952 6.848a12.014 12.014 0 0 0 9.34-5.784c.32-.576.59-1.171.82-1.78zM12 16.364a4.364 4.364 0 1 1 0-8.728 4.364 4.364 0 0 1 0 8.728z" />
                            </svg>
                            Try It Free
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
