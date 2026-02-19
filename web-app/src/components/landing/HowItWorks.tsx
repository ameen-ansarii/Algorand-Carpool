"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus, Minus, Wallet, Search, ShieldCheck, Banknote } from "lucide-react";

const steps = [
    {
        number: "01",
        icon: Wallet,
        title: "Connect Your Wallet",
        desc: "No email, no phone, no passwords. Just connect your Algorand wallet (Pera or Defly) and you're in. Your wallet IS your identity — fully sovereign, fully anonymous.",
        gradient: "from-teal-500 to-cyan-500",
    },
    {
        number: "02",
        icon: Search,
        title: "Find or Post a Ride",
        desc: "Real-time, geolocation-based matching. Drivers post available seats with route and price. Riders browse and request in one tap. No algorithms deciding your fare — the market does.",
        gradient: "from-cyan-500 to-blue-500",
    },
    {
        number: "03",
        icon: ShieldCheck,
        title: "Trustless Escrow Locks Funds",
        desc: "When a rider confirms, ALGO is locked in a smart contract escrow. Neither party can cheat. The code is the law. Funds are frozen until the ride is verified complete.",
        gradient: "from-blue-500 to-indigo-500",
    },
    {
        number: "04",
        icon: Banknote,
        title: "Instant Settlement",
        desc: "Ride complete? The escrow releases payment to the driver in under 3.5 seconds. No chargebacks, no disputes, no middlemen. Just peer-to-peer value transfer.",
        gradient: "from-indigo-500 to-violet-500",
    },
];

export default function HowItWorks() {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section
            id="how-it-works"
            className="relative w-full overflow-hidden bg-background py-32 text-foreground"
        >
            {/* Background accent */}
            <div className="pointer-events-none absolute inset-0">
                <div
                    className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full blur-[200px]"
                    style={{ background: "oklch(0.75 0.18 168 / 0.04)" }}
                />
            </div>

            <div className="container relative z-10 mx-auto px-6">
                {/* Header */}
                <div className="mb-20 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center rounded-full border border-border bg-background/50 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground backdrop-blur-md mb-6"
                        >
                            Protocol Flow
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
                        >
                            How it{" "}
                            <span
                                className="font-serif italic"
                                style={{ fontFamily: "var(--font-serif)" }}
                            >
                                <span className="text-brand-gradient">works.</span>
                            </span>
                        </motion.h2>
                    </div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-sm text-muted-foreground font-light leading-relaxed"
                    >
                        Four steps. No middlemen. Just trustless peer-to-peer mobility
                        powered by Algorand smart contracts.
                    </motion.p>
                </div>

                {/* Accordion */}
                <div className="max-w-4xl mx-auto">
                    {steps.map((step, i) => {
                        const isOpen = openIndex === i;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.08 }}
                                viewport={{ once: true }}
                                className="border-t border-border last:border-b"
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? -1 : i)}
                                    className="group flex w-full items-center justify-between py-7 text-left transition-all"
                                >
                                    <div className="flex items-center gap-6">
                                        <span
                                            className="font-mono text-sm font-semibold transition-colors"
                                            style={{
                                                color: isOpen
                                                    ? "oklch(0.75 0.18 168)"
                                                    : undefined,
                                            }}
                                        >
                                            {step.number}
                                        </span>
                                        <h3
                                            className={`text-xl sm:text-2xl font-semibold tracking-tight transition-colors ${isOpen
                                                    ? "text-foreground"
                                                    : "text-muted-foreground group-hover:text-foreground"
                                                }`}
                                        >
                                            {step.title}
                                        </h3>
                                    </div>
                                    <div
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border transition-all group-hover:border-brand/30"
                                        style={
                                            isOpen ? { borderColor: "oklch(0.75 0.18 168 / 0.3)" } : {}
                                        }
                                    >
                                        {isOpen ? (
                                            <Minus className="h-4 w-4" style={{ color: "oklch(0.75 0.18 168)" }} />
                                        ) : (
                                            <Plus className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </div>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pb-8 pl-[3.75rem] pr-8">
                                                <div className="flex items-start gap-6">
                                                    <div
                                                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-card/50"
                                                    >
                                                        <step.icon className="h-5 w-5" style={{ color: "oklch(0.75 0.18 168)" }} />
                                                    </div>
                                                    <p className="text-muted-foreground leading-relaxed font-light max-w-lg">
                                                        {step.desc}
                                                    </p>
                                                </div>
                                                {/* Progress bar */}
                                                <div className="mt-6 ml-[4.5rem] h-px w-full bg-border overflow-hidden max-w-md">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: "100%" }}
                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                        className="h-full"
                                                        style={{ background: "oklch(0.75 0.18 168 / 0.5)" }}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
