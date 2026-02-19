"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Plus, User, LogOut, Wallet, Star, Clock, MapPin, Car, X,
    Loader2, ChevronRight, Users, DollarSign, CheckCircle, Navigation,
    BookOpen, LayoutDashboard, History, ExternalLink, Link2, Settings,
    Bell, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import {
    getUserRides, cancelRide, completeRide, updateRideStatus,
    incrementDriverStats, hasReviewedRide,
    onUserRidesUpdate,
    // Ride-request (Uber model)
    onPendingRequestsUpdate, onDriverActiveRequestsUpdate, onRiderRequestsUpdate,
    acceptRideRequest, confirmRideRequest, completeRideRequest, cancelRideRequest,
    type Ride, type RideRequest,
} from "@/lib/firebase";
import {
    getExplorerUrl, getAppExplorerUrl, APP_ID, shortenAddress,
    createRideOnChain, joinRideOnChain, completeRideOnChain,
    cancelRideOnChain, parseBlockchainError,
} from "@/lib/algorand";
import ModeToggle from "@/components/ui/toggle-mode";
import FeedbackModal from "./FeedbackModal";
import DriverSetupModal from "./DriverSetupModal";
import RideTracker from "./RideTracker";
import TransactionModal from "./TransactionModal";
import BookRideModal from "./BookRideModal";

// ==================== TYPES ====================
type DriverTab = "home" | "requests" | "my-rides" | "profile";
type RiderTab = "home" | "my-requests" | "activity" | "profile";

