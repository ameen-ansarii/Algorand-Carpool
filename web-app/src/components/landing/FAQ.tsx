"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
    {
        question: "What wallets are supported?",
        answer:
            "RIDE currently supports Pera Wallet and Defly Wallet — the two most popular Algorand wallets. Simply scan a QR code or use the browser extension to connect. We're working on adding support for Exodus and other multi-chain wallets.",
    },
    {
        question: "How does the trustless escrow work?",
        answer:
            "When a rider confirms a ride, their ALGO payment is locked in a smart contract on the Algorand blockchain. Neither the driver nor the rider can access the funds during the ride. Once the ride is marked as complete (verified by GPS proximity and both parties), the contract automatically releases the payment to the driver. No middlemen, no disputes — just code.",
    },
    {
        question: "What fees does RIDE charge?",
        answer:
            "Zero. RIDE Protocol charges exactly 0% commission. The only cost is the Algorand network transaction fee, which is less than 0.001 ALGO (fractions of a cent). Drivers keep 100% of their earnings. This is possible because the protocol is open-source and community-governed.",
    },
    {
        question: "Is my personal data stored anywhere?",
        answer:
            "No. RIDE operates on a zero-knowledge principle. Your wallet address is your only identity. We don't store names, phone numbers, emails, or location history. Ride data is recorded on-chain as transaction hashes — private, anonymous, and sovereign. You own your data.",
    },
    {
        question: "How fast are payments settled?",
        answer:
            "Algorand achieves block finality in approximately 2.8 seconds. That means the moment your ride is confirmed complete, the driver has their payment in under 3.5 seconds. Compare that to Uber's 1-7 day payout cycle. Instant settlement isn't a feature — it's the default.",
    },
    {
        question: "What happens if there's a dispute?",
        answer:
            "The smart contract handles dispute resolution algorithmically. If a ride isn't completed (e.g., the driver doesn't reach the destination), the escrow automatically refunds the rider. For edge cases, a community arbitration system using staked governance tokens is on our roadmap for Q1 2027.",
    },
    {
        question: "Can I use RIDE without crypto knowledge?",
        answer:
            "Absolutely. While RIDE is built on blockchain, we've designed the UX to feel as simple as Uber. Connect your wallet, find a ride, and pay — the blockchain complexity is invisible. We're also building fiat on-ramp support so users can pay with credit cards seamlessly.",
    },
    {
        question: "Is RIDE open source?",
        answer:
            "Yes, 100%. All smart contracts, frontend code, and protocol documentation are open source on GitHub. We believe transparency is non-negotiable in Web3. Anyone can audit the code, contribute, or fork the protocol.",
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="relative w-full overflow-hidden bg-background py-32 text-foreground">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0">
                <div
                    className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full blur-[200px]"
                    style={{ background: "oklch(0.75 0.18 168 / 0.03)" }}
                />
            </div>

            <div className="container relative z-10 mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Left - Header (sticky) */}
                    <div className="flex-1 max-w-md lg:sticky lg:top-32 lg:self-start">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center rounded-full border border-border bg-background/50 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground backdrop-blur-md mb-6"
                        >
                            FAQ
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight"
                        >
                            Got{" "}
                            <span className="font-serif italic" style={{ fontFamily: "var(--font-serif)" }}>
                                <span className="text-brand-gradient">questions?</span>
                            </span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mt-6 text-muted-foreground font-light leading-relaxed"
                        >
                            Everything you need to know about RIDE Protocol, trustless escrow,
                            and decentralized mobility. Can't find your answer?{" "}
                            <a
                                href="#"
                                className="underline underline-offset-4 text-foreground hover:text-brand transition-colors"
                            >
                                Join our Discord.
                            </a>
                        </motion.p>
                    </div>

                    {/* Right - Accordion */}
                    <div className="flex-1 max-w-2xl">
                        {faqs.map((faq, i) => {
                            const isOpen = openIndex === i;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: i * 0.05 }}
                                    viewport={{ once: true }}
                                    className="border-b border-border"
                                >
                                    <button
                                        onClick={() => setOpenIndex(isOpen ? null : i)}
                                        className="group flex w-full items-center justify-between py-6 text-left"
                                    >
                                        <h3
                                            className={`text-base sm:text-lg font-semibold tracking-tight transition-colors pr-4 ${isOpen
                                                    ? "text-foreground"
                                                    : "text-muted-foreground group-hover:text-foreground"
                                                }`}
                                        >
                                            {faq.question}
                                        </h3>
                                        <div
                                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border transition-all duration-300 group-hover:border-brand/20"
                                            style={isOpen ? {
                                                borderColor: "oklch(0.75 0.18 168 / 0.3)",
                                                background: "oklch(0.75 0.18 168 / 0.1)",
                                            } : {}}
                                        >
                                            <motion.div
                                                animate={{ rotate: isOpen ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {isOpen ? (
                                                    <Minus className="h-3.5 w-3.5" style={{ color: "oklch(0.75 0.18 168)" }} />
                                                ) : (
                                                    <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                                                )}
                                            </motion.div>
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
                                                <p className="pb-6 text-sm text-muted-foreground leading-relaxed font-light pr-12">
                                                    {faq.answer}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
