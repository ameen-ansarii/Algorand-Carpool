"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
    onAuthChange,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOutUser,
    getUserProfile,
    updateUserRole,
    sendPasswordReset,
    type UserProfile,
} from "@/lib/firebase";
import { saveUserRole, clearSession } from "@/lib/session";
import type { User } from "firebase/auth";

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    signIn: () => Promise<void>;
    signInEmail: (email: string, pass: string) => Promise<User>;
    signUpEmail: (email: string, pass: string, name: string) => Promise<User>;
    signOut: () => Promise<void>;
    setRole: (role: "driver" | "rider") => Promise<void>;
    refreshProfile: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [initializing, setInitializing] = useState(true);

    // Listen for auth state changes with proper initialization handling
    useEffect(() => {
        let mounted = true;
        
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            if (!mounted) return;
            
            setUser(firebaseUser);
            
            if (firebaseUser) {
                setLoading(true);
                try {
                    const p = await getUserProfile(firebaseUser.uid);
                    if (mounted) {
                        setProfile(p);
                        // Save last known role to session for better UX
                        if (p?.role) {
                            saveUserRole(p.role);
                        }
                    }
                } catch (err) {
                    console.warn("Could not load user profile (Firestore permissions?):", err);
                    if (mounted) {
                        // Create a fallback profile from Firebase Auth data
                        const fallbackProfile = {
                            uid: firebaseUser.uid,
                            displayName: firebaseUser.displayName || "User",
                            email: firebaseUser.email || "",
                            photoURL: firebaseUser.photoURL || "",
                            role: null,
                            walletBalance: 100,
                            totalRides: 0,
                            totalEarnings: 0,
                            rating: 5.0,
                            ratingCount: 0,
                            createdAt: null,
                            updatedAt: null,
                        };
                        setProfile(fallbackProfile);
                    }
                }
            } else {
                if (mounted) {
                    setProfile(null);
                    clearSession();
                }
            }
            
            if (mounted) {
                setLoading(false);
                setInitializing(false);
            }
        });
        
        return () => {
            mounted = false;
            unsubscribe();
        };
    }, []);

    const signIn = async () => {
        try {
            const u = await signInWithGoogle();
            try {
                const p = await getUserProfile(u.uid);
                setProfile(p);
            } catch {
                setProfile({
                    uid: u.uid,
                    displayName: u.displayName || "User",
                    email: u.email || "",
                    photoURL: u.photoURL || "",
                    role: null,
                    walletBalance: 100,
                    totalRides: 0,
                    totalEarnings: 0,
                    rating: 5.0,
                    ratingCount: 0,
                    createdAt: null,
                    updatedAt: null,
                });
            }
        } catch (error) {
            console.error("Sign-in error:", error);
            throw error;
        }
    };

    const runSignInEmail = async (email: string, pass: string) => {
        const u = await signInWithEmail(email, pass);
        // Profile update via onAuthStateChanged or manually trigger a fetch
        return u;
    };

    const runSignUpEmail = async (email: string, pass: string, name: string) => {
        const u = await signUpWithEmail(email, pass, name);
        return u;
    };

    const signOut = async () => {
        await signOutUser();
        setProfile(null);
    };

    const setRole = async (role: "driver" | "rider") => {
        if (!user) return;
        try {
            await updateUserRole(user.uid, role);
            const p = await getUserProfile(user.uid);
            setProfile(p);
        } catch {
            setProfile((prev) => prev ? { ...prev, role } : null);
        }
    };

    const refreshProfile = async () => {
        if (!user) return;
        try {
            const p = await getUserProfile(user.uid);
            setProfile(p);
        } catch {
        }
    };

    const resetPassword = async (email: string) => {
        await sendPasswordReset(email);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                loading: loading || initializing,
                signIn,
                signInEmail: runSignInEmail,
                signUpEmail: runSignUpEmail,
                signOut,
                setRole,
                refreshProfile,
                resetPassword
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