export default function Dashboard() {
    const { user, profile, signOut, refreshProfile } = useAuth();
    const { walletAddress, displayAddress, balance, connecting, isConnected, initializing: walletInitializing, connect, disconnect, refreshBalance } = useWallet();
    const isDriver = profile?.role === "driver";

    // Driver state
    const [driverTab, setDriverTab] = useState<DriverTab>("home");
    const [myRides, setMyRides] = useState<Ride[]>([]);
    const [loadingMyRides, setLoadingMyRides] = useState(true);
    const [pendingRequests, setPendingRequests] = useState<RideRequest[]>([]);
    const [myAcceptedRequests, setMyAcceptedRequests] = useState<RideRequest[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(true);

    // Rider state
    const [riderTab, setRiderTab] = useState<RiderTab>("home");
    const [myRideRequests, setMyRideRequests] = useState<RideRequest[]>([]);
    const [loadingRiderRequests, setLoadingRiderRequests] = useState(true);
    const [showBookModal, setShowBookModal] = useState(false);

    // Shared state
    const [showDriverSetup, setShowDriverSetup] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [txSuccess, setTxSuccess] = useState<{ txId: string; message: string } | null>(null);
    const [firestoreError, setFirestoreError] = useState<string | null>(null);

    // Transaction modal state
    const [showTxModal, setShowTxModal] = useState(false);
    const [txModalAmount, setTxModalAmount] = useState<number | undefined>(undefined);
    const [txAbortController, setTxAbortController] = useState<AbortController | null>(null);

    // Ride tracking + feedback
    const [trackingRideId, setTrackingRideId] = useState<string | null>(null);
    const [feedbackRide, setFeedbackRide] = useState<Ride | null>(null);

    // ==================== REALTIME DATA ====================
    useEffect(() => {
        if (!user) return;
        if (isDriver) {
            setLoadingMyRides(true);
            setLoadingRequests(true);
            // Driver's own completed/cancelled rides (legacy + on-chain)
            const unsub1 = onUserRidesUpdate(user.uid, (rides) => {
                setMyRides(rides);
                setLoadingMyRides(false);
            });
            // All pending ride requests (feed for driver to accept)
            const unsub2 = onPendingRequestsUpdate((reqs) => {
                setPendingRequests(reqs);
                setLoadingRequests(false);
            });
            // Driver's own accepted/in-progress/completed requests
            const unsub3 = onDriverActiveRequestsUpdate(user.uid, (reqs) => {
                setMyAcceptedRequests(reqs);
            });
            return () => { unsub1(); unsub2(); unsub3(); };
        } else {
            setLoadingRiderRequests(true);
            const unsub = onRiderRequestsUpdate(user.uid, (reqs) => {
                setMyRideRequests(reqs);
                setLoadingRiderRequests(false);
            });
            return () => unsub();
        }
    }, [isDriver, user]);

    // ==================== HANDLERS ====================

    /** DRIVER: Accept a rider's request → create_ride on-chain */
    const handleAcceptRequest = async (requestId: string) => {
        if (!isConnected || !walletAddress) {
            alert("❌ Please connect your Pera Wallet first!"); return;
        }
        if (!profile?.driverDetails?.carModel) {
            setShowDriverSetup(true); return;
        }
        const req = pendingRequests.find(r => r.id === requestId);
        if (!req) { alert("Request not found"); return; }

        setActionLoading(requestId);
        setTxModalAmount(req.fare);
        setShowTxModal(true);

        const controller = new AbortController();
        setTxAbortController(controller);
        const timeoutId = setTimeout(() => {
            controller.abort();
            setShowTxModal(false);
            setActionLoading(null);
            alert("⏱️ Transaction timed out. Please try again.");
        }, 90000);

        try {
            console.log("🔗 Creating ride on-chain for accepted request...");
            const { txId, rideId } = await createRideOnChain(walletAddress, req.fare, req.seats);
            clearTimeout(timeoutId);
            if (controller.signal.aborted) return;

            console.log("✅ Ride created on-chain! TxID:", txId, "RideID:", rideId);
            const dd = profile.driverDetails!;
            await acceptRideRequest(
                requestId,
                user!.uid,
                profile.displayName || user?.displayName || "Driver",
                profile.photoURL || user?.photoURL || "",
                walletAddress,
                dd.carModel, dd.carColor, dd.licensePlate, dd.carType,
                rideId, txId
            );
            setTxSuccess({ txId, message: `Request accepted! Rider will now confirm payment.` });
            setTimeout(() => setTxSuccess(null), 8000);
            await refreshBalance();
        } catch (err: any) {
            clearTimeout(timeoutId);
            if (!controller.signal.aborted) {
                alert(`❌ ${parseBlockchainError(err)}`);
            }
        } finally {
            clearTimeout(timeoutId);
            setShowTxModal(false);
            setActionLoading(null);
            setTxAbortController(null);
        }
    };

    /** RIDER: Pay for an accepted request → join_ride on-chain */
    const handlePayForRide = async (requestId: string) => {
        if (!isConnected || !walletAddress) {
            alert("❌ Please connect your Pera Wallet first!"); return;
        }
        const req = myRideRequests.find(r => r.id === requestId);
        if (!req || !req.onChainId) { alert("Ride not ready yet"); return; }

        setActionLoading(requestId);
        setTxModalAmount(req.fare * req.seats);
        setShowTxModal(true);

        const controller = new AbortController();
        setTxAbortController(controller);
        const timeoutId = setTimeout(() => {
            controller.abort();
            setShowTxModal(false);
            setActionLoading(null);
            alert("⏱️ Transaction timed out. Please try again.");
        }, 90000);

        try {
            console.log("💰 Paying for ride via join_ride...");
            // join_ride sends fare * seats total into escrow
            const txId = await joinRideOnChain(walletAddress, req.onChainId, req.fare * req.seats);
            clearTimeout(timeoutId);
            if (controller.signal.aborted) return;

            console.log("✅ Payment sent! TxID:", txId);
            await confirmRideRequest(requestId, txId);
            setTxSuccess({ txId, message: `Payment confirmed! Your driver is on the way.` });
            setTimeout(() => setTxSuccess(null), 8000);
            setRiderTab("my-requests");
            await refreshBalance();
        } catch (err: any) {
            clearTimeout(timeoutId);
            if (!controller.signal.aborted) {
                alert(`❌ ${parseBlockchainError(err)}`);
            }
        } finally {
            clearTimeout(timeoutId);
            setShowTxModal(false);
            setActionLoading(null);
            setTxAbortController(null);
        }
    };

    /** RIDER: Cancel a pending request */
    const handleCancelRequest = async (requestId: string) => {
        if (!confirm("Cancel your ride request?")) return;
        setActionLoading(requestId);
        try {
            await cancelRideRequest(requestId);
        } catch (err: any) {
            alert(`Failed to cancel: ${err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancelTransaction = () => {
        if (txAbortController) txAbortController.abort();
        setShowTxModal(false);
        setActionLoading(null);
    };

    /** DRIVER: Complete an accepted/confirmed request → complete_ride on-chain */
    const handleCompleteRequest = async (requestId: string) => {
        if (!isConnected || !walletAddress) {
            alert("❌ Please connect your Pera Wallet first!"); return;
        }
        const req = myAcceptedRequests.find(r => r.id === requestId);
        if (!req || !req.onChainId) {
            alert("Ride not found or not on-chain"); return;
        }

        const earnings = req.fare * req.seats;
        setActionLoading(requestId);
        setTxModalAmount(earnings);
        setShowTxModal(true);

        const controller = new AbortController();
        setTxAbortController(controller);
        const timeoutId = setTimeout(() => {
            controller.abort();
            setShowTxModal(false);
            setActionLoading(null);
            alert("⏱️ Transaction timed out. Please try again.");
        }, 90000);

        try {
            console.log("💸 Completing ride and releasing escrow...");
            const txId = await completeRideOnChain(walletAddress, req.onChainId!);
            clearTimeout(timeoutId);
            if (controller.signal.aborted) return;

            console.log("✅ Escrow released! TxID:", txId);
            await completeRideRequest(requestId);
            if (user) await incrementDriverStats(user.uid, earnings);
            setTxSuccess({ txId, message: `Ride completed! Earned ${earnings.toFixed(2)} ALGO` });
            setTimeout(() => setTxSuccess(null), 8000);
            await refreshBalance();
            await refreshProfile();
        } catch (err: any) {
            clearTimeout(timeoutId);
            if (!controller.signal.aborted) {
                alert(`❌ ${parseBlockchainError(err)}`);
            }
        } finally {
            clearTimeout(timeoutId);
            setShowTxModal(false);
            setActionLoading(null);
            setTxAbortController(null);
        }
    };

    /** DRIVER: Cancel an accepted request → cancel_ride on-chain */
    const handleCancelAccepted = async (requestId: string) => {
        if (!isConnected || !walletAddress) {
            alert("❌ Please connect your Pera Wallet first!"); return;
        }
        const req = myAcceptedRequests.find(r => r.id === requestId);
        if (!req) { alert("Ride not found"); return; }

        if (!confirm("Cancel this ride? A penalty will apply if the rider has already paid.")) return;

        setActionLoading(requestId);

        if (!req.onChainId) {
            // Not yet on-chain confirmed by rider — just cancel
            try {
                await cancelRideRequest(requestId);
                alert("✅ Ride cancelled.");
            } catch (err: any) {
                alert(`Failed: ${err.message}`);
            } finally {
                setActionLoading(null);
            }
            return;
        }

        const numPassengers = req.status === "confirmed" || req.status === "in-progress" ? 1 : 0;
        setTxModalAmount(numPassengers * 0.1);
        setShowTxModal(true);

        const controller = new AbortController();
        setTxAbortController(controller);
        const timeoutId = setTimeout(() => {
            controller.abort();
            setShowTxModal(false);
            setActionLoading(null);
            alert("⏱️ Transaction timed out.");
        }, 90000);

        try {
            const txId = await cancelRideOnChain(walletAddress, req.onChainId!, numPassengers);
            clearTimeout(timeoutId);
            if (controller.signal.aborted) return;
            await cancelRideRequest(requestId);
            setTxSuccess({ txId, message: "Ride cancelled and rider refunded." });
            setTimeout(() => setTxSuccess(null), 8000);
            await refreshBalance();
        } catch (err: any) {
            clearTimeout(timeoutId);
            if (!controller.signal.aborted) alert(`❌ ${parseBlockchainError(err)}`);
        } finally {
            clearTimeout(timeoutId);
            setShowTxModal(false);
            setActionLoading(null);
            setTxAbortController(null);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        window.location.reload();
    };

    const handleDriverSetupClick = () => {
        setShowDriverSetup(true);
    };

    // Check for completed rides that need feedback (legacy)
    const checkForReview = async (ride: Ride) => {
        if (!user || !ride.id) return;
        const reviewed = await hasReviewedRide(ride.id, user.uid);
        if (!reviewed) setFeedbackRide(ride);
    };

    // Derived
    const activeDriverRequests = myAcceptedRequests.filter(r =>
        ["accepted", "confirmed", "in-progress"].includes(r.status)
    );
    const completedDriverRequests = myAcceptedRequests.filter(r =>
        r.status === "completed" || r.status === "cancelled"
    );
    const pastDriverRides = myRides.filter(r => r.status === "completed" || r.status === "cancelled");
    const driverEarnings = myAcceptedRequests
        .filter(r => r.status === "completed")
        .reduce((s, r) => s + r.fare * r.seats, 0);

    const activeRiderRequests = myRideRequests.filter(r =>
        ["pending", "accepted", "confirmed", "in-progress"].includes(r.status)
    );
    const completedRiderRequests = myRideRequests.filter(r =>
        r.status === "completed" || r.status === "cancelled"
    );

    const displayName = profile?.displayName?.split(" ")[0] || user?.displayName?.split(" ")[0] || "User";
    const hasCarSetup = !!profile?.driverDetails?.carModel;
    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
            {/* ==================== HEADER ==================== */}
            <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-2xl">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">RIDE</h1>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                            {isDriver ? "Driver" : "Rider"}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <ModeToggle />
                        {isConnected ? (
                            <button onClick={() => isDriver ? setDriverTab("profile") : setRiderTab("profile")} className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 transition-all hover:bg-emerald-500/20">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <Wallet className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-sm font-semibold">
                                    {balance.toFixed(2)} <span className="text-muted-foreground text-xs">ALGO</span>
                                </span>
                                <span className="text-xs text-muted-foreground hidden sm:inline">({displayAddress})</span>
                            </button>
                        ) : (
                            <Button variant="outline" size="sm" onClick={connect} disabled={connecting} className="rounded-full h-8 px-4 text-xs gap-2">
                                {connecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wallet className="h-3.5 w-3.5" />}
                                {connecting ? "Connecting..." : "Connect Wallet"}
                            </Button>
                        )}
                        {user?.photoURL ? (
                            <button onClick={() => isDriver ? setDriverTab("profile") : setRiderTab("profile")} className="h-9 w-9 overflow-hidden rounded-full border-2 border-primary/30 transition-all hover:border-primary">
                                <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                            </button>
                        ) : (
                            <button onClick={() => isDriver ? setDriverTab("profile") : setRiderTab("profile")} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                <User className="h-4 w-4 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* ==================== MAIN ==================== */}
            <main className="mx-auto max-w-5xl px-4 py-6 pb-28">
                {firestoreError && (
                    <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">⚠️ {firestoreError}</div>
                )}

                {/* Wallet Banner */}
                {!isConnected && !walletInitializing && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-6 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-5 flex items-center justify-between">
                        <div>
                            <p className="font-semibold">Connect Pera Wallet</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Required for on-chain ride payments</p>
                        </div>
                        <Button onClick={connect} disabled={connecting} size="sm" className="rounded-full px-5">
                            {connecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Link2 className="h-4 w-4 mr-2" />}
                            {connecting ? "Connecting..." : "Connect Pera Wallet"}
                        </Button>
                    </motion.div>
                )}

                {/* Driver: Setup Required Banner */}
                {isDriver && !hasCarSetup && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 flex items-center justify-between">
                        <div>
                            <p className="font-semibold">Complete Your Driver Profile</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Add your vehicle details to start accepting rides</p>
                        </div>
                        <Button onClick={() => setShowDriverSetup(true)} size="sm" variant="outline" className="rounded-full px-5">
                            <Settings className="h-4 w-4 mr-2" /> Setup Vehicle
                        </Button>
                    </motion.div>
                )}

                {/* Tx Success Toast */}
                <AnimatePresence>
                    {txSuccess && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{txSuccess.message}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <a href={getExplorerUrl(txSuccess.txId)} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                                    View on Explorer <ExternalLink className="h-3 w-3" />
                                </a>
                                <button onClick={() => setTxSuccess(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Ride Tracker */}
                {trackingRideId && (
                    <RideTracker rideId={trackingRideId} isDriver={isDriver}
                        onComplete={() => { setTrackingRideId(null); refreshProfile(); }}
                        onClose={() => setTrackingRideId(null)} />
                )}

                <AnimatePresence mode="wait">
                    {isDriver ? (
                        /* ==================== DRIVER VIEWS ==================== */
                        <>
                            {/* DRIVER HOME */}
                            {driverTab === "home" && (
                                <motion.div key="driver-home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <div className="mb-8">
                                        <h1 className="text-3xl font-bold">Hey {displayName} 🚗</h1>
                                        <p className="mt-1 text-muted-foreground">
                                            {pendingRequests.length > 0
                                                ? `${pendingRequests.length} rider${pendingRequests.length > 1 ? "s" : ""} waiting for a driver!`
                                                : "No ride requests right now. Check back soon."}
                                        </p>
                                    </div>

                                    {/* Driver Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                        {[
                                            { label: "Balance", value: isConnected ? balance.toFixed(2) : "—", unit: "ALGO", icon: Wallet, color: "text-emerald-500" },
                                            { label: "Earned", value: (profile?.totalEarnings ?? driverEarnings).toFixed(1), unit: "ALGO", icon: DollarSign, color: "text-green-500" },
                                            { label: "Active", value: activeDriverRequests.length, unit: "rides", icon: Car, color: "text-indigo-500" },
                                            { label: "Rating", value: `${profile?.rating?.toFixed(1) ?? "5.0"} ★`, unit: `(${profile?.ratingCount ?? 0})`, icon: Star, color: "text-amber-500" },
                                        ].map((stat, i) => (
                                            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                                className="rounded-2xl border border-border bg-card/50 backdrop-blur p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                                                </div>
                                                <p className="text-2xl font-bold">{stat.value} <span className="text-sm font-normal text-muted-foreground">{stat.unit}</span></p>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Vehicle Card */}
                                    {hasCarSetup && (
                                        <div className="rounded-2xl border border-border bg-card/50 p-4 mb-6 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{profile?.driverDetails?.carType === "suv" ? "🚙" : profile?.driverDetails?.carType === "auto" ? "🛺" : profile?.driverDetails?.carType === "bike" ? "🏍️" : "🚘"}</span>
                                                <div>
                                                    <p className="font-semibold">{profile?.driverDetails?.carModel} · <span className="text-muted-foreground">{profile?.driverDetails?.carColor}</span></p>
                                                    <p className="text-xs text-muted-foreground font-mono">{profile?.driverDetails?.licensePlate}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setShowDriverSetup(true)} className="text-xs text-primary hover:underline">Edit</button>
                                        </div>
                                    )}

                                    {/* Active Rides I Accepted */}
                                    {activeDriverRequests.length > 0 && (
                                        <div className="mb-8">
                                            <h2 className="text-xl font-semibold mb-4">Your Active Rides</h2>
                                            <div className="space-y-3">
                                                {activeDriverRequests.map(req => (
                                                    <RequestCard key={req.id} req={req} isDriver
                                                        onComplete={req.status === "confirmed" || req.status === "in-progress" ? () => req.id && handleCompleteRequest(req.id!) : undefined}
                                                        onCancel={() => req.id && handleCancelAccepted(req.id!)}
                                                        loading={actionLoading === req.id} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Pending Requests from Riders */}
                                    <h2 className="text-xl font-semibold mb-4">
                                        Incoming Requests
                                        {pendingRequests.length > 0 && (
                                            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{pendingRequests.length}</span>
                                        )}
                                    </h2>
                                    {loadingRequests ? (
                                        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                                    ) : pendingRequests.length > 0 ? (
                                        <div className="space-y-3">
                                            {pendingRequests.map(req => (
                                                <RequestCard key={req.id} req={req} isDriver
                                                    onAccept={hasCarSetup ? () => req.id && handleAcceptRequest(req.id!) : undefined}
                                                    loading={actionLoading === req.id} />
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState icon={Bell} title="No requests yet" description="Riders will post requests here — you'll see them in real time!" />
                                    )}
                                </motion.div>
                            )}

                            {/* DRIVER REQUESTS TAB */}
                            {driverTab === "requests" && (
                                <motion.div key="driver-requests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <h1 className="text-3xl font-bold mb-2">Ride Requests</h1>
                                    <p className="text-muted-foreground mb-6">Live requests from riders near you</p>
                                    {loadingRequests ? (
                                        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                                    ) : pendingRequests.length > 0 ? (
                                        <div className="space-y-3">
                                            {pendingRequests.map(req => (
                                                <RequestCard key={req.id} req={req} isDriver
                                                    onAccept={hasCarSetup ? () => req.id && handleAcceptRequest(req.id!) : undefined}
                                                    loading={actionLoading === req.id} />
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState icon={Bell} title="No pending requests" description="All caught up! New rider requests will appear here." />
                                    )}
                                </motion.div>
                            )}

                            {/* DRIVER MY-RIDES TAB */}
                            {driverTab === "my-rides" && (
                                <motion.div key="driver-myrides" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <h1 className="text-3xl font-bold mb-2">My Rides</h1>
                                    <p className="text-muted-foreground mb-6">{myAcceptedRequests.length} total rides</p>
                                    {activeDriverRequests.length > 0 && (
                                        <>
                                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Active</h3>
                                            <div className="space-y-3 mb-8">
                                                {activeDriverRequests.map(req => (
                                                    <RequestCard key={req.id} req={req} isDriver
                                                        onComplete={req.status === "confirmed" || req.status === "in-progress" ? () => req.id && handleCompleteRequest(req.id!) : undefined}
                                                        onCancel={() => req.id && handleCancelAccepted(req.id!)}
                                                        loading={actionLoading === req.id} />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    {completedDriverRequests.length > 0 && (
                                        <>
                                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">History</h3>
                                            <div className="space-y-3">
                                                {completedDriverRequests.map(req => (
                                                    <RequestCard key={req.id} req={req} isDriver />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    {myAcceptedRequests.length === 0 && (
                                        <EmptyState icon={Car} title="No rides yet" description="Accept a rider's request to get started!" />
                                    )}
                                </motion.div>
                            )}

                            {/* DRIVER PROFILE */}
                            {driverTab === "profile" && (
                                <motion.div key="driver-profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <ProfileView onSignOut={handleSignOut} onEditVehicle={() => setShowDriverSetup(true)} extraStats={[
                                        { label: "Rides Given", value: profile?.totalRides ?? completedDriverRequests.length },
                                        { label: "Total Earned", value: `${(profile?.totalEarnings ?? driverEarnings).toFixed(1)} ALGO` },
                                        { label: "Active Rides", value: activeDriverRequests.length },
                                    ]} />
                                </motion.div>
                            )}
                        </>
                    ) : (
                        /* ==================== RIDER VIEWS ==================== */
                        <>
                            {/* RIDER HOME */}
                            {riderTab === "home" && (
                                <motion.div key="rider-home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <div className="mb-8">
                                        <h1 className="text-3xl font-bold">Hey {displayName} 👋</h1>
                                        <p className="mt-1 text-muted-foreground">Where are you going today?</p>
                                    </div>

                                    {/* Rider Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                        {[
                                            { label: "Balance", value: isConnected ? balance.toFixed(2) : "—", unit: "ALGO", icon: Wallet, color: "text-emerald-500" },
                                            { label: "Rides Taken", value: profile?.totalRides ?? 0, unit: "", icon: Navigation, color: "text-indigo-500" },
                                            { label: "Active", value: activeRiderRequests.length, unit: "requests", icon: MapPin, color: "text-purple-500" },
                                            { label: "Rating", value: `${profile?.rating?.toFixed(1) ?? "5.0"} ★`, unit: "", icon: Star, color: "text-amber-500" },
                                        ].map((stat, i) => (
                                            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                                className="rounded-2xl border border-border bg-card/50 backdrop-blur p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                                                </div>
                                                <p className="text-2xl font-bold">{stat.value} <span className="text-sm font-normal text-muted-foreground">{stat.unit}</span></p>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Book a Ride CTA */}
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                                        className="mb-8 rounded-3xl border border-border bg-gradient-to-r from-indigo-500/10 via-card/50 to-purple-500/10 p-8 flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold">Need a ride?</h2>
                                            <p className="mt-1 text-muted-foreground">Post your pickup & drop-off — drivers will accept your request</p>
                                        </div>
                                        <Button onClick={() => setShowBookModal(true)} className="rounded-full h-11 px-6 text-sm font-semibold">
                                            <Plus className="mr-2 h-4 w-4" /> Book a Ride
                                        </Button>
                                    </motion.div>

                                    {/* Active requests */}
                                    {activeRiderRequests.length > 0 && (
                                        <>
                                            <h2 className="text-xl font-semibold mb-4">Your Active Requests</h2>
                                            <div className="space-y-3">
                                                {activeRiderRequests.map(req => (
                                                    <RequestCard key={req.id} req={req}
                                                        onPay={req.status === "accepted" ? () => req.id && handlePayForRide(req.id!) : undefined}
                                                        onCancel={req.status === "pending" ? () => req.id && handleCancelRequest(req.id!) : undefined}
                                                        loading={actionLoading === req.id} />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}

                            {/* RIDER MY-REQUESTS TAB */}
                            {riderTab === "my-requests" && (
                                <motion.div key="rider-requests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h1 className="text-3xl font-bold">My Requests</h1>
                                            <p className="mt-1 text-muted-foreground">{myRideRequests.length} requests</p>
                                        </div>
                                        <Button onClick={() => setShowBookModal(true)} className="rounded-full h-9 px-4 text-sm">
                                            <Plus className="mr-1.5 h-4 w-4" /> New Request
                                        </Button>
                                    </div>
                                    {loadingRiderRequests ? (
                                        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                                    ) : (
                                        <>
                                            {activeRiderRequests.length > 0 && (
                                                <>
                                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Active</h3>
                                                    <div className="space-y-3 mb-8">
                                                        {activeRiderRequests.map(req => (
                                                            <RequestCard key={req.id} req={req}
                                                                onPay={req.status === "accepted" ? () => req.id && handlePayForRide(req.id!) : undefined}
                                                                onCancel={req.status === "pending" ? () => req.id && handleCancelRequest(req.id!) : undefined}
                                                                loading={actionLoading === req.id} />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                            {completedRiderRequests.length > 0 && (
                                                <>
                                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">History</h3>
                                                    <div className="space-y-3">
                                                        {completedRiderRequests.map(req => (
                                                            <RequestCard key={req.id} req={req} />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                            {myRideRequests.length === 0 && (
                                                <EmptyState icon={MapPin} title="No requests yet" description="Book your first ride!" buttonLabel="Book a Ride" onAction={() => setShowBookModal(true)} />
                                            )}
                                        </>
                                    )}
                                </motion.div>
                            )}

                            {/* RIDER ACTIVITY */}
                            {riderTab === "activity" && (
                                <motion.div key="rider-activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <h1 className="text-3xl font-bold mb-2">Activity</h1>
                                    <p className="text-muted-foreground mb-6">Your ride history</p>
                                    {completedRiderRequests.length > 0 ? (
                                        <div className="space-y-3">
                                            {completedRiderRequests.map(req => (
                                                <RequestCard key={req.id} req={req} />
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState icon={History} title="No completed rides" description="Your ride history will appear here" />
                                    )}
                                </motion.div>
                            )}

                            {/* RIDER PROFILE */}
                            {riderTab === "profile" && (
                                <motion.div key="rider-profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <ProfileView onSignOut={handleSignOut} extraStats={[
                                        { label: "Rides Taken", value: completedRiderRequests.length },
                                        { label: "Total Spent", value: `${completedRiderRequests.reduce((s, r) => s + r.fare * r.seats, 0).toFixed(1)} ALGO` },
                                        { label: "Active", value: activeRiderRequests.length },
                                    ]} />
                                </motion.div>
                            )}
                        </>
                    )}
                </AnimatePresence>
            </main>

            {/* ==================== MODALS ==================== */}
            <BookRideModal open={showBookModal} onClose={() => setShowBookModal(false)} onBooked={() => { setRiderTab("my-requests"); setShowBookModal(false); }} />

            {showDriverSetup && user && (
                <DriverSetupModal open={showDriverSetup} onClose={() => setShowDriverSetup(false)}
                    uid={user.uid} existing={profile?.driverDetails}
                    onSaved={() => refreshProfile()} />
            )}

            {feedbackRide && user && (
                <FeedbackModal open={!!feedbackRide} onClose={() => setFeedbackRide(null)}
                    rideId={feedbackRide.id!} targetId={feedbackRide.driverId}
                    reviewerId={user.uid} reviewerName={profile?.displayName || user.displayName || ""}
                    reviewerPhoto={profile?.photoURL || user.photoURL || ""}
                    targetName={feedbackRide.driverName} />
            )}

            <TransactionModal open={showTxModal} onCancel={handleCancelTransaction} amount={txModalAmount} />

            {/* ==================== BOTTOM DOCK ==================== */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                    className="flex items-center gap-1 rounded-2xl border border-border bg-background/80 backdrop-blur-2xl p-1.5 shadow-2xl">
                    {isDriver ? (
                        <>
                            {([
                                { icon: LayoutDashboard, label: "Home", tab: "home" as DriverTab, badge: 0 },
                                { icon: Bell, label: "Requests", tab: "requests" as DriverTab, badge: pendingRequests.length },
                                { icon: Car, label: "My Rides", tab: "my-rides" as DriverTab, badge: 0 },
                                { icon: User, label: "Profile", tab: "profile" as DriverTab, badge: 0 },
                            ]).map(item => (
                                <button key={item.label} onClick={() => setDriverTab(item.tab)}
                                    className={`group relative flex h-12 items-center gap-2 rounded-xl px-3 transition-all ${driverTab === item.tab ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                                    <item.icon className="h-5 w-5" />
                                    <span className="text-xs font-medium hidden sm:inline">{item.label}</span>
                                    {item.badge > 0 && (
                                        <span className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${driverTab === item.tab ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"}`}>{item.badge}</span>
                                    )}
                                </button>
                            ))}
                        </>
                    ) : (
                        <>
                            {([
                                { icon: LayoutDashboard, label: "Home", tab: "home" as RiderTab, badge: 0 },
                                { icon: BookOpen, label: "Requests", tab: "my-requests" as RiderTab, badge: activeRiderRequests.length },
                                { icon: History, label: "Activity", tab: "activity" as RiderTab, badge: 0 },
                                { icon: User, label: "Profile", tab: "profile" as RiderTab, badge: 0 },
                            ]).map(item => (
                                <button key={item.label} onClick={() => setRiderTab(item.tab)}
                                    className={`group relative flex h-12 items-center gap-2 rounded-xl px-3 transition-all ${riderTab === item.tab ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                                    <item.icon className="h-5 w-5" />
                                    <span className="text-xs font-medium hidden sm:inline">{item.label}</span>
                                    {item.badge > 0 && (
                                        <span className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${riderTab === item.tab ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"}`}>{item.badge}</span>
                                    )}
                                </button>
                            ))}
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

// ==================== REQUEST CARD ====================
function RequestCard({
    req, isDriver = false,
    onAccept, onPay, onComplete, onCancel, loading,
}: {
    req: RideRequest;
    isDriver?: boolean;
    onAccept?: () => void;
    onPay?: () => void;
    onComplete?: () => void;
    onCancel?: () => void;
    loading?: boolean;
}) {
    const statusColor: Record<string, string> = {
        pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        accepted: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        confirmed: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
        "in-progress": "bg-purple-500/10 text-purple-500 border-purple-500/20",
        completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    const statusLabel: Record<string, string> = {
        pending: "Waiting for driver",
        accepted: "Driver accepted — pay to confirm!",
        confirmed: "Paid · Ride confirmed",
        "in-progress": "In progress",
        completed: "Completed",
        cancelled: "Cancelled",
    };

    return (
        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-4 space-y-3">
            {/* Route */}
            <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    <div className="h-8 w-0.5 bg-gradient-to-b from-emerald-500 to-red-500" />
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{req.pickup}</p>
                    <p className="text-xs text-muted-foreground mb-2">{req.distance} km</p>
                    <p className="text-sm font-semibold truncate">{req.dropoff}</p>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-emerald-500">{(req.fare * req.seats).toFixed(2)} ALGO</p>
                    <p className="text-xs text-muted-foreground">{req.seats} seat{req.seats > 1 ? "s" : ""} · {req.fare} each</p>
                </div>
            </div>

            {/* Details row */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {req.departureTime} · {req.departureDate}</span>
                <span>{isDriver ? `👤 ${req.riderName}` : req.driverName ? `🚗 ${req.driverName}` : "⏳ Finding driver..."}</span>
            </div>

            {/* Driver info (shown to rider when accepted) */}
            {!isDriver && req.driverName && req.carModel && (
                <div className="rounded-xl bg-muted/50 px-3 py-2 flex items-center gap-2 text-xs">
                    <span className="text-base">{req.carType === "suv" ? "🚙" : req.carType === "auto" ? "🛺" : req.carType === "bike" ? "🏍️" : "🚘"}</span>
                    <span className="font-semibold">{req.carModel}</span>
                    <span className="text-muted-foreground">· {req.carColor}</span>
                    <span className="font-mono text-muted-foreground ml-auto">{req.licensePlate}</span>
                </div>
            )}

            {/* Status + Actions */}
            <div className="flex items-center justify-between gap-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor[req.status] ?? ""}`}>
                    {statusLabel[req.status] ?? req.status}
                </span>
                <div className="flex gap-2">
                    {isDriver && onAccept && (
                        <Button size="sm" onClick={onAccept} disabled={loading} className="rounded-full h-8 px-4 text-xs">
                            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                            Accept
                        </Button>
                    )}
                    {isDriver && onComplete && (
                        <Button size="sm" onClick={onComplete} disabled={loading} className="rounded-full h-8 px-4 text-xs bg-emerald-500 hover:bg-emerald-600">
                            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                            Complete
                        </Button>
                    )}
                    {!isDriver && onPay && (
                        <Button size="sm" onClick={onPay} disabled={loading} className="rounded-full h-8 px-4 text-xs bg-indigo-500 hover:bg-indigo-600 text-white">
                            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                            Pay & Confirm
                        </Button>
                    )}
                    {onCancel && (
                        <Button size="sm" variant="outline" onClick={onCancel} disabled={loading} className="rounded-full h-8 px-3 text-xs text-red-500 border-red-500/30 hover:bg-red-500/10">
                            Cancel
                        </Button>
                    )}
                </div>
            </div>

            {/* Tx link */}
            {req.txId && (
                <a href={`https://testnet.explorer.perawallet.app/tx/${req.txId}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                    <ExternalLink className="h-3 w-3" /> View on Explorer
                </a>
            )}
        </div>
    );
}

// ==================== EMPTY STATE ====================
function EmptyState({ icon: Icon, title, description, buttonLabel, onAction }: {
    icon: any; title: string; description: string; buttonLabel?: string; onAction?: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-20">
            <Icon className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground/60 mt-1 mb-6">{description}</p>
            {buttonLabel && onAction && (
                <Button onClick={onAction} className="rounded-full"><Plus className="mr-2 h-4 w-4" />{buttonLabel}</Button>
            )}
        </div>
    );
}

// ==================== PROFILE VIEW ====================
function ProfileView({ onSignOut, onEditVehicle, extraStats }: {
    onSignOut: () => void;
    onEditVehicle?: () => void;
    extraStats: { label: string; value: string | number }[];
}) {
    const { user, profile } = useAuth();
    const { walletAddress, displayAddress, balance, isConnected, connect, disconnect, connecting } = useWallet();
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Profile</h1>
            <div className="rounded-3xl border border-border bg-card/50 backdrop-blur p-8 mb-6">
                <div className="flex items-center gap-5">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="" className="h-20 w-20 rounded-2xl object-cover shadow-lg" />
                    ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted"><User className="h-10 w-10 text-muted-foreground" /></div>
                    )}
                    <div>
                        <h2 className="text-2xl font-bold">{profile?.displayName || user?.displayName || "Guest"}</h2>
                        <p className="text-muted-foreground">{profile?.email || user?.email || "No email"}</p>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary capitalize">{profile?.role || "explorer"}</span>
                            <span className="flex items-center gap-1 text-sm text-amber-500"><Star className="h-3.5 w-3.5 fill-current" />{profile?.rating?.toFixed(1) || "5.0"}</span>
                            {profile?.ratingCount ? <span className="text-xs text-muted-foreground">({profile.ratingCount} reviews)</span> : null}
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
                {extraStats.map(stat => (
                    <div key={stat.label} className="rounded-2xl border border-border bg-card/50 p-5 text-center">
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>
            {profile?.driverDetails && (
                <div className="rounded-2xl border border-border bg-card/50 p-5 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-muted-foreground">Vehicle</p>
                        {onEditVehicle && <button onClick={onEditVehicle} className="text-xs text-primary hover:underline">Edit</button>}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{profile.driverDetails.carType === "suv" ? "🚙" : profile.driverDetails.carType === "auto" ? "🛺" : profile.driverDetails.carType === "bike" ? "🏍️" : "🚘"}</span>
                        <div>
                            <p className="font-semibold">{profile.driverDetails.carModel} · {profile.driverDetails.carColor}</p>
                            <p className="text-xs text-muted-foreground font-mono">{profile.driverDetails.licensePlate}</p>
                        </div>
                    </div>
                </div>
            )}
            <div className="rounded-2xl border border-border bg-card/50 p-5 mb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">Algorand Wallet</p>
                        {isConnected ? (
                            <>
                                <p className="text-3xl font-bold mt-1">{balance.toFixed(2)} <span className="text-lg font-normal text-muted-foreground">ALGO</span></p>
                                <p className="text-xs text-muted-foreground mt-1 font-mono">{walletAddress}</p>
                            </>
                        ) : (
                            <p className="text-lg font-semibold mt-1 text-muted-foreground">Not connected</p>
                        )}
                    </div>
                    {isConnected ? (
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                                <Wallet className="h-8 w-8 text-emerald-500/30" />
                            </div>
                            <button onClick={disconnect} className="text-xs text-red-500 hover:text-red-400 hover:underline">Disconnect</button>
                        </div>
                    ) : (
                        <Button onClick={connect} disabled={connecting} size="sm" className="rounded-full">
                            <Wallet className="mr-2 h-4 w-4" />
                            {connecting ? "Connecting..." : "Connect"}
                        </Button>
                    )}
                </div>
            </div>
            <div className="rounded-2xl border border-border bg-card/50 p-5 mb-6">
                <p className="text-sm text-muted-foreground mb-2">Smart Contract</p>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">App ID</span>
                        <span className="text-sm font-mono font-semibold">{APP_ID}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Network</span>
                        <span className="text-sm font-semibold">Algorand Testnet</span>
                    </div>
                    <a href={getAppExplorerUrl()} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline mt-2">
                        View Contract on Explorer <ExternalLink className="h-3 w-3" />
                    </a>
                </div>
            </div>            <Button variant="outline" onClick={onSignOut} className="w-full h-12 rounded-xl text-base">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
        </div>
    );
}