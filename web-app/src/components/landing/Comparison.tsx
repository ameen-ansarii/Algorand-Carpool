"use client";

import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";

/* ─── Real SVG Logos ─── */
function RideLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden">
                <div
                    className="absolute inset-0 opacity-20"
                    style={{ background: "oklch(0.75 0.18 168)" }}
                />
                <svg className="relative h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" style={{ color: "oklch(0.75 0.18 168)" }} />
                </svg>
            </div>
            <div>
                <span className="text-base font-bold text-foreground">RIDE</span>
                <span
                    className="ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                    style={{ background: "oklch(0.75 0.18 168 / 0.15)", color: "oklch(0.75 0.18 168)" }}
                >
                    Web3
                </span>
            </div>
        </div>
    );
}

function UberLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/5">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-foreground" fill="currentColor">
                    <path d="M0 7.97v4.958c0 1.867 1.302 3.101 3 3.101s3-1.234 3-3.101V7.97H4.565v4.924c0 1.036-.655 1.673-1.565 1.673s-1.565-.637-1.565-1.673V7.97H0zm7.735 0v7.895h1.435V13.97h.065l2.554 1.895h1.86l-2.682-2.2c1.217-.326 1.984-1.2 1.984-2.535 0-1.725-1.15-3.16-3.285-3.16H7.735zm1.435 1.285h1.15c1.2 0 1.88.6 1.88 1.87s-.68 1.87-1.88 1.87h-1.15v-3.74zm6.334-1.285v7.895h4.82v-1.34h-3.384v-1.94h2.918v-1.328h-2.918V9.31h3.29V7.97h-4.726zM23.07 7.97v7.895H24V13.1h-.066l-2.17 2.765h-.192l-2.17-2.765H19.34v2.765h.93V7.97h.182l2.218 3.08 2.218-3.08h.182z" />
                </svg>
            </div>
            <span className="text-base font-bold text-muted-foreground">Uber</span>
        </div>
    );
}

function LyftLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/5">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-foreground" fill="currentColor">
                    <path d="M11.522 7.1v7.3c0 1.5-.7 2.2-1.9 2.2-.5 0-.9-.1-1.2-.3l-.5 1.5c.5.3 1.2.4 1.9.4 2.1 0 3.2-1.4 3.2-3.7V7.1h-1.5zm3.9 0v7.3c0 1.5-.7 2.2-1.9 2.2-.5 0-.9-.1-1.2-.3l-.5 1.5c.5.3 1.2.4 1.9.4 2.1 0 3.2-1.4 3.2-3.7V7.1h-1.5zM7.4 7.1H5.9v5.5c0 2.3 1.2 3.7 3.2 3.7.7 0 1.4-.2 1.9-.4l-.5-1.5c-.3.2-.7.3-1.2.3-1.2 0-1.9-.7-1.9-2.2V7.1z" />
                </svg>
            </div>
            <span className="text-base font-bold text-muted-foreground">Lyft</span>
        </div>
    );
}

function OlaLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/5">
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-foreground" fill="currentColor">
                    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <text x="12" y="15.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor" fontFamily="sans-serif">O</text>
                </svg>
            </div>
            <span className="text-base font-bold text-muted-foreground">Ola</span>
        </div>
    );
}

/* ─── Comparison Data ─── */
type CellStatus = "check" | "cross" | "partial" | string;

interface ComparisonRow {
    feature: string;
    ride: CellStatus;
    uber: CellStatus;
    lyft: CellStatus;
    ola: CellStatus;
}

const comparisonData: ComparisonRow[] = [
    { feature: "Platform Commission", ride: "0%", uber: "25-30%", lyft: "20-25%", ola: "20-25%" },
    { feature: "Settlement Speed", ride: "~3.5 sec", uber: "1-7 days", lyft: "1-5 days", ola: "1-7 days" },
    { feature: "Driver Earnings", ride: "100%", uber: "70-75%", lyft: "75-80%", ola: "75-80%" },
    { feature: "User Data Privacy", ride: "check", uber: "cross", lyft: "cross", ola: "cross" },
    { feature: "Open Source", ride: "check", uber: "cross", lyft: "cross", ola: "cross" },
    { feature: "Decentralized", ride: "check", uber: "cross", lyft: "cross", ola: "cross" },
    { feature: "Surge Pricing", ride: "cross", uber: "check", lyft: "check", ola: "check" },
    { feature: "Community Governed", ride: "check", uber: "cross", lyft: "cross", ola: "cross" },
];

