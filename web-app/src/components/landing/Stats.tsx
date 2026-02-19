"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        const duration = 2000;
        const startTime = Date.now();

        const tick = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [isInView, target]);

    return (
        <span ref={ref}>
            {count.toLocaleString()}
            {suffix}
        </span>
    );
}

const stats = [
    { value: 10000, suffix: "+", label: "Transactions Per Second" },
    { value: 0, suffix: "%", label: "Protocol Fee", display: "0%" },
    { value: 2, suffix: ".8s", label: "Block Finality", display: "2.8s" },
    { value: 100, suffix: "%", label: "Open Source" },
];

export default function Stats() {
    return (
        <section className="relative w-full bg-background py-24 overflow-hidden">
            {/* Top border */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Content */}
            <div className="container relative z-10 mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
                        Protocol Metrics
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-border">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center text-center px-4"
                        >
                            <div
                                className="text-4xl sm:text-5xl md:text-6xl font-bold font-mono tracking-tight"
                                style={{ color: "oklch(0.75 0.18 168)" }}
                            >
                                {stat.display ? (
                                    stat.display
                                ) : (
                                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                                )}
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground font-light">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Trust logos - simulated as text for now */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="mt-20 flex flex-wrap items-center justify-center gap-8 opacity-40"
                >
                    {["Algorand Foundation", "Pera Wallet", "Defly", "AlgoExplorer", "Vestige"].map(
                        (name) => (
                            <span
                                key={name}
                                className="text-sm font-medium text-muted-foreground tracking-wide"
                            >
                                {name}
                            </span>
                        )
                    )}
                </motion.div>
            </div>

            {/* Bottom border */}
            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </section>
    );
}
