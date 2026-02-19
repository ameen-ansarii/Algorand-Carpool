"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
    onLaunch: () => void;
}

/* ─── CSS-only animated 3D globe ─── */
function Web3Globe() {
    return (
        <div className="relative h-[500px] w-[500px] lg:h-[600px] lg:w-[600px]">
            {/* Outer glow */}
            <div className="absolute inset-0 rounded-full bg-brand/5 blur-[80px]"
                style={{ background: "radial-gradient(circle, oklch(0.75 0.18 168 / 0.15), transparent 70%)" }}
            />

            {/* Globe sphere */}
            <div className="absolute inset-8 rounded-full border border-brand/20 overflow-hidden"
                style={{ borderColor: "oklch(0.75 0.18 168 / 0.2)" }}
            >
                {/* Latitude lines */}
                {[20, 35, 50, 65, 80].map((top) => (
                    <div
                        key={top}
                        className="absolute left-0 right-0 border-t border-brand/10"
                        style={{
                            top: `${top}%`,
                            borderColor: "oklch(0.75 0.18 168 / 0.08)",
                        }}
                    />
                ))}

                {/* Longitude curves (simulated with rotated borders) */}
                {[0, 30, 60, 90, 120, 150].map((deg) => (
                    <div
                        key={deg}
                        className="absolute inset-0 rounded-full border border-brand/10"
                        style={{
                            borderColor: "oklch(0.75 0.18 168 / 0.06)",
                            transform: `rotateY(${deg}deg) scaleX(0.4)`,
                        }}
                    />
                ))}

                {/* Inner gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-brand/10"
                    style={{
                        background: "linear-gradient(135deg, oklch(0.75 0.18 168 / 0.05), transparent 60%, oklch(0.75 0.18 168 / 0.08))",
                    }}
                />
            </div>

            {/* Orbiting nodes */}
            {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                    key={i}
                    className="absolute left-1/2 top-1/2"
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 15 + i * 5,
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * 2,
                    }}
                    style={{
                        width: `${280 + i * 40}px`,
                        height: `${280 + i * 40}px`,
                        marginLeft: `-${140 + i * 20}px`,
                        marginTop: `-${140 + i * 20}px`,
                    }}
                >
                    <div
                        className="absolute top-0 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{
                            background: "oklch(0.75 0.18 168)",
                            boxShadow: "0 0 12px oklch(0.75 0.18 168 / 0.6)",
                        }}
                    />
                </motion.div>
            ))}

            {/* Center pulse */}
            <motion.div
                className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0.3, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    background: "oklch(0.75 0.18 168)",
                    boxShadow: "0 0 20px oklch(0.75 0.18 168 / 0.5)",
                }}
            />

            {/* Floating data labels */}
            {[
                { label: "TPS 10,000+", x: "75%", y: "20%", delay: 0 },
                { label: "< 2.8s Finality", x: "10%", y: "65%", delay: 0.5 },
                { label: "Carbon Negative", x: "80%", y: "75%", delay: 1 },
            ].map((item) => (
                <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5 + item.delay, duration: 0.5 }}
                    className="absolute rounded-full border border-border bg-background/80 backdrop-blur-md px-3 py-1.5 text-[11px] font-mono text-muted-foreground shadow-lg"
                    style={{ left: item.x, top: item.y }}
                >
                    <span
                        className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                        style={{ background: "oklch(0.75 0.18 168)" }}
                    />
                    {item.label}
                </motion.div>
            ))}
        </div>
    );
}

export default function Hero({ onLaunch }: HeroProps) {
    return (
        <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background text-foreground pt-20">
            {/* Background grid */}
            <div className="absolute inset-0 grid-pattern" />

            {/* Ambient glow blobs */}
            <div className="pointer-events-none absolute inset-0">
                <div
                    className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full blur-[150px] animate-blob"
                    style={{ background: "oklch(0.75 0.18 168 / 0.08)" }}
                />
                <div
                    className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full blur-[150px] animate-blob"
                    style={{ background: "oklch(0.7 0.15 200 / 0.06)", animationDelay: "3s" }}
                />
            </div>

            {/* Grain overlay */}
            <div className="grain absolute inset-0 pointer-events-none" />

            {/* Main content */}
            <div className="container relative z-10 mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 px-6 py-20">
                {/* Left — Text */}
                <div className="flex-1 max-w-2xl text-left">
                    {/* Status pill */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8 inline-flex items-center rounded-full border border-border bg-background/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md"
                    >
                        <span
                            className="mr-2 h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(0,210,170,0.5)]"
                            style={{ background: "oklch(0.75 0.18 168)" }}
                        />
                        Live on Algorand Mainnet
                    </motion.div>

                    {/* Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9]"
                    >
                        <span className="block text-foreground">Reach</span>
                        <span className="block font-serif italic" style={{ fontFamily: "var(--font-serif)" }}>
                            <span className="text-brand-gradient">New</span>
                        </span>
                        <span className="block text-foreground">Horizons.</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="mt-8 max-w-lg text-lg text-muted-foreground font-light leading-relaxed"
                    >
                        The first decentralized ride-sharing protocol.{" "}
                        <span className="text-foreground font-normal">
                            Zero fees. Trustless escrow. Instant settlement.
                        </span>{" "}
                        Built on Algorand.
                    </motion.p>

                    {/* CTA buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-10 flex flex-wrap gap-4"
                    >
                        <Button
                            size="lg"
                            onClick={onLaunch}
                            className="h-12 rounded-full px-8 text-sm font-semibold transition-all hover:scale-105 shadow-lg"
                            style={{
                                background: "oklch(0.75 0.18 168)",
                                color: "#000",
                                boxShadow: "0 0 30px oklch(0.75 0.18 168 / 0.3)",
                            }}
                        >
                            Launch App
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-12 rounded-full px-8 text-sm font-medium bg-transparent hover:bg-muted transition-all"
                        >
                            Read Whitepaper
                        </Button>
                    </motion.div>

                    {/* Stats row */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="mt-14 flex gap-10 border-t border-border pt-8"
                    >
                        {[
                            { label: "Network", value: "Algorand" },
                            { label: "Latency", value: "< 2.8s" },
                            { label: "Protocol Fee", value: "0%" },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                                    {stat.label}
                                </span>
                                <span className="mt-1 font-mono text-sm font-semibold text-foreground">
                                    {stat.value}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Right — 3D Globe Visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    className="flex-1 flex items-center justify-center"
                >
                    <Web3Globe />
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 8, 0] }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "loop",
                    delay: 2,
                }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
                    Scroll
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground/50" />
            </motion.div>
        </section>
    );
}
