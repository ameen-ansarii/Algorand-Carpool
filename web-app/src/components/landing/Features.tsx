"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import {
    Wallet,
    Shield,
    Zap,
    Globe,
    Lock,
    Leaf,
} from "lucide-react";

const features = [
    {
        icon: Wallet,
        title: "Zero Fees",
        desc: "Keep 100% of your earnings. You only pay the network fee (<0.001 ALGO). No middlemen, no commissions.",
        size: "large",
        stat: "0%",
        statLabel: "Protocol Fee",
    },
    {
        icon: Zap,
        title: "Instant Settlement",
        desc: "Payments settle in under 3.5 seconds. Money in your wallet before you step out.",
        size: "small",
        stat: "3.5s",
        statLabel: "Finality",
    },
    {
        icon: Shield,
        title: "Trustless Escrow",
        desc: "Smart contracts hold funds securely until ride completion. Code-enforced fairness.",
        size: "small",
        stat: "100%",
        statLabel: "On-chain",
    },
    {
        icon: Globe,
        title: "Global Network",
        desc: "Built on Algorand for 10,000+ TPS. Scaling global mobility without the bottleneck.",
        size: "large",
        stat: "10K+",
        statLabel: "TPS",
    },
    {
        icon: Lock,
        title: "Privacy First",
        desc: "No personal data stored. Your wallet is your identity. Anonymous, secure, sovereign.",
        size: "small",
        stat: "Zero",
        statLabel: "Data Stored",
    },
    {
        icon: Leaf,
        title: "Carbon Negative",
        desc: "Algorand is the greenest blockchain. Shared rides + carbon-negative consensus = net positive impact.",
        size: "small",
        stat: "-CO₂",
        statLabel: "Impact",
    },
];

function BentoCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const isLarge = feature.size === "large";

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.08 }}
            viewport={{ once: true, margin: "-50px" }}
            onMouseMove={handleMouseMove}
            className={`group relative overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-8 transition-all duration-500 hover:border-brand/20 hover:bg-card/60 ${isLarge ? "md:col-span-2 md:row-span-1" : "md:col-span-1"
                }`}
        >
            {/* Spotlight effect */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-500 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              500px circle at ${mouseX}px ${mouseY}px,
              oklch(0.75 0.18 168 / 0.06),
              transparent 80%
            )
          `,
                }}
            />

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col justify-between gap-6">
                <div>
                    {/* Icon + stat row */}
                    <div className="flex items-start justify-between mb-6">
                        <div
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background/50 transition-all duration-300 group-hover:border-brand/20"
                            style={{}}
                        >
                            <feature.icon className="h-5 w-5 text-foreground" />
                        </div>

                        {/* Floating stat */}
                        <div className="text-right">
                            <div
                                className="text-2xl font-bold font-mono"
                                style={{ color: "oklch(0.75 0.18 168)" }}
                            >
                                {feature.stat}
                            </div>
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                {feature.statLabel}
                            </div>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-foreground tracking-tight mb-2">
                        {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-light">
                        {feature.desc}
                    </p>
                </div>

                {/* Bottom decorative line */}
                <div className="h-px w-full bg-border overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        transition={{ duration: 1.5, delay: 0.3 + index * 0.1 }}
                        className="h-full"
                        style={{ background: "oklch(0.75 0.18 168 / 0.5)" }}
                    />
                </div>
            </div>
        </motion.div>
    );
}

export default function Features() {
    return (
        <section id="features" className="relative w-full bg-background py-32 text-foreground">
            {/* Ambient */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-[800px] w-[800px] rounded-full blur-[200px]"
                    style={{ background: "oklch(0.75 0.18 168 / 0.04)" }}
                />
            </div>

            <div className="container relative z-10 mx-auto px-6">
                {/* Section header */}
                <div className="mb-20 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center rounded-full border border-border bg-background/50 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground backdrop-blur-md mb-6"
                    >
                        Features
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
                    >
                        Engineered for{" "}
                        <span className="font-serif italic" style={{ fontFamily: "var(--font-serif)" }}>
                            <span className="text-brand-gradient">Velocity.</span>
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-6 max-w-xl text-lg text-muted-foreground font-light"
                    >
                        Every component is purpose-built for speed, security, and
                        sovereignty. No compromises.
                    </motion.p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {features.map((feature, i) => (
                        <BentoCard key={i} feature={feature} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
