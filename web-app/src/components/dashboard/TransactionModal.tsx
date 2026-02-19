"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, Smartphone, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionModalProps {
    open: boolean;
    onCancel: () => void;
    amount?: number;
    message?: string;
}

export default function TransactionModal({ open, onCancel, amount, message }: TransactionModalProps) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 z-[110] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-white/10 bg-background p-8 shadow-2xl backdrop-blur-xl"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onCancel}
                            className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Content */}
                        <div className="flex flex-col items-center text-center space-y-6">
                            {/* Animated Icon */}
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
                                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 ring-2 ring-blue-500/20">
                                    <Smartphone className="h-10 w-10 text-blue-500 animate-pulse" />
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Waiting for Signature</h2>
                                {amount && (
                                    <p className="text-3xl font-black text-emerald-500">
                                        {amount} <span className="text-lg text-muted-foreground">ALGO</span>
                                    </p>
                                )}
                            </div>

                            {/* Instructions */}
                            <div className="space-y-3 w-full">
                                <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
                                    <div className="flex items-start gap-3">
                                        <Smartphone className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                        <div className="text-left text-sm space-y-1">
                                            <p className="font-semibold text-blue-500">📱 Check Your Phone NOW</p>
                                            <p className="text-muted-foreground">
                                                A notification should appear on your phone. Open the <strong>Pera Wallet app</strong> and tap <strong>&quot;Approve&quot;</strong> to complete the transaction.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                        <div className="text-left text-sm space-y-1">
                                            <p className="font-semibold text-amber-500">Not seeing the request?</p>
                                            <ul className="text-muted-foreground list-disc list-inside space-y-1">
                                                <li>Make sure Pera Wallet app is installed</li>
                                                <li>Check if you&apos;re logged into the correct wallet</li>
                                                <li>Pull down to refresh the app</li>
                                                <li>Try closing and reopening Pera Wallet</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Message */}
                            {message && (
                                <p className="text-sm text-muted-foreground">{message}</p>
                            )}

                            {/* Loading Spinner */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Waiting for approval...</span>
                            </div>

                            {/* Cancel Button */}
                            <Button
                                variant="outline"
                                onClick={onCancel}
                                className="w-full rounded-xl"
                            >
                                Cancel Transaction
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
