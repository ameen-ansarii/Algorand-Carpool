"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ModeToggle from "@/components/ui/toggle-mode";

interface NavbarProps {
    onLaunch: () => void;
}

export default function Navbar({ onLaunch }: NavbarProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ${scrolled
                    ? "bg-background/70 backdrop-blur-2xl border-b border-border shadow-lg"
                    : "bg-transparent"
                }`}
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="relative flex h-8 w-8 items-center justify-center">
                        <div className="absolute inset-0 rounded-lg bg-brand opacity-20 blur-sm" />
                        <svg
                            className="relative h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                                className="text-brand"
                                style={{ color: "oklch(0.75 0.18 168)" }}
                            />
                        </svg>
                    </div>
                    <span className="text-lg font-bold tracking-tight text-foreground">
                        RIDE
                    </span>
                    <span className="ml-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-brand"
                        style={{ color: "oklch(0.75 0.18 168)" }}
                    >
                        Protocol
                    </span>
                </div>

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-8">
                    {["Features", "How it Works", "Ecosystem"].map((link) => (
                        <a
                            key={link}
                            href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {link}
                        </a>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <ModeToggle />
                    <Button
                        onClick={onLaunch}
                        className="h-9 rounded-full px-5 text-sm font-medium transition-all hover:scale-105"
                        style={{
                            background: "oklch(0.75 0.18 168)",
                            color: "#000",
                        }}
                    >
                        Launch App
                    </Button>
                </div>
            </div>
        </motion.nav>
    );
}
