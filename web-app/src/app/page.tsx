"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Comparison from "@/components/landing/Comparison";
import HowItWorks from "@/components/landing/HowItWorks";
import LiveFeed from "@/components/landing/LiveFeed";
import Stats from "@/components/landing/Stats";
import Roadmap from "@/components/landing/Roadmap";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import WalletModal from "@/components/onboarding/WalletModal";
import RoleSelection from "@/components/onboarding/RoleSelection";
import Dashboard from "@/components/dashboard/Dashboard";
import { useAuth } from "@/context/AuthContext";
import { saveLastView, saveUserRole, clearSession, getLastView, type ViewState } from "@/lib/session";

export default function Home() {
  const { user, profile, loading } = useAuth();
  const [view, setView] = useState<ViewState>("hero");
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mark component as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Smart auto-navigation based on auth state
  useEffect(() => {
    if (!mounted || loading) return;
    
    // Restore last view from session storage for better UX
    const lastView = getLastView();
    
    if (user && profile) {
      if (profile.role) {
        // User is authenticated with role - go to dashboard
        if (view !== "dashboard") {
          setView("dashboard");
          saveLastView('dashboard');
        }
      } else if (lastView === 'role-selection' && view !== 'role-selection') {
        // User was selecting role - keep them there
        setView("role-selection");
      }
      // If no role and not in selection, stay on hero until they click launch
    } else {
      // Not authenticated - show hero
      if (view !== 'hero') {
        setView("hero");
        clearSession();
      }
    }
  }, [loading, user, profile, mounted]);

  const handleLaunchApp = () => {
    if (user) {
      // Already signed in
      if (profile?.role) {
        setView("dashboard");
        saveLastView('dashboard');
      } else {
        setView("role-selection");
        saveLastView('role-selection');
      }
    } else {
      setIsWalletOpen(true);
    }
  };

  const handleWalletConnect = () => {
    setIsWalletOpen(false);
    // Profile will be loaded automatically by AuthContext
    // Navigation will happen via useEffect when profile is ready
  };

  const handleRoleSelect = (role: "driver" | "rider") => {
    setView("dashboard");
    saveLastView('dashboard');
    saveUserRole(role);
  };

  // Show loading state during initial auth check
  if (!mounted || loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="relative mx-auto h-12 w-12">
            <div className="absolute inset-0 rounded-xl bg-brand opacity-20 blur-lg animate-pulse" />
            <svg
              className="relative h-12 w-12 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                className="text-brand"
                style={{ color: "oklch(0.75 0.18 168)" }}
              />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">Loading PeerPool...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full bg-background transition-colors duration-300">
      <AnimatePresence mode="wait">
        {view === "hero" && (
          <motion.div
            key="hero"
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
            className="relative w-full"
          >
            <Navbar onLaunch={handleLaunchApp} />
            <Hero onLaunch={handleLaunchApp} />
            <Features />
            <Comparison />
            <HowItWorks />
            <LiveFeed />
            <Stats />
            <Roadmap />
            <FAQ />
            <CTA />
            <Footer />
          </motion.div>
        )}

        {view === "role-selection" && (
          <motion.div
            key="role-selection"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-40"
          >
            <RoleSelection onSelect={handleRoleSelect} />
          </motion.div>
        )}

        {view === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Dashboard />
          </motion.div>
        )}
      </AnimatePresence>

      <WalletModal
        open={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onConnect={handleWalletConnect}
      />
    </main>
  );
}
