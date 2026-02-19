"use client";

import { motion } from "framer-motion";

const footerLinks = [
    {
        title: "Protocol",
        links: ["Features", "How it Works", "Roadmap", "Tokenomics"],
    },
    {
        title: "Developers",
        links: ["Documentation", "Smart Contracts", "GitHub", "API Reference"],
    },
    {
        title: "Community",
        links: ["Discord", "Twitter/X", "Telegram", "Blog"],
    },
    {
        title: "Legal",
        links: ["Terms of Service", "Privacy Policy", "Disclaimer"],
    },
];

export default function Footer() {
    return (
        <footer className="relative w-full bg-background text-foreground border-t border-border">
            {/* Main footer */}
            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
                    {/* Brand column */}
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="relative flex h-8 w-8 items-center justify-center">
                                <div
                                    className="absolute inset-0 rounded-lg opacity-20 blur-sm"
                                    style={{ background: "oklch(0.75 0.18 168)" }}
                                />
                                <svg
                                    className="relative h-5 w-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                                        style={{ color: "oklch(0.75 0.18 168)" }}
                                    />
                                </svg>
                            </div>
                            <span className="text-lg font-bold tracking-tight">RIDE</span>
                        </div>

                        <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-xs mb-6">
                            The next-generation decentralized ride-sharing protocol. Built on
                            Algorand. Zero fees. Trustless by design.
                        </p>

                        {/* Social icons */}
                        <div className="flex gap-3">
                            {[
                                { label: "Twitter", path: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" },
                                { label: "GitHub", path: "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" },
                                { label: "Discord", path: "M18.8956 5.41C17.5756 4.80 16.1656 4.36 14.6956 4.09C14.5256 4.39 14.3256 4.79 14.1856 5.11C12.6156 4.86 11.0556 4.86 9.5056 5.11C9.3656 4.79 9.1556 4.39 8.9956 4.09C7.5156 4.36 6.0956 4.80 4.7856 5.41C2.0956 9.62 1.3556 13.72 1.7356 17.77C3.5056 19.09 5.2256 19.88 6.9256 20.41C7.3256 19.88 7.6856 19.32 7.9956 18.73C7.4156 18.51 6.8556 18.24 6.3256 17.93C6.4556 17.84 6.5856 17.74 6.7056 17.65C10.1356 19.24 13.8756 19.24 17.2656 17.65C17.3956 17.75 17.5156 17.84 17.6456 17.93C17.1056 18.24 16.5456 18.51 15.9656 18.73C16.2856 19.32 16.6356 19.88 17.0356 20.41C18.7456 19.88 20.4656 19.09 22.2356 17.77C22.6856 13.08 21.4356 9.02 18.8956 5.41Z" },
                            ].map((social) => (
                                <a
                                    key={social.label}
                                    href="#"
                                    aria-label={social.label}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:border-brand/20 hover:text-foreground hover:bg-card/50"
                                >
                                    <svg
                                        className="h-4 w-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d={social.path} />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {footerLinks.map((group) => (
                        <div key={group.title}>
                            <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground mb-4">
                                {group.title}
                            </h4>
                            <ul className="space-y-3">
                                {group.links.map((link) => (
                                    <li key={link}>
                                        <a
                                            href="#"
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light"
                                        >
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-border">
                <div className="container mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground/60">
                        © 2026 RIDE Protocol. Built on Algorand. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                        <span className="text-xs text-muted-foreground/60">
                            All systems operational
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
