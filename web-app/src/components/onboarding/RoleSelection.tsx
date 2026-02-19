"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Car, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface RoleSelectionProps {
    onSelect: (role: "driver" | "rider") => void;
}

export default function RoleSelection({ onSelect }: RoleSelectionProps) {
    const [hoveredRole, setHoveredRole] = useState<"driver" | "rider" | null>(null);
    const [selecting, setSelecting] = useState<"driver" | "rider" | null>(null);
    const { user, profile, setRole } = useAuth();

    const handleSelect = async (role: "driver" | "rider") => {
        setSelecting(role);
        try {
            if (user) {
                await setRole(role);
            }
            // Faster transition
            setTimeout(() => {
                onSelect(role);
            }, 100);
        } catch (err) {
            console.error("Error setting role:", err);
            onSelect(role);
        }
    };

    return (
        <div className="relative flex h-screen w-full overflow-hidden bg-background font-sans text-foreground">
            {/* Driver Side (Left) */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={cn(
                    "relative flex h-full w-1/2 flex-col items-center justify-center border-r border-border bg-background transition-all duration-700 ease-in-out cursor-pointer group",
                    hoveredRole === "driver" ? "w-[65%]" : hoveredRole === "rider" ? "w-[35%] opacity-40" : "w-1/2"
                )}
                onMouseEnter={() => setHoveredRole("driver")}
                onMouseLeave={() => setHoveredRole(null)}
                onClick={() => handleSelect("driver")}
            >
                {/* Hover gradient - uses only alpha-based colors, no theme-breaking black/white */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative z-10 flex flex-col items-center gap-6">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="rounded-full border border-border bg-muted/50 p-8 backdrop-blur-sm transition-all duration-500 group-hover:bg-muted group-hover:shadow-xl group-hover:shadow-indigo-500/10"
                    >
                        {selecting === "driver" ? (
                            <Loader2 className="h-16 w-16 animate-spin text-indigo-500" />
                        ) : (
                            <Car className="h-16 w-16 text-indigo-500" strokeWidth={1.5} />
                        )}
                    </motion.div>
                    <div className="text-center">
                        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-foreground/60 group-hover:text-foreground transition-colors duration-500">
                            I Drive
                        </h2>
                        <p className="mt-4 max-w-xs text-muted-foreground group-hover:text-foreground/70 transition-colors duration-500">
                            Post rides, earn ALGO instantly. Zero commission.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Rider Side (Right) */}
            <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={cn(
                    "relative flex h-full w-1/2 flex-col items-center justify-center bg-background transition-all duration-700 ease-in-out cursor-pointer group",
                    hoveredRole === "rider" ? "w-[65%]" : hoveredRole === "driver" ? "w-[35%] opacity-40" : "w-1/2"
                )}
                onMouseEnter={() => setHoveredRole("rider")}
                onMouseLeave={() => setHoveredRole(null)}
                onClick={() => handleSelect("rider")}
            >
                {/* Hover gradient - uses only alpha-based colors */}
                <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative z-10 flex flex-col items-center gap-6">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="rounded-full border border-border bg-muted/50 p-8 backdrop-blur-sm transition-all duration-500 group-hover:bg-muted group-hover:shadow-xl group-hover:shadow-purple-500/10"
                    >
                        {selecting === "rider" ? (
                            <Loader2 className="h-16 w-16 animate-spin text-purple-500" />
                        ) : (
                            <MapPin className="h-16 w-16 text-purple-500" strokeWidth={1.5} />
                        )}
                    </motion.div>
                    <div className="text-center">
                        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-foreground/60 group-hover:text-foreground transition-colors duration-500">
                            I Ride
                        </h2>
                        <p className="mt-4 max-w-xs text-muted-foreground group-hover:text-foreground/70 transition-colors duration-500">
                            Find rides easily. Safe, cheap, and fast.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Center Divider */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="h-32 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
            </div>

            {/* User Info Banner (if signed in) */}
            {user && (
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-full border border-border bg-background/80 backdrop-blur-xl px-5 py-2.5 shadow-lg"
                >
                    {user.photoURL && (
                        <img src={user.photoURL} alt="" className="h-7 w-7 rounded-full" />
                    )}
                    <span className="text-sm font-medium text-foreground">
                        Welcome, {user.displayName?.split(" ")[0] || "User"}!
                    </span>
                    <span className="text-xs text-muted-foreground">Choose your role</span>
                </motion.div>
            )}
        </div>
    );
}
