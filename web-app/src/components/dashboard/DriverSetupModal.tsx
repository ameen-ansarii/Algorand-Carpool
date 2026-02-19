"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Car, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateDriverDetails, type DriverDetails } from "@/lib/firebase";

const CAR_TYPES = [
    { value: "hatchback", label: "Hatchback", emoji: "🚗" },
    { value: "sedan", label: "Sedan", emoji: "🚘" },
    { value: "suv", label: "SUV", emoji: "🚙" },
    { value: "auto", label: "Auto", emoji: "🛺" },
    { value: "bike", label: "Bike", emoji: "🏍️" },
];

export default function DriverSetupModal({ open, onClose, uid, existing, onSaved }: {
    open: boolean; onClose: () => void; uid: string;
    existing?: DriverDetails; onSaved: () => void;
}) {
    const [carModel, setCarModel] = useState(existing?.carModel || "");
    const [carColor, setCarColor] = useState(existing?.carColor || "");
    const [licensePlate, setLicensePlate] = useState(existing?.licensePlate || "");
    const [carType, setCarType] = useState<string>(existing?.carType || "sedan");
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!carModel || !carColor || !licensePlate) { alert("Please fill all fields"); return; }
        setSaving(true);
        try {
            await updateDriverDetails(uid, {
                carModel, carColor, licensePlate,
                carType: carType as DriverDetails["carType"],
            });
            onSaved(); onClose();
        } catch (err) { console.error(err); alert("Failed to save"); }
        finally { setSaving(false); }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 z-[70] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-background p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-xl font-bold">Vehicle Details</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">Required to start driving</p>
                            </div>
                            <button onClick={onClose} className="rounded-full p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
                        </div>

                        {/* Car Type Selection */}
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Vehicle Type</label>
                        <div className="grid grid-cols-5 gap-2 mb-4">
                            {CAR_TYPES.map(ct => (
                                <button key={ct.value} onClick={() => setCarType(ct.value)}
                                    className={`flex flex-col items-center gap-1 rounded-xl p-3 border transition-all ${carType === ct.value
                                        ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                                        : "border-border hover:bg-muted"}`}>
                                    <span className="text-2xl">{ct.emoji}</span>
                                    <span className="text-[10px] font-medium">{ct.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Car Model</label>
                                <input type="text" value={carModel} onChange={(e) => setCarModel(e.target.value)}
                                    placeholder="e.g., Maruti Swift, Honda City"
                                    className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                            <div>
                                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Car Color</label>
                                <input type="text" value={carColor} onChange={(e) => setCarColor(e.target.value)}
                                    placeholder="e.g., White, Silver, Black"
                                    className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                            <div>
                                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">License Plate</label>
                                <input type="text" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                                    placeholder="e.g., KA 01 AB 1234"
                                    className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                        </div>

                        <Button onClick={handleSave} disabled={saving || !carModel || !carColor || !licensePlate}
                            className="w-full h-12 rounded-xl text-base font-semibold mt-5">
                            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> :
                                <><CheckCircle className="mr-2 h-4 w-4" /> Save Vehicle Details</>}
                        </Button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