function CellValue({ value, highlight = false }: { value: CellStatus; highlight?: boolean }) {
    if (value === "check") {
        return (
            <div
                className="flex h-7 w-7 items-center justify-center rounded-full"
                style={highlight ? { background: "oklch(0.75 0.18 168 / 0.15)" } : { background: "var(--muted)" }}
            >
                <Check
                    className="h-4 w-4"
                    style={highlight ? { color: "oklch(0.75 0.18 168)" } : {}}
                />
            </div>
        );
    }
    if (value === "cross") {
        return (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive/10">
                <X className="h-4 w-4 text-destructive/70" />
            </div>
        );
    }
    if (value === "partial") {
        return (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500/10">
                <Minus className="h-4 w-4 text-yellow-500/70" />
            </div>
        );
    }
    return (
        <span
            className={`text-sm font-mono font-semibold ${highlight ? "" : "text-muted-foreground"
                }`}
            style={highlight ? { color: "oklch(0.75 0.18 168)" } : {}}
        >
            {value}
        </span>
    );
}

export default function Comparison() {
    return (
        <section id="ecosystem" className="relative w-full overflow-hidden bg-background py-32 text-foreground">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0">
                <div
                    className="absolute top-1/2 left-0 -translate-y-1/2 h-[600px] w-[600px] rounded-full blur-[200px]"
                    style={{ background: "oklch(0.75 0.18 168 / 0.04)" }}
                />
            </div>

            <div className="container relative z-10 mx-auto px-6">
                {/* Header */}
                <div className="mb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center rounded-full border border-border bg-background/50 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground backdrop-blur-md mb-6"
                    >
                        Why RIDE?
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
                    >
                        The{" "}
                        <span className="font-serif italic" style={{ fontFamily: "var(--font-serif)" }}>
                            <span className="text-brand-gradient">unfair</span>
                        </span>{" "}
                        advantage.
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-6 mx-auto max-w-lg text-lg text-muted-foreground font-light"
                    >
                        See how RIDE Protocol stacks up against legacy ride-sharing platforms.
                    </motion.p>
                </div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border bg-card/30 backdrop-blur-sm"
                >
                    {/* Table Header */}
                    <div className="grid grid-cols-5 border-b border-border">
                        <div className="p-5 flex items-center">
                            <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Feature</span>
                        </div>
                        {[
                            { logo: <RideLogo />, highlight: true },
                            { logo: <UberLogo />, highlight: false },
                            { logo: <LyftLogo />, highlight: false },
                            { logo: <OlaLogo />, highlight: false },
                        ].map((col, i) => (
                            <div
                                key={i}
                                className={`p-5 flex items-center justify-center ${col.highlight
                                        ? "bg-brand/5 border-x border-brand/10"
                                        : ""
                                    }`}
                                style={col.highlight ? { background: "oklch(0.75 0.18 168 / 0.03)", borderColor: "oklch(0.75 0.18 168 / 0.08)" } : {}}
                            >
                                {col.logo}
                            </div>
                        ))}
                    </div>

                    {/* Table Rows */}
                    {comparisonData.map((row, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                            viewport={{ once: true }}
                            className={`grid grid-cols-5 ${i < comparisonData.length - 1 ? "border-b border-border" : ""
                                } transition-colors hover:bg-muted/30`}
                        >
                            <div className="p-4 flex items-center">
                                <span className="text-sm text-foreground font-medium">{row.feature}</span>
                            </div>
                            {(["ride", "uber", "lyft", "ola"] as const).map((company) => {
                                const isHighlight = company === "ride";
                                return (
                                    <div
                                        key={company}
                                        className={`p-4 flex items-center justify-center ${isHighlight ? "border-x" : ""
                                            }`}
                                        style={isHighlight ? { background: "oklch(0.75 0.18 168 / 0.03)", borderColor: "oklch(0.75 0.18 168 / 0.08)" } : {}}
                                    >
                                        <CellValue value={row[company]} highlight={isHighlight} />
                                    </div>
                                );
                            })}
                        </motion.div>
                    ))}

                    {/* Bottom highlight bar */}
                    <div
                        className="h-1 col-span-5"
                        style={{
                            background: "linear-gradient(90deg, transparent, oklch(0.75 0.18 168 / 0.5), transparent)",
                        }}
                    />
                </motion.div>

                {/* Bottom note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 text-center text-xs text-muted-foreground/50"
                >
                    * Based on publicly available data as of 2026. Commission rates may vary by region.
                </motion.p>
            </div>
        </section>
    );
}
