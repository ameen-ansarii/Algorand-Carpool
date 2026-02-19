"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Car, User, Phone, MessageCircle, CheckCircle, Navigation, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { onRideUpdate, updateRideStatus, type Ride } from "@/lib/firebase";

const STATUS_STEPS = [
    { key: "open", label: "Ride Posted", icon: MapPin, description: "Waiting for riders" },
    { key: "in-progress", label: "Ride Booked", icon: User, description: "All seats filled" },
    { key: "arriving", label: "Driver Arriving", icon: Car, description: "On the way to pickup" },
    { key: "ongoing", label: "On the Road", icon: Navigation, description: "Ride in progress" },
    { key: "completed", label: "Arrived", icon: CheckCircle, description: "Ride completed!" },
];

function getStepIndex(status: string): number {
    const idx = STATUS_STEPS.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
}

export default function RideTracker({ rideId, isDriver, onComplete, onClose }: {
    rideId: string; isDriver: boolean;
    onComplete?: () => void; onClose: () => void;
}) {
    const [ride, setRide] = useState<Ride | null>(null);

    useEffect(() => {
        const unsub = onRideUpdate(rideId, setRide);
        return () => unsub();
    }, [rideId]);

    if (!ride) return null;

    const currentStep = getStepIndex(ride.status);
    const isCompleted = ride.status === "completed";
    const isCancelled = ride.status === "cancelled";

    const handleAdvanceStatus = async () => {
        const nextStatuses: Record<string, Ride["status"]> = {
            "in-progress": "arriving",
            "arriving": "ongoing",
            "ongoing": "completed",
        };
        const next = nextStatuses[ride.status];
        if (next) {
            await updateRideStatus(rideId, next);
            if (next === "completed" && onComplete) onComplete();
        }
    };

    const statusColors: Record<string, string> = {
        "open": "text-blue-500",
        "in-progress": "text-amber-500",
        "arriving": "text-purple-500",
        "ongoing": "text-emerald-500",
        "completed": "text-emerald-600",
        "cancelled": "text-red-500",
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-border bg-card/50 backdrop-blur p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold">
                        {isCompleted ? "Ride Completed! 🎉" : isCancelled ? "Ride Cancelled" : "Ride Tracker"}
                    </h3>
                    <p className={`text-sm font-medium ${statusColors[ride.status] || ""}`}>
                        {STATUS_STEPS.find(s => s.key === ride.status)?.description || ride.status}
                    </p>
                </div>
                <button onClick={onClose} className="rounded-full p-2 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>

            {/* Route */}
            <div className="flex items-center gap-3 mb-5 rounded-xl bg-muted/50 p-3">
                <div className="flex flex-col items-center gap-0.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <div className="w-0.5 h-6 bg-gradient-to-b from-emerald-500 to-red-500 rounded-full" />
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                </div>
                <div className="flex-1 space-y-2">
                    <div>
                        <p className="text-xs text-muted-foreground">PICKUP</p>
                        <p className="text-sm font-medium">{ride.origin}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">DROP-OFF</p>
                        <p className="text-sm font-medium">{ride.destination}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-emerald-500">{ride.price} ALGO</p>
                    <p className="text-xs text-muted-foreground">{ride.distance} km</p>
                </div>
            </div>

            {/* Progress Steps */}
            {!isCancelled && (
                <div className="flex items-center gap-1 mb-5">
                    {STATUS_STEPS.map((step, i) => {
                        const isActive = i <= currentStep;
                        const isCurrent = i === currentStep;
                        return (
                            <div key={step.key} className="flex-1 flex flex-col items-center gap-1">
                                <motion.div
                                    animate={{ scale: isCurrent ? [1, 1.15, 1] : 1 }}
                                    transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
                                    className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${isActive
                                        ? "bg-emerald-500 text-white"
                                        : "bg-muted text-muted-foreground"}`}>
                                    <step.icon className="h-4 w-4" />
                                </motion.div>
                                <span className={`text-[10px] text-center ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                                    {step.label}
                                </span>
                                {i < STATUS_STEPS.length - 1 && (
                                    <div className={`hidden`} /> // spacing only
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Passengers */}
            {ride.passengerNames && ride.passengerNames.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                        {isDriver ? "Your Riders" : "Fellow Riders"} ({ride.passengerNames.length}/{ride.seats})
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {ride.passengerNames.map((name, i) => (
                            <div key={i} className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
                                {ride.passengerPhotos?.[i] ? (
                                    <img src={ride.passengerPhotos[i]} alt="" className="h-5 w-5 rounded-full object-cover" />
                                ) : (
                                    <User className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="text-xs font-medium">{name.split(" ")[0]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Driver Action Button */}
            {isDriver && !isCompleted && !isCancelled && ride.status !== "open" && (
                <Button onClick={handleAdvanceStatus} className="w-full h-11 rounded-xl font-semibold">
                    {ride.status === "in-progress" && <><Car className="mr-2 h-4 w-4" /> Start Driving to Pickup</>}
                    {ride.status === "arriving" && <><Navigation className="mr-2 h-4 w-4" /> Picked Up — Start Ride</>}
                    {ride.status === "ongoing" && <><CheckCircle className="mr-2 h-4 w-4" /> Complete Ride & Get Paid</>}
                </Button>
            )}
        </motion.div>
    );
}
