"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Clock, Users, Car, Loader2, ChevronDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { postRide, calculateFare, getEstimatedDistance, POPULAR_LOCATIONS, type DriverDetails } from "@/lib/firebase";
import { createRideOnChain, parseBlockchainError } from "@/lib/algorand";

const CAR_TYPES = [
    { value: "hatchback", label: "Hatchback", emoji: "🚗", seats: 3 },
    { value: "sedan", label: "Sedan", emoji: "🚘", seats: 4 },
    { value: "suv", label: "SUV", emoji: "🚙", seats: 6 },
    { value: "auto", label: "Auto", emoji: "🛺", seats: 3 },
    { value: "bike", label: "Bike", emoji: "🏍️", seats: 1 },
];

export default function PostRideModal({ open, onClose, onPosted }: {
    open: boolean; onClose: () => void; onPosted: () => void;
}) {
    const { user, profile } = useAuth();
    const { walletAddress, isConnected } = useWallet();
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [seats, setSeats] = useState("3");
    const [departureTime, setDepartureTime] = useState("");
    const [departureDate, setDepartureDate] = useState(new Date().toISOString().split("T")[0]);
    const [posting, setPosting] = useState(false);
    const [showOriginDropdown, setShowOriginDropdown] = useState(false);
    const [showDestDropdown, setShowDestDropdown] = useState(false);
    const [originSearch, setOriginSearch] = useState("");
    const [destSearch, setDestSearch] = useState("");

    const distance = origin && destination ? getEstimatedDistance(origin, destination) : 0;
    const fare = distance > 0 ? calculateFare(distance) : null;
    const dd = profile?.driverDetails;

    const filteredOrigins = POPULAR_LOCATIONS.filter(l =>
        l.name.toLowerCase().includes(originSearch.toLowerCase())
    );
    const filteredDests = POPULAR_LOCATIONS.filter(l =>
        l.name.toLowerCase().includes(destSearch.toLowerCase()) && l.name !== origin
    );

    const handlePost = async () => {
        if (!origin || !destination || !departureTime || !fare) {
            alert("Please fill all fields"); return;
        }
        if (!dd?.carModel) {
            alert("Please set up your driver profile with car details first"); return;
        }
        
        // CRITICAL: Verify wallet is connected
        if (!isConnected || !walletAddress) {
            alert("❌ Please connect your Pera Wallet first to post rides!");
            return;
        }
        
        setPosting(true);
        try {
            // Step 1: Create ride on blockchain FIRST
            console.log("🔗 Creating ride on Algorand blockchain...");
            const { txId, rideId } = await createRideOnChain(
                walletAddress,
                fare.total,
                parseInt(seats)
            );
            console.log("✅ Blockchain ride created! TxID:", txId, "RideID:", rideId);
            
            // Step 2: Save to Firestore WITH onChainId
            console.log("💾 Saving ride to Firestore...");
            await postRide({
                driverId: user?.uid || "",
                driverName: profile?.displayName || user?.displayName || "Driver",
                driverPhoto: profile?.photoURL || user?.photoURL || "",
                driverWallet: walletAddress,
                carModel: dd.carModel, carColor: dd.carColor,
                licensePlate: dd.licensePlate, carType: dd.carType,
                driverRating: profile?.rating || 5.0,
                driverTotalRides: profile?.totalRides || 0,
                origin, destination, distance,
                baseFare: fare.baseFare, price: fare.total,
                seats: parseInt(seats), seatsAvailable: parseInt(seats),
                departureTime, departureDate,
                status: "open", passengers: [],
                passengerNames: [], passengerPhotos: [],
                onChainId: rideId,  // CRITICAL: Store blockchain ride ID
                txId: txId,
            });
            
            console.log("✅ Ride posted successfully!");
            alert(`🎉 Ride posted successfully!\n\nBlockchain TxID: ${txId}\nRide ID: ${rideId}`);
            
            // Reset form
            setOrigin(""); setDestination(""); setSeats("3"); setDepartureTime("");
            onPosted(); onClose();
        } catch (err: any) {
            console.error("❌ Failed to post ride:", err);
            
            const errorMsg = parseBlockchainError(err);
            alert(`❌ Failed to post ride: ${errorMsg}`);
        }
        finally { setPosting(false); }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 z-[70] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-background p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-xl font-bold">Post a Ride</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">Set route & auto-calculated fare</p>
                            </div>
                            <button onClick={onClose} className="rounded-full p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
                        </div>

                        {/* Route Selection */}
                        <div className="relative mb-3">
                            <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-gradient-to-b from-emerald-500 to-red-500 rounded-full" />
                            <div className="space-y-2 pl-8">
                                {/* Origin */}
                                <div className="relative">
                                    <div className="absolute -left-6 top-3 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pickup</label>
                                    <input type="text" value={origin || originSearch}
                                        onChange={(e) => { setOriginSearch(e.target.value); setOrigin(""); setShowOriginDropdown(true); }}
                                        onFocus={() => setShowOriginDropdown(true)}
                                        placeholder="Select pickup location"
                                        className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                                    {showOriginDropdown && (
                                        <div className="absolute z-50 mt-1 w-full max-h-40 overflow-y-auto rounded-xl border border-border bg-background shadow-xl">
                                            {filteredOrigins.map(loc => (
                                                <button key={loc.name} onClick={() => { setOrigin(loc.name); setOriginSearch(""); setShowOriginDropdown(false); }}
                                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left">
                                                    <MapPin className="h-3 w-3 text-emerald-500 shrink-0" />
                                                    <span>{loc.name}</span>
                                                    <span className="text-xs text-muted-foreground ml-auto">{loc.area}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* Destination */}
                                <div className="relative">
                                    <div className="absolute -left-6 top-3 h-3 w-3 rounded-full bg-red-500 ring-4 ring-red-500/20" />
                                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Drop-off</label>
                                    <input type="text" value={destination || destSearch}
                                        onChange={(e) => { setDestSearch(e.target.value); setDestination(""); setShowDestDropdown(true); }}
                                        onFocus={() => setShowDestDropdown(true)}
                                        placeholder="Select drop-off location"
                                        className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30" />
                                    {showDestDropdown && (
                                        <div className="absolute z-50 mt-1 w-full max-h-40 overflow-y-auto rounded-xl border border-border bg-background shadow-xl">
                                            {filteredDests.map(loc => (
                                                <button key={loc.name} onClick={() => { setDestination(loc.name); setDestSearch(""); setShowDestDropdown(false); }}
                                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left">
                                                    <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                                                    <span>{loc.name}</span>
                                                    <span className="text-xs text-muted-foreground ml-auto">{loc.area}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Fare Breakdown */}
                        {fare && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase">Fare Estimate</span>
                                    <span className="text-xs text-muted-foreground">{distance} km</span>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between"><span className="text-muted-foreground">Base fare</span><span>{fare.baseFare} ALGO</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Distance ({distance} km × 0.12)</span><span>{fare.distanceFare} ALGO</span></div>
                                    <div className="flex justify-between font-bold text-base pt-1 border-t border-border mt-1">
                                        <span>Total per seat</span>
                                        <span className="text-emerald-500">{fare.total} ALGO</span>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                                    💡 <strong>One-time blockchain fee:</strong> ~0.03 ALGO will be sent to the smart contract for on-chain storage.
                                </div>
                            </motion.div>
                        )}

                        {/* Time & Seats */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div>
                                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Date</label>
                                <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)}
                                    className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                            <div>
                                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Time</label>
                                <input type="time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)}
                                    className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                            <div>
                                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Seats</label>
                                <select value={seats} onChange={(e) => setSeats(e.target.value)}
                                    className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} seat{n > 1 ? "s" : ""}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Car Info */}
                        {dd && (
                            <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 mb-4 flex items-center gap-3">
                                <span className="text-2xl">{CAR_TYPES.find(c => c.value === dd.carType)?.emoji || "🚗"}</span>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold">{dd.carModel} · <span className="text-muted-foreground">{dd.carColor}</span></p>
                                    <p className="text-xs text-muted-foreground">{dd.licensePlate}</p>
                                </div>
                            </div>
                        )}

                        <Button onClick={handlePost} disabled={posting || !origin || !destination || !departureTime}
                            className="w-full h-12 rounded-xl text-base font-semibold">
                            {posting ? <Loader2 className="h-5 w-5 animate-spin" /> :
                                <><Zap className="mr-2 h-4 w-4" /> Post Ride {fare ? `· ${fare.total} ALGO/seat` : ""}</>}
                        </Button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
