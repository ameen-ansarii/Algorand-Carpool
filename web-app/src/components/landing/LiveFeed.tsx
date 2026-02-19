"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import {
    ArrowUpRight,
    ArrowDownLeft,
    Shield,
    CheckCircle2,
    Zap,
    Clock,
} from "lucide-react";

/* ─── Simulated transaction data ─── */
const txTypes = [
    {
        type: "Ride Completed",
        icon: CheckCircle2,
        color: "#22c55e",
        bgColor: "rgba(34,197,94,0.1)",
    },
    {
        type: "Escrow Locked",
        icon: Shield,
        color: "oklch(0.75 0.18 168)",
        bgColor: "oklch(0.75 0.18 168 / 0.1)",
    },
    {
        type: "Payment Settled",
        icon: Zap,
        color: "#a78bfa",
        bgColor: "rgba(167,139,250,0.1)",
    },
    {
        type: "Driver Payout",
        icon: ArrowUpRight,
        color: "#38bdf8",
        bgColor: "rgba(56,189,248,0.1)",
    },
    {
        type: "Ride Requested",
        icon: ArrowDownLeft,
        color: "#fb923c",
        bgColor: "rgba(251,146,60,0.1)",
    },
];

const cities = [
    "Mumbai", "Delhi", "Bangalore", "San Francisco", "Dubai",
    "London", "Singapore", "Lagos", "São Paulo", "Tokyo",
    "New York", "Seoul", "Jakarta", "Berlin", "Nairobi",
];

const routes = [
    ["Airport", "Downtown"], ["University", "Station"], ["Mall", "Suburb"],
    ["Tech Park", "Metro"], ["Beach Road", "City Center"], ["Hub", "Terminal"],
];

function generateAddress() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let addr = "";
    for (let i = 0; i < 58; i++) addr += chars[Math.floor(Math.random() * chars.length)];
    return addr;
}

function truncateAddr(addr: string) {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

interface Transaction {
    id: string;
    type: (typeof txTypes)[number];
    amount: number;
    from: string;
    to: string;
    city: string;
    route: string[];
    time: string;
    block: number;
}

function generateTx(): Transaction {
    const type = txTypes[Math.floor(Math.random() * txTypes.length)];
    const route = routes[Math.floor(Math.random() * routes.length)];
    return {
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type,
        amount: parseFloat((Math.random() * 25 + 1).toFixed(2)),
        from: generateAddress(),
        to: generateAddress(),
        city: cities[Math.floor(Math.random() * cities.length)],
        route,
        time: "now",
        block: Math.floor(Math.random() * 1000000) + 30000000,
    };
}

function TransactionCard({ tx, index }: { tx: Transaction; index: number }) {
    const Icon = tx.type.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="group relative flex items-center gap-4 rounded-xl border border-border bg-card/40 backdrop-blur-sm p-4 transition-all duration-300 hover:bg-card/60 hover:border-brand/10"
        >
            {/* Pulse dot */}
            {index === 0 && (
                <motion.div
                    className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ background: tx.type.color }}
                />
            )}

            {/* Icon */}
            <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                style={{ background: tx.type.bgColor }}
            >
                <Icon className="h-4.5 w-4.5" style={{ color: tx.type.color }} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{tx.type.type}</span>
                    <span className="hidden sm:inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground font-mono">
                        {tx.city}
                    </span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <span>{truncateAddr(tx.from)}</span>
                    <span className="text-muted-foreground/40">→</span>
                    <span>{truncateAddr(tx.to)}</span>
                </div>
            </div>

            {/* Amount */}
            <div className="text-right shrink-0">
                <div className="text-sm font-bold font-mono text-foreground">
                    {tx.amount} <span className="text-muted-foreground font-normal">ALGO</span>
                </div>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                    <Clock className="h-3 w-3 text-muted-foreground/50" />
                    <span className="text-[10px] text-muted-foreground/50 font-mono">~2.8s</span>
                </div>
            </div>
        </motion.div>
    );
}

export default function LiveFeed() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [totalTx, setTotalTx] = useState(31847293);

    // Generate initial batch
    useEffect(() => {
        const initial = Array.from({ length: 5 }, () => generateTx());
        setTransactions(initial);
    }, []);

    // Add new transactions periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setTransactions((prev) => {
                const newTx = generateTx();
                const updated = [newTx, ...prev];
                return updated.slice(0, 6); // Keep max 6
            });
            setTotalTx((prev) => prev + 1);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative w-full overflow-hidden bg-background py-32 text-foreground">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0">
                <div
                    className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full blur-[200px]"
                    style={{ background: "oklch(0.75 0.18 168 / 0.03)" }}
                />
            </div>

            <div className="container relative z-10 mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-16 items-start">
                    {/* Left side — header */}
                    <div className="flex-1 max-w-lg lg:sticky lg:top-32">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center rounded-full border border-border bg-background/50 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground backdrop-blur-md mb-6"
                        >
                            <motion.span
                                className="mr-2 h-1.5 w-1.5 rounded-full"
                                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                style={{ background: "#22c55e" }}
                            />
                            Live Network
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight"
                        >
                            The protocol{" "}
                            <span className="font-serif italic" style={{ fontFamily: "var(--font-serif)" }}>
                                <span className="text-brand-gradient">never</span>
                            </span>{" "}
                            sleeps.
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mt-6 text-lg text-muted-foreground font-light leading-relaxed"
                        >
                            Every ride, every payment, every escrow — recorded immutably on-chain. Watch the network breathe in real-time.
                        </motion.p>

                        {/* Live stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="mt-10 grid grid-cols-2 gap-6"
                        >
                            <div className="rounded-xl border border-border bg-card/30 p-4">
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                                    Total Transactions
                                </p>
                                <p className="text-2xl font-bold font-mono text-foreground">
                                    {totalTx.toLocaleString()}
                                </p>
                            </div>
                            <div className="rounded-xl border border-border bg-card/30 p-4">
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                                    Avg. Finality
                                </p>
                                <p className="text-2xl font-bold font-mono" style={{ color: "oklch(0.75 0.18 168)" }}>
                                    2.8s
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right side — scrolling feed */}
                    <div className="flex-1 w-full max-w-xl">
                        <div className="space-y-3 relative">
                            {/* Top fade */}
                            <div className="absolute -top-4 left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />

                            <AnimatePresence mode="popLayout">
                                {transactions.map((tx, i) => (
                                    <TransactionCard key={tx.id} tx={tx} index={i} />
                                ))}
                            </AnimatePresence>

                            {/* Bottom fade */}
                            <div className="absolute -bottom-4 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
