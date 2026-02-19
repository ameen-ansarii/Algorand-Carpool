"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const { resetPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            await resetPassword(email);
            setStatus("success");
        } catch (error: any) {
            console.error("Reset password error:", error);
            setStatus("error");
            if (error?.code === "auth/user-not-found") {
                setErrorMessage("No account found with this email.");
            } else if (error?.code === "auth/invalid-email") {
                setErrorMessage("Please enter a valid email address.");
            } else {
                setErrorMessage("Something went wrong. Please try again.");
            }
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="relative w-full max-w-sm rounded-[32px] border border-white/5 bg-black/40 p-8 shadow-2xl backdrop-blur-xl"
            >
                {/* Back Button */}
                <Link
                    href="/"
                    className="absolute left-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>

                <div className="mb-8 mt-4 flex flex-col items-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 ring-1 ring-indigo-500/20">
                        <ShieldCheck className="h-8 w-8 text-indigo-400" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Reset Password
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Enter your email to receive reset instructions
                    </p>
                </div>

                {status === "success" ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-4 py-4 text-center"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                            <Mail className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Check your email</h3>
                        <p className="text-sm text-muted-foreground">
                            We have sent a password reset link to <strong>{email}</strong>
                        </p>
                        <Link
                            href="/"
                            className="mt-4 w-full rounded-2xl bg-indigo-600 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                        >
                            Return to Login
                        </Link>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 w-full rounded-2xl border border-white/5 bg-white/5 pl-12 pr-4 text-sm text-foreground outline-none ring-offset-background transition-all placeholder:text-muted-foreground focus:border-indigo-500/50 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20"
                                required
                            />
                        </div>

                        {status === "error" && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center text-xs text-red-400"
                            >
                                {errorMessage}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-2xl bg-indigo-600 text-sm font-medium text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {status === "loading" ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </span>
                        </button>

                        <div className="mt-4 text-center">
                            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
                                Remember your password? <span className="underline">Log in</span>
                            </Link>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
