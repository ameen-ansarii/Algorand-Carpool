"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, Users, Star, Car, Loader2, Navigation, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Ride } from "@/lib/firebase";

const CAR_EMOJIS: Record<string, string> = {
    hatchback: "🚗", sedan: "🚘", suv: "🚙", auto: "🛺", bike: "🏍️",
};

export function RideCard({ ride, isOwner, onJoin, onCancel, onComplete, onTrack, onConnectWallet, joining, actionLoading, walletConnected }: {
    ride: Ride; isOwner?: boolean;
    onJoin?: () => void; onCancel?: () => void;
    onComplete?: () => void; onTrack?: () => void;
    onConnectWallet?: () => void;
    joining?: boolean; actionLoading?: boolean;
    walletConnected?: boolean;
}) {
    const statusColors: Record<string, string> = {
        open: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        "in-progress": "bg-amber-500/10 text-amber-500 border-amber-500/20",
        arriving: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        ongoing: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        completed: "bg-emerald-600/10 text-emerald-600 border-emerald-600/20",
        cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    };

    const isActive = ride.status === "in-progress" || ride.status === "arriving" || ride.status === "ongoing";

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border bg-card/50 backdrop-blur p-4 transition-all hover:shadow-lg ${isActive ? "border-emerald-500/30 ring-1 ring-emerald-500/10" : "border-border"}`}>

            {/* Header: Driver info + Status */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    {ride.driverPhoto ? (
                        <img src={ride.driverPhoto} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/10" />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
                            {ride.driverName.charAt(0)}
                        </div>
                    )}
                    <div>
                        <p className="font-semibold text-sm">{ride.driverName}</p>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-medium">{(ride.driverRating || 5.0).toFixed(1)}</span>
                            </div>
                            {ride.driverTotalRides !== undefined && (
                                <span className="text-xs text-muted-foreground">· {ride.driverTotalRides} rides</span>
                            )}
                        </div>
                    </div>
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusColors[ride.status] || ""}`}>
                    {ride.status === "in-progress" ? "Booked" : ride.status}
                </span>
            </div>

            {/* Route */}
            <div className="flex items-start gap-2.5 mb-3">
                <div className="flex flex-col items-center gap-0.5 mt-1">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <div className="w-0.5 h-5 bg-gradient-to-b from-emerald-500 to-red-500 rounded-full" />
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                </div>
                <div className="flex-1 space-y-1.5">
                    <p className="text-sm font-medium leading-none">{ride.origin}</p>
                    <p className="text-sm font-medium leading-none">{ride.destination}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-emerald-500">{ride.price} <span className="text-xs font-normal text-muted-foreground">ALGO</span></p>
                    {ride.distance > 0 && <p className="text-[10px] text-muted-foreground">{ride.distance} km</p>}
                </div>
            </div>

            {/* Car + Time + Seats */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                {ride.carModel && (
                    <div className="flex items-center gap-1">
                        <span>{CAR_EMOJIS[ride.carType || "sedan"] || "🚗"}</span>
                        <span>{ride.carModel}</span>
                        {ride.carColor && <span>· {ride.carColor}</span>}
                    </div>
                )}
                {ride.licensePlate && (
                    <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">{ride.licensePlate}</span>
                )}
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{ride.departureTime}{ride.departureDate ? ` · ${ride.departureDate}` : ""}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{ride.seatsAvailable}/{ride.seats} seats left</span>
                </div>
            </div>

            {/* Passenger Avatars */}
            {ride.passengerNames && ride.passengerNames.length > 0 && (
                <div className="flex items-center gap-1 mb-3">
                    <div className="flex -space-x-2">
                        {ride.passengerPhotos?.slice(0, 4).map((photo, i) => (
                            photo ? <img key={i} src={photo} alt="" className="h-6 w-6 rounded-full border-2 border-background object-cover" />
                                : <div key={i} className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px]">
                                    {ride.passengerNames?.[i]?.charAt(0)}
                                </div>
                        ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground ml-1">
                        {ride.passengerNames.map(n => n.split(" ")[0]).join(", ")}
                    </span>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
                {isOwner && ride.status === "open" && (
                    <Button variant="outline" size="sm" onClick={onCancel} disabled={actionLoading}
                        className="flex-1 rounded-xl text-xs h-9 border-red-500/20 text-red-500 hover:bg-red-500/10">
                        Cancel Ride
                    </Button>
                )}
                {isOwner && isActive && onTrack && (
                    <Button size="sm" onClick={onTrack} className="flex-1 rounded-xl text-xs h-9">
                        <Navigation className="mr-1 h-3 w-3" /> Track Ride
                    </Button>
                )}
                {!isOwner && ride.status === "open" && onCancel && (
                    <Button variant="outline" size="sm" onClick={onCancel} disabled={actionLoading}
                        className="flex-1 rounded-xl text-xs h-9 border-red-500/20 text-red-500 hover:bg-red-500/10">
                        {actionLoading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                        Cancel Booking (-0.1 ALGO)
                    </Button>
                )}
                {!isOwner && isActive && onTrack && (
                    <Button size="sm" onClick={onTrack} className="flex-1 rounded-xl text-xs h-9">
                        <Navigation className="mr-1 h-3 w-3" /> Track Ride
                    </Button>
                )}
                {!isOwner && ride.status === "open" && onJoin && (
                    walletConnected ? (
                        <Button size="sm" onClick={onJoin} disabled={joining}
                            className="flex-1 rounded-xl text-xs h-9 bg-emerald-600 hover:bg-emerald-700">
                            {joining ? <Loader2 className="h-3 w-3 animate-spin" /> :
                                <><Car className="mr-1 h-3 w-3" /> Book · {ride.price} ALGO</>}
                        </Button>
                    ) : (
                        <Button size="sm" onClick={onConnectWallet} variant="outline"
                            className="flex-1 rounded-xl text-xs h-9 border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
                            <Wallet className="mr-1 h-3 w-3" /> Connect Wallet to Book
                        </Button>
                    )
                )}
            </div>
        </motion.div>
    );
}
