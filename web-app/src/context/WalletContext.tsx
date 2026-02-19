"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import {
    connectPeraWallet,
    disconnectPeraWallet,
    reconnectPeraWallet,
    getAccountBalance,
    shortenAddress,
    setupPeraWalletListeners,
} from "@/lib/algorand";
import { useAuth } from "@/context/AuthContext";
import { updateWalletAddress } from "@/lib/firebase";

interface WalletContextType {
    /** Connected wallet address (null if not connected) */
    walletAddress: string | null;
    /** Shortened display version of the address */
    displayAddress: string;
    /** ALGO balance of the connected wallet */
    balance: number;
    /** Whether wallet is currently connecting */
    connecting: boolean;
    /** Whether wallet context is still initializing */
    initializing: boolean;
    /** Whether wallet is connected */
    isConnected: boolean;
    /** Connect Pera Wallet */
    connect: () => Promise<void>;
    /** Disconnect Pera Wallet */
    disconnect: () => Promise<void>;
    /** Refresh balance */
    refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
    walletAddress: null,
    displayAddress: "",
    balance: 0,
    connecting: false,
    initializing: true,
    isConnected: false,
    connect: async () => { },
    disconnect: async () => { },
    refreshBalance: async () => { },
});

export function WalletProvider({ children }: { children: ReactNode }) {
    const { user, profile, loading: authLoading, refreshProfile } = useAuth();
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [balance, setBalance] = useState(0);
    const [connecting, setConnecting] = useState(false);
    const [initializing, setInitializing] = useState(true);

    const disconnect = useCallback(async () => {
        try {
            await disconnectPeraWallet();
        } catch {
            // ignore
        }
        setWalletAddress(null);
        setBalance(0);
    }, []);

    const refreshBalance = useCallback(async () => {
        if (walletAddress) {
            const bal = await getAccountBalance(walletAddress);
            setBalance(bal);
        }
    }, [walletAddress]);

    // 1. Reconnection Logic: Validate Session against Profile
    useEffect(() => {
        let mounted = true;
        
        const tryReconnect = async () => {
            if (authLoading) return;

            // Setup listeners (for disconnect from Pera app side)
            setupPeraWalletListeners(() => {
                if (mounted) {
                    setWalletAddress(null);
                    setBalance(0);
                }
            });

            // If logged out, clear local state but keep Pera session for faster reconnect
            if (!user) {
                if (mounted) {
                    setWalletAddress(null);
                    setBalance(0);
                }
                return;
            }

            // User is logged in - check multiple sources for wallet connection
            try {
                // First: Try reconnecting existing Pera session from localStorage
                const accounts = await reconnectPeraWallet();
                
                if (accounts && accounts.length > 0 && mounted) {
                    const peraAddr = accounts[0];
                    const profileAddr = profile?.walletAddress;

                    // Security: Disconnect only if user has a DIFFERENT wallet linked
                    if (profileAddr && profileAddr !== peraAddr) {
                        console.warn("Wallet mismatch detected. Clearing session for security.");
                        await disconnect();
                        return;
                    }

                    // Valid connection - restore silently
                    console.log("✓ Wallet session restored from Pera:", shortenAddress(peraAddr));
                    setWalletAddress(peraAddr);
                    const bal = await getAccountBalance(peraAddr);
                    if (mounted) setBalance(bal);
                    return; // Successfully reconnected
                }
                
                // Second: If Pera session doesn't exist but profile has a wallet, restore from profile
                if (profile?.walletAddress && mounted) {
                    console.log("✓ Restoring wallet from profile:", shortenAddress(profile.walletAddress));
                    setWalletAddress(profile.walletAddress);
                    const bal = await getAccountBalance(profile.walletAddress);
                    if (mounted) setBalance(bal);
                    return;
                }
                
                // No wallet found anywhere - user needs to connect manually
                console.log("No wallet connected - user can connect manually");
                
            } catch (err) {
                // If profile has wallet but Pera session failed, still show the profile wallet
                if (profile?.walletAddress && mounted) {
                    console.log("✓ Fallback: Using wallet from profile:", shortenAddress(profile.walletAddress));
                    setWalletAddress(profile.walletAddress);
                    try {
                        const bal = await getAccountBalance(profile.walletAddress);
                        if (mounted) setBalance(bal);
                    } catch (balErr) {
                        console.warn("Could not fetch balance:", balErr);
                    }
                }
            } finally {
                // Mark initialization complete
                if (mounted) {
                    setInitializing(false);
                }
            }
        };
        
        tryReconnect();
        
        return () => {
            mounted = false;
        };
    }, [user, authLoading, profile?.walletAddress, disconnect]);

    // 2. Auto-Link: If connected and user has no wallet (or different), save it.
    useEffect(() => {
        let mounted = true;
        
        if (user && walletAddress && profile) {
            // Only update if it's actually different/new
            if (profile.walletAddress !== walletAddress) {
                updateWalletAddress(user.uid, walletAddress)
                    .then(() => {
                        if (mounted) {
                            console.log("✓ Wallet linked to profile:", shortenAddress(walletAddress));
                            refreshProfile();
                        }
                    })
                    .catch(err => console.error("Failed to link wallet:", err));
            }
        }
        
        return () => {
            mounted = false;
        };
    }, [user, walletAddress, profile, refreshProfile]);

    const connect = useCallback(async () => {
        setConnecting(true);
        try {
            const accounts = await connectPeraWallet();

            // Re-bind listeners just in case
            setupPeraWalletListeners(() => {
                setWalletAddress(null);
                setBalance(0);
            });

            if (accounts && accounts.length > 0) {
                const newAddr = accounts[0];
                console.log("Connected new wallet:", newAddr);
                setWalletAddress(newAddr);
                const bal = await getAccountBalance(newAddr);
                setBalance(bal);

                // If user is logged in, link immediately
                if (user) {
                    await updateWalletAddress(user.uid, newAddr);
                    refreshProfile();
                }
            } else {
                console.warn("Connect resolved but no accounts returned");
            }
        } catch (error: any) {
            if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
                console.error("Failed to connect wallet:", error);
                alert("Connection failed. Please try again.");
            }
        } finally {
            setConnecting(false);
        }
    }, [user, refreshProfile]);

    const displayAddress = walletAddress ? shortenAddress(walletAddress) : "";
    const isConnected = !!walletAddress;

    return (
        <WalletContext.Provider
            value={{
                walletAddress,
                displayAddress,
                balance,
                connecting,
                initializing,
                isConnected,
                connect,
                disconnect,
                refreshBalance,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    return useContext(WalletContext);
}
