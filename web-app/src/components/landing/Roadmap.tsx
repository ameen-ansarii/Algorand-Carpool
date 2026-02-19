"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
    Rocket,
    Smartphone,
    Globe,
    Users,
    Layers,
    Sparkles,
} from "lucide-react";

const milestones = [
    {
        quarter: "Q1 2026",
        title: "Genesis",
        desc: "Core smart contracts deployed on Algorand TestNet. Wallet integration with Pera & Defly. Internal alpha testing.",
        icon: Rocket,
        status: "completed",
    },
    {
        quarter: "Q2 2026",
        title: "Mainnet Launch",
        desc: "Protocol goes live on Algorand MainNet. Web app public beta. First 1,000 rides target. Bug bounty program launches.",
        icon: Sparkles,
        status: "current",
    },
    {
        quarter: "Q3 2026",
        title: "Mobile Native",
        desc: "iOS and Android apps launch. Push notifications for ride matching. Biometric wallet signing. Offline-first architecture.",
        icon: Smartphone,
        status: "upcoming",
    },
    {
        quarter: "Q4 2026",
        title: "Global Expansion",
        desc: "Multi-region support. Fiat on-ramp partnerships. Localized pricing. Fleet operator tools for enterprise drivers.",
        icon: Globe,
        status: "upcoming",
    },
    {
        quarter: "Q1 2027",
        title: "DAO Governance",
        desc: "Community governance token launch. Proposal voting. Treasury management. Protocol parameter control by stakeholders.",
        icon: Users,
        status: "upcoming",
    },
    {
        quarter: "Q2 2027",
        title: "Multi-Chain",
        desc: "Cross-chain bridges to Ethereum and Solana. Universal ride payments across ecosystems. Aggregator partnerships.",
        icon: Layers,
        status: "upcoming",
    },
];

function MilestoneCard({
    milestone,
    index,
}: {
    milestone: (typeof milestones)[number];
    index: number;
}) {
    const Icon = milestone.icon;
    const isCompleted = milestone.status === "completed";
    const isCurrent = milestone.status === "current";
    const isLeft = index % 2 === 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true, margin: "-80px" }}
            className={`relative flex w-full items-center ${isLeft ? "justify-start" : "justify-end"
                }`}
        >
            {/* Card */}
            <div
                className={`group relative w-full max-w-md rounded-2xl border p-6 transition-all duration-500 hover:bg-card/60 ${isCurrent
                        ? "border-brand/20 bg-card/50 glow-brand"
                        : isCompleted
                            ? "border-border bg-card/30"
                            : "border-border bg-card/20"
                    } ${isLeft ? "md:mr-auto md:pr-12" : "md:ml-auto md:pl-12"}`}
                style={
                    isCurrent
                        ? { borderColor: "oklch(0.75 0.18 168 / 0.2)" }
                        : {}
                }
            >
                {/* Quarter badge */}
                <div className="flex items-center gap-3 mb-4">
                    <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${isCurrent
                                ? "border-brand/30 bg-brand/10"
                                : isCompleted
                                    ? "border-border bg-muted"
                                    : "border-border bg-card/50"
                            }`}
                        style={
                            isCurrent
                                ? {
                                    borderColor: "oklch(0.75 0.18 168 / 0.3)",
                                    background: "oklch(0.75 0.18 168 / 0.1)",
                                }
                                : {}
                        }
                    >
                        <Icon
                            className="h-5 w-5"
                            style={
                                isCurrent
                                    ? { color: "oklch(0.75 0.18 168)" }
                                    : isCompleted
                                        ? { color: "#22c55e" }
                                        : {}
                            }
                        />
                    </div>

                    <div>
                        <span
                            className="text-xs font-bold uppercase tracking-widest font-mono"
                            style={
                                isCurrent ? { color: "oklch(0.75 0.18 168)" } : {}
                            }
                        >
                            {milestone.quarter}
                        </span>
                        {isCurrent && (
                            <motion.span
                                className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                                animate={{ opacity: [1, 0.5, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{
                                    background: "oklch(0.75 0.18 168 / 0.15)",
                                    color: "oklch(0.75 0.18 168)",
                                }}
                            >
                                Now
                            </motion.span>
                        )}
                        {isCompleted && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-500">
                                Done
                            </span>
                        )}
                    </div>
                </div>

                <h3 className="text-xl font-bold text-foreground tracking-tight mb-2">
                    {milestone.title}
                </h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                    {milestone.desc}
                </p>

                {/* Progress bar for current */}
                {isCurrent && (
                    <div className="mt-4 h-1 w-full rounded-full bg-muted overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: "45%" }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ background: "oklch(0.75 0.18 168)" }}
                        />
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default function Roadmap() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    return (
        <section
            ref={containerRef}
            className="relative w-full overflow-hidden bg-background py-32 text-foreground"
        >
            {/* Background */}
            <div className="pointer-events-none absolute inset-0">
                <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full blur-[200px]"
                    style={{ background: "oklch(0.75 0.18 168 / 0.04)" }}
                />
            </div>

            <div className="container relative z-10 mx-auto px-6">
                {/* Header */}
                <div className="mb-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center rounded-full border border-border bg-background/50 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground backdrop-blur-md mb-6"
                    >
                        Roadmap
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
                    >
                        Building the{" "}
                        <span className="font-serif italic" style={{ fontFamily: "var(--font-serif)" }}>
                            <span className="text-brand-gradient">future.</span>
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-6 mx-auto max-w-lg text-lg text-muted-foreground font-light"
                    >
                        Our roadmap to decentralizing global mobility. Every milestone is a
                        step toward a world without middlemen.
                    </motion.p>
                </div>

                {/* Timeline */}
                <div className="relative max-w-5xl mx-auto">
                    {/* Center line (static) */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-border hidden md:block" />

                    {/* Animated progress line */}
                    <motion.div
                        className="absolute left-1/2 top-0 w-px -translate-x-1/2 hidden md:block"
                        style={{
                            height: lineHeight,
                            background: "oklch(0.75 0.18 168 / 0.6)",
                            boxShadow: "0 0 12px oklch(0.75 0.18 168 / 0.3)",
                        }}
                    />

                    {/* Milestones */}
                    <div className="space-y-8 md:space-y-16">
                        {milestones.map((milestone, i) => (
                            <div
                                key={i}
                                className={`relative flex ${i % 2 === 0
                                        ? "md:justify-start"
                                        : "md:justify-end"
                                    }`}
                            >
                                {/* Center dot */}
                                <div className="absolute left-1/2 top-8 -translate-x-1/2 z-10 hidden md:block">
                                    <div
                                        className={`h-4 w-4 rounded-full border-2 ${milestone.status === "current"
                                                ? "border-brand"
                                                : milestone.status === "completed"
                                                    ? "border-emerald-500 bg-emerald-500"
                                                    : "border-border bg-background"
                                            }`}
                                        style={
                                            milestone.status === "current"
                                                ? {
                                                    borderColor: "oklch(0.75 0.18 168)",
                                                    background: "oklch(0.75 0.18 168 / 0.3)",
                                                    boxShadow: "0 0 12px oklch(0.75 0.18 168 / 0.4)",
                                                }
                                                : {}
                                        }
                                    />
                                </div>

                                {/* Card container — takes half the width */}
                                <div className={`w-full md:w-[calc(50%-2rem)] ${i % 2 === 0 ? "" : ""}`}>
                                    <MilestoneCard milestone={milestone} index={i} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
