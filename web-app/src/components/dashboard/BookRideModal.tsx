"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Clock, Users, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import {
    postRideRequest, calculateFare, getEstimatedDistance,
    POPULAR_LOCATIONS,
} from "@/lib/firebase";

export default function BookRideModal({
    open,
    onClose,
    onBooked,
}: {
    open: boolean;
    onClose: () => void;
    onBooked: () => void;
}) {
    const { user, profile } = useAuth();
    const { walletAddress, isConnected } = useWallet();

    const [pickup, setPickup] = useState("");
    const [dropoff, setDropoff] = useState("");
    const [seats, setSeats] = useState("1");
    const [departureTime, setDepartureTime] = useState("");
    const [departureDate, setDepartureDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [booking, setBooking] = useState(false);

    const [showPickupDropdown, setShowPickupDropdown] = useState(false);
    const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);
    const [pickupSearch, setPickupSearch] = useState("");
    const [dropoffSearch, setDropoffSearch] = useState("");

    const distance = pickup && dropoff ? getEstimatedDistance(pickup, dropoff) : 0;
    const fare = distance > 0 ? calculateFare(distance) : null;

    const filteredPickups = POPULAR_LOCATIONS.filter((l) =>
        l.name.toLowerCase().includes(pickupSearch.toLowerCase())
    );
    const filteredDropoffs = POPULAR_LOCATIONS.filter(
        (l) =>
            l.name.toLowerCase().includes(dropoffSearch.toLowerCase()) &&
            l.name !== pickup
    );

    const handleBook = async () => {
        if (!pickup || !dropoff || !departureTime || !fare) {
            alert("Please fill in all fields");
            return;
        }
        if (!isConnected || !walletAddress) {
            alert("❌ Please connect your Pera Wallet first!");
            return;
        }

        setBooking(true);
        try {
            await postRideRequest({
                riderId: user?.uid || "",
                riderName:
                    profile?.displayName || user?.displayName || "Rider",
                riderPhoto:
                    profile?.photoURL ||
                    user?.photoURL ||
                    `https://ui-avatars.com/api/?name=R&background=random`,
                riderWallet: walletAddress,
                pickup,
                dropoff,
                distance,
                baseFare: fare.baseFare,
                fare: fare.total,
                seats: parseInt(seats),
                departureTime,
                departureDate,
                status: "pending",
            });

            // Reset form
            setPickup("");
            setDropoff("");
            setSeats("1");
            setDepartureTime("");
            setPickupSearch("");
            setDropoffSearch("");

            onBooked();
            onClose();
        } catch (err: any) {
            console.error("❌ Failed to book ride:", err);
            alert(`❌ Failed to book ride: ${err.message}`);
        } finally {
            setBooking(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 z-[70] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-background p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-xl font-bold">Book a Ride</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Set your route — drivers will see your request
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-full p-2 hover:bg-muted"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Route Selection */}
                        <div className="relative mb-3">
                            <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-gradient-to-b from-emerald-500 to-red-500 rounded-full" />
                            <div className="space-y-2 pl-8">
                                {/* Pickup */}
                                <div className="relative">
                                    <div className="absolute -left-6 top-3 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                        Pickup
                                    </label>
                                    <input
                                        type="text"
                                        value={pickup || pickupSearch}
                                        onChange={(e) => {
                                            setPickupSearch(e.target.value);
                                            setPickup("");
                                            setShowPickupDropdown(true);
                                        }}
                                        onFocus={() => setShowPickupDropdown(true)}
                                        placeholder="Where are you?"
                                        className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                    />
                                    {showPickupDropdown && filteredPickups.length > 0 && (
                                        <div className="absolute z-50 mt-1 w-full max-h-40 overflow-y-auto rounded-xl border border-border bg-background shadow-xl">
                                            {filteredPickups.map((loc) => (
                                                <button
                                                    key={loc.name}
                                                    onClick={() => {
                                                        setPickup(loc.name);
                                                        setPickupSearch("");
                                                        setShowPickupDropdown(false);
                                                    }}
                                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                                                >
                                                    <MapPin className="h-3 w-3 text-emerald-500 shrink-0" />
                                                    <span>{loc.name}</span>
                                                    <span className="text-xs text-muted-foreground ml-auto">
                                                        {loc.area}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Dropoff */}
                                <div className="relative">
                                    <div className="absolute -left-6 top-3 h-3 w-3 rounded-full bg-red-500 ring-4 ring-red-500/20" />
                                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                        Drop-off
                                    </label>
                                    <input
                                        type="text"
                                        value={dropoff || dropoffSearch}
                                        onChange={(e) => {
                                            setDropoffSearch(e.target.value);
                                            setDropoff("");
                                            setShowDropoffDropdown(true);
                                        }}
                                        onFocus={() => setShowDropoffDropdown(true)}
                                        placeholder="Where to?"
                                        className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
                                    />
                                    {showDropoffDropdown && filteredDropoffs.length > 0 && (
                                        <div className="absolute z-50 mt-1 w-full max-h-40 overflow-y-auto rounded-xl border border-border bg-background shadow-xl">
                                            {filteredDropoffs.map((loc) => (
                                                <button
                                                    key={loc.name}
                                                    onClick={() => {
                                                        setDropoff(loc.name);
                                                        setDropoffSearch("");
                                                        setShowDropoffDropdown(false);
                                                    }}
                                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                                                >
                                                    <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                                                    <span>{loc.name}</span>
                                                    <span className="text-xs text-muted-foreground ml-auto">
                                                        {loc.area}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Fare Estimate */}
                        {fare && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 mb-4"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                                        Fare Estimate
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {distance} km
                                    </span>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Base fare</span>
                                        <span>{fare.baseFare} ALGO</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Distance ({distance} km × 0.12)
                                        </span>
                                        <span>{fare.distanceFare} ALGO</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-base pt-1 border-t border-border mt-1">
                                        <span>Total per seat</span>
                                        <span className="text-emerald-500">{fare.total} ALGO</span>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                                    💡 <strong>Payment is held in escrow</strong> and released to the
                                    driver only after your ride completes.
                                </div>
                            </motion.div>
                        )}

                        {/* Date, Time, Seats */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div>
                                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={departureDate}
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => setDepartureDate(e.target.value)}
                                    className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                    Time
                                </label>
                                <input
                                    type="time"
                                    value={departureTime}
                                    onChange={(e) => setDepartureTime(e.target.value)}
                                    className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                    Seats
                                </label>
                                <div className="relative">
                                    <select
                                        value={seats}
                                        onChange={(e) => setSeats(e.target.value)}
                                        className="w-full appearance-none rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    >
                                        {[1, 2, 3, 4].map((n) => (
                                            <option key={n} value={n}>
                                                {n} seat{n > 1 ? "s" : ""}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                        </div>

                        {/* Info Banner */}
                        <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 mb-5 text-xs text-blue-600 dark:text-blue-400">
                            🚗 <strong>How it works:</strong> Your request will be visible to nearby
                            drivers. Once a driver accepts, you&apos;ll be notified and can confirm
                            payment via your Pera Wallet.
                        </div>

                        {/* Submit */}
                        <Button
                            onClick={handleBook}
                            disabled={booking || !pickup || !dropoff || !departureTime}
                            className="w-full h-12 rounded-xl text-base font-bold"
                        >
                            {booking ? (
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            ) : null}
                            {booking ? "Posting Request..." : "Request a Ride"}
                        </Button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
