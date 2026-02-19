"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, User, ArrowRight, Mail, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface WalletModalProps {
    open: boolean;
    onClose: () => void;
    onConnect: () => void;
}

export default function WalletModal({ open, onClose, onConnect }: WalletModalProps) {
    const { signIn, signInEmail, signUpEmail, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<"signin" | "signup">("signin");

    // Form states
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");

    // Auto-close modal if user becomes authenticated
    useEffect(() => {
        if (user && open) {
            onConnect();
        }
    }, [user, open, onConnect]);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            await signIn();
            onConnect();
        } catch (err: any) {
            console.error("Sign in failed:", err);
            if (err?.code === "auth/popup-closed-by-user") setError("Sign-in was cancelled.");
            else setError("Sign-in failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (mode === "signup") {
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match");
                }
                if (password.length < 6) {
                    throw new Error("Password should be at least 6 characters");
                }
                await signUpEmail(email, password, name);
            } else {
                await signInEmail(email, password);
            }
            onConnect();
        } catch (err: any) {
            console.error("Auth error:", err);
            if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
                setError("Invalid email or password. Please check your details.");
            } else if (err.code === "auth/email-already-in-use") {
                setError("Account already exists. Try signing in instead.");
            } else if (err.code === "auth/weak-password") {
                setError("Password is too weak. Use at least 6 characters.");
            } else {
                setError("Authentication failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGuestMode = () => {
        onConnect();
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 z-[60] w-full max-w-[360px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-white/10 bg-background/80 p-6 shadow-2xl backdrop-blur-xl ring-1 ring-black/5"
                    >
                        {/* Custom Logo & Header */}
                        <div className="relative mb-6 text-center">
                            <h1 className="font-sans text-3xl font-black tracking-tighter italic" style={{ fontVariationSettings: '"slant" -10' }}>
                                RIDE
                            </h1>
                            <p className="mt-1 text-xs font-medium text-muted-foreground tracking-wide uppercase opacity-70">
                                {mode === "signin" ? "Welcome Back" : "Join the Revolution"}
                            </p>

                            <button
                                onClick={onClose}
                                className="absolute -right-2 -top-2 rounded-full p-2 text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Minimal Tabs */}
                        <div className="mb-6 flex rounded-xl bg-muted/30 p-1">
                            {(["signin", "signup"] as const).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMode(m)}
                                    className={cn(
                                        "flex-1 rounded-lg py-2 text-xs font-semibold transition-all duration-300",
                                        mode === m
                                            ? "bg-background shadow-sm text-foreground ring-1 ring-black/5"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {m === "signin" ? "Sign In" : "Sign Up"}
                                </button>
                            ))}
                        </div>

                        {/* Form */}
                        <form onSubmit={handleEmailAuth} className="space-y-3">
                            {mode === "signup" && (
                                <div className="group relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-foreground" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Full Name"
                                        required={mode === "signup"}
                                        className="w-full rounded-xl border border-transparent bg-muted/20 pl-9 pr-4 py-2.5 text-sm outline-none transition-all placeholder:text-muted-foreground/50 hover:bg-muted/30 focus:border-white/10 focus:bg-background focus:ring-2 focus:ring-primary/10"
                                    />
                                </div>
                            )}

                            <div className="group relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email Address"
                                    required
                                    className="w-full rounded-xl border border-transparent bg-muted/20 pl-9 pr-4 py-2.5 text-sm outline-none transition-all placeholder:text-muted-foreground/50 hover:bg-muted/30 focus:border-white/10 focus:bg-background focus:ring-2 focus:ring-primary/10"
                                />
                            </div>

                            <div className="group relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-foreground" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    required
                                    className="w-full rounded-xl border border-transparent bg-muted/20 pl-9 pr-4 py-2.5 text-sm outline-none transition-all placeholder:text-muted-foreground/50 hover:bg-muted/30 focus:border-white/10 focus:bg-background focus:ring-2 focus:ring-primary/10"
                                />
                            </div>

                            {mode === "signin" && (
                                <div className="text-right">
                                    <Link
                                        href="/forgot-password"
                                        onClick={onClose}
                                        className="text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
                            )}

                            {mode === "signup" && (
                                <div className="group relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-foreground" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm Password"
                                        required={mode === "signup"}
                                        className="w-full rounded-xl border border-transparent bg-muted/20 pl-9 pr-4 py-2.5 text-sm outline-none transition-all placeholder:text-muted-foreground/50 hover:bg-muted/30 focus:border-white/10 focus:bg-background focus:ring-2 focus:ring-primary/10"
                                    />
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl py-5 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                    <>
                                        {mode === "signin" ? "Sign In" : "Start Riding"}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="my-5 flex items-center gap-3">
                            <div className="h-px flex-1 bg-border/40" />
                            <span className="text-[10px] uppercase font-medium text-muted-foreground/50">or start with</span>
                            <div className="h-px flex-1 bg-border/40" />
                        </div>

                        {/* Social & Guest */}
                        <div className="space-y-3">
                            <button
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-3 rounded-xl border border-border/40 bg-card/30 p-2.5 transition-all hover:bg-card hover:border-border hover:shadow-sm disabled:opacity-50"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span className="text-xs font-semibold">Google</span>
                            </button>

                            <button
                                onClick={handleGuestMode}
                                className="w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Continue as Guest
                            </button>
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="rounded-lg bg-red-500/10 border border-red-500/10 p-2.5 text-center text-[11px] font-medium text-red-500">
                                        {error}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
