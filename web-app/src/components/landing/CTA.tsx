"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CTA() {
    return (
        <section className="relative w-full overflow-hidden bg-background py-40 text-center text-foreground">
            {/* Massive gradient orb */}
            <div className="pointer-events-none absolute inset-0">
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full blur-[200px]"
                    style={{ background: "oklch(0.75 0.18 168 / 0.12)" }}
                />
            </div>

            {/* Grid pattern */}
            <div className="absolute inset-0 grid-pattern opacity-50" />

            {/* Grain */}
            <div className="grain absolute inset-0 pointer-events-none" />

            <div className="container relative z-10 mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <span
                        className="mb-6 block text-sm font-semibold uppercase tracking-[0.2em]"
                        style={{ color: "oklch(0.75 0.18 168)" }}
                    >
                        Join the Revolution
                    </span>

                    <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9]">
                        <span className="block text-foreground">Ready to</span>
                        <span
                            className="block font-serif italic"
                            style={{ fontFamily: "var(--font-serif)" }}
                        >
                            <span className="text-brand-gradient">Ride?</span>
                        </span>
                    </h2>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mx-auto mt-8 max-w-xl text-lg text-muted-foreground font-light leading-relaxed"
                >
                    Stop paying middlemen for your mobility. Start earning and saving with
                    the speed of the Algorand blockchain.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
                >
                    <Button
                        size="xl"
                        className="h-14 rounded-full px-10 text-base font-semibold transition-all hover:scale-105"
                        style={{
                            background: "oklch(0.75 0.18 168)",
                            color: "#000",
                            boxShadow: "0 0 40px oklch(0.75 0.18 168 / 0.3)",
                        }}
                    >
                        Launch App
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                        size="xl"
                        variant="outline"
                        className="h-14 rounded-full px-10 text-base font-medium bg-transparent hover:bg-muted transition-all"
                    >
                        View Smart Contract
                    </Button>
                </motion.div>

                {/* Trust note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-10 text-xs text-muted-foreground/60"
                >
                    Audited smart contracts • Open source • Community governed
                </motion.p>
            </div>
        </section>
    );
}
