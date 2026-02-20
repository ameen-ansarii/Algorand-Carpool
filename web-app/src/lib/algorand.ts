/**
 * Algorand Client — Frontend integration with the RideEscrow smart contract
 *
 * This module handles:
 * - Pera Wallet connection/disconnection
 * - Reading ride data from the smart contract
 * - Submitting transactions (create ride, join ride, complete, cancel)
 *
 * Uses algosdk v3 API and @perawallet/connect v1.5
 */

import algosdk from "algosdk";
import { sha512_256 } from "js-sha512";

// ==================== CONSTANTS ====================

// Deployed RideEscrow App ID on Algorand Testnet
export const APP_ID = 755794423;

// Algorand Testnet node
const ALGOD_SERVER = "https://testnet-api.algonode.cloud";
const ALGOD_PORT = 443;
const ALGOD_TOKEN = "";

// ==================== CLIENTS ====================

export const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

// ==================== PERA WALLET ====================

let peraWalletInstance: any = null;

export async function getPeraWallet() {
    if (peraWalletInstance) return peraWalletInstance;

    // Dynamic import to avoid SSR issues with Next.js
    const { PeraWalletConnect } = await import("@perawallet/connect");
    peraWalletInstance = new PeraWalletConnect({
        chainId: 416002,  // Algorand Testnet
        shouldShowSignTxnToast: true,
    });
    return peraWalletInstance;
}

export async function connectPeraWallet(): Promise<string[]> {
    const peraWallet = await getPeraWallet();
    try {
        const accounts = await peraWallet.connect();

        // Fallback: Check connector accounts if returns empty but resolved (happens sometimes)
        if ((!accounts || accounts.length === 0) && peraWallet.connector?.accounts?.length > 0) {
            return peraWallet.connector.accounts;
        }

        return accounts;
    } catch (error: any) {
        // If the user closes the modal, we get this error. 
        if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
            console.error("Pera Wallet connect error:", error);
        }
        throw error;
    }
}

export async function disconnectPeraWallet(): Promise<void> {
    const peraWallet = await getPeraWallet();
    await peraWallet.disconnect();
    // DON'T set instance to null - keep it for reconnection
    // peraWalletInstance = null;
}

export async function reconnectPeraWallet(): Promise<string[] | null> {
    const peraWallet = await getPeraWallet();
    try {
        const accounts = await peraWallet.reconnectSession();
        return accounts && accounts.length > 0 ? accounts : null;
    } catch {
        return null;
    }
}

/**
 * Check if Pera Wallet is properly connected and can sign
 */
export async function isPeraWalletConnected(): Promise<boolean> {
    const peraWallet = await getPeraWallet();
    return peraWallet.isConnected;
}

/**
 * Get currently connected accounts from Pera Wallet
 */
export async function getConnectedAccounts(): Promise<string[]> {
    const peraWallet = await getPeraWallet();
    return peraWallet.connector?.accounts || [];
}

export async function setupPeraWalletListeners(
    onDisconnect: () => void
): Promise<void> {
    const peraWallet = await getPeraWallet();
    if (peraWallet.connector) {
        peraWallet.connector.on("disconnect", onDisconnect);
    }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Parse user-friendly error messages from blockchain errors
 */
export function parseBlockchainError(error: any): string {
    const msg = error.message || error.toString();
    
    if (msg.includes("logic eval error")) {
        if (msg.includes("assert failed") && msg.includes("box_get")) {
            return "Ride not found on blockchain. The ride may have been deleted or doesn't exist.";
        }
        if (msg.includes("Ride not found")) {
            return "Ride not found on blockchain.";
        }
        if (msg.includes("Ride not active")) {
            return "This ride is no longer active.";
        }
        if (msg.includes("Ride is full")) {
            return "Sorry, this ride is already full.";
        }
        if (msg.includes("Wrong payment amount")) {
            return "Payment amount doesn't match the ride price.";
        }
        if (msg.includes("Only driver can complete")) {
            return "Only the driver can complete this ride.";
        }
        if (msg.includes("Only driver can cancel")) {
            return "Only the driver can cancel this ride.";
        }
        if (msg.includes("Not a passenger")) {
            return "You are not a passenger on this ride.";
        }
        if (msg.includes("insufficient")) {
            return "Insufficient ALGO balance. Please add funds to your wallet.";
        }
    }
    
    if (msg.includes("rejected") || msg.includes("cancelled")) {
        return "Transaction cancelled by user.";
    }
    
    if (msg.includes("overspend")) {
        return "Insufficient balance to complete this transaction.";
    }
    
    if (msg.includes("fee")) {
        return "Transaction fee error. Please try again.";
    }
    
    // Return original message if no match
    return msg;
}

/**
 * Get the application address from the App ID
 */
export function getAppAddress(): string {
    return algosdk.getApplicationAddress(BigInt(APP_ID)).toString();
}

/**
 * Get account balance in ALGO
 */
export async function getAccountBalance(address: string): Promise<number> {
    try {
        const accountInfo = await algodClient.accountInformation(address).do();
        const microAlgo = Number(accountInfo.amount ?? 0);
        return microAlgo / 1_000_000;
    } catch {
        return 0;
    }
}

/**
 * Sign and send transactions via Pera Wallet
 */
async function signAndSend(
    txnGroups: algosdk.Transaction[],
    signerAddress: string
): Promise<string> {
    const peraWallet = await getPeraWallet();

    // CRITICAL FIX: Check if wallet is actually connected before signing
    if (!peraWallet.isConnected || !peraWallet.connector) {
        console.log("🔄 Pera Wallet not connected, attempting to reconnect...");
        try {
            const accounts = await peraWallet.reconnectSession();
            if (!accounts || accounts.length === 0) {
                throw new Error("Please reconnect your wallet. Click 'Connect Wallet' and try again.");
            }
            console.log("✅ Wallet reconnected successfully!");
        } catch (error) {
            console.error("❌ Failed to reconnect wallet:", error);
            throw new Error("Wallet connection lost. Please disconnect and reconnect your wallet.");
        }
    }

    // Log connection state for debugging
    const connectedAccounts: string[] = peraWallet.connector?.accounts || [];
    console.log("📱 Pera Wallet state — isConnected:", peraWallet.isConnected, "accounts:", connectedAccounts);

    if (connectedAccounts.length > 0 && !connectedAccounts.includes(signerAddress)) {
        // Account mismatch → warn but still attempt (Pera app will reject if invalid)
        console.warn("⚠️ Signer address not in connector accounts. Proceeding anyway — Pera app will verify.");
    }

    // Group transactions if multiple
    if (txnGroups.length > 1) {
        algosdk.assignGroupID(txnGroups);
    }

    // Prepare for Pera signing
    const txnsToSign = txnGroups.map((txn) => ({
        txn,
        signers: [signerAddress],
    }));

    console.log("🔐 Sending signing request to Pera Wallet app on your phone...");
    console.log("📲 Please check your PERA WALLET app and tap Approve!");

    try {
        // signTransaction expects [[{txn, signers}]] — one group at a time
        const signedTxns = await peraWallet.signTransaction([txnsToSign]);
        console.log("✅ Transaction signed successfully!");

        // Flatten signed blobs (Pera may return nested arrays)
        const flat: Uint8Array[] = (signedTxns as any).flat ? (signedTxns as any).flat() : signedTxns;

        // Send to network
        console.log("📡 Submitting transaction to Algorand network...");
        await algodClient.sendRawTransaction(flat).do();

        const txId = txnGroups[0].txID();
        console.log("⏳ Waiting for confirmation... TxID:", txId);
        await algosdk.waitForConfirmation(algodClient, txId, 8);
        console.log("✅ Transaction confirmed on-chain!");

        return txId;
    } catch (error: any) {
        console.error("❌ Signing/send failed:", error);
        const msg: string = error?.message || String(error);
        if (
            msg.includes("rejected") ||
            msg.includes("cancelled") ||
            msg.includes("SIGN_TRANSACTIONS_CANCELLED") ||
            msg.includes("closed")
        ) {
            throw new Error("Transaction cancelled by user in Pera Wallet.");
        }
        throw error;
    }
}

// ==================== SMART CONTRACT INTERACTIONS ====================

/**
 * Compute ABI method selector (first 4 bytes of SHA-512/256 of the method signature).
 */
/**
 * Compute ABI method selector (first 4 bytes of SHA-512/256 of the method signature).
 */
function getMethodSelector(methodSignature: string): Uint8Array {
    // @ts-ignore
    const hash = sha512_256.array(methodSignature);
    return new Uint8Array(hash.slice(0, 4));
}

/**
 * Create a new ride on-chain.
 * @param senderAddress - Driver's wallet address
 * @param priceInAlgo - Price per seat in ALGO (e.g., 2.5)
 * @param seats - Number of seats (1-6)
 * @returns Transaction ID and ride ID
 */
export async function createRideOnChain(
    senderAddress: string,
    priceInAlgo: number,
    seats: number
): Promise<{ txId: string; rideId: number }> {
    const suggestedParams = await algodClient.getTransactionParams().do();
    const priceInMicroAlgo = Math.floor(priceInAlgo * 1_000_000);

    // Get current ride count to predict next ride ID
    const rideCount = await getRideCountOnChain();
    const nextRideId = rideCount + 1;
    
    console.log(`📊 Current ride count: ${rideCount}, predicting next ride ID: ${nextRideId}`);
    
    // Encode the box name EXACTLY as the smart contract expects
    const rideIdBytes = algosdk.encodeUint64(nextRideId);
    const boxName = new Uint8Array(1 + rideIdBytes.length);
    boxName[0] = 0x72; // 'r' in ASCII
    boxName.set(rideIdBytes, 1);
    
    console.log(`📦 Box name (hex): ${Array.from(boxName).map(b => b.toString(16).padStart(2, '0')).join('')}`);

    const methodSelector = getMethodSelector("create_ride(uint64,uint64)uint64");
    const appAddress = getAppAddress();

    // Calculate MBR for boxes (minimum balance requirement)
    // Box MBR = 2,500 + 400 × (key_size + value_size)
    const rideBoxKeySize = 9; // "r" (1 byte) + ride_id (8 bytes)
    const rideBoxValueSize = 72; // ride data
    const rideBoxMBR = 2500 + (400 * (rideBoxKeySize + rideBoxValueSize));
    
    console.log(`💰 Sending ${rideBoxMBR} µALGO to app for box storage (key: ${rideBoxKeySize} + value: ${rideBoxValueSize} bytes)`);

    // Transaction 1: Fund the app's minimum balance for box storage
    const fundingTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: senderAddress,
        receiver: appAddress,
        amount: BigInt(rideBoxMBR),
        suggestedParams,
    });

    // Transaction 2: Call the contract to create the ride
    console.log(`🔧 Creating app call with ride_id=${nextRideId}, boxName=${Array.from(boxName).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ')}`);
    
    const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: senderAddress,
        appIndex: BigInt(APP_ID),
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [
            methodSelector,
            algosdk.encodeUint64(priceInMicroAlgo),
            algosdk.encodeUint64(seats),
        ],
        boxes: [
            // Declare the box that will be created: "r" + nextRideId
            // Use appIndex: 0 to reference the current app's boxes
            {
                appIndex: 0,
                name: boxName
            },
        ],
        suggestedParams,
    });

    const txId = await signAndSend([fundingTxn, appCallTxn], senderAddress);

    // Parse ride_id from return log
    // Note: txId is the group's first transaction, but logs are in the app call (second txn)
    const appCallTxId = appCallTxn.txID();
    console.log(`📄 Getting logs from app call transaction: ${appCallTxId}`);
    
    const txInfo = await algodClient.pendingTransactionInformation(appCallTxId).do();
    const logs = (txInfo as any).logs || [];
    let rideId = nextRideId; // Fallback to predicted ID
    
    if (logs.length > 0) {
        const lastLog = logs[logs.length - 1];
        const logBytes = typeof lastLog === "string"
            ? Uint8Array.from(atob(lastLog), c => c.charCodeAt(0))
            : new Uint8Array(lastLog);
        if (logBytes.length >= 12) {
            // Skip 4-byte ABI return prefix (0x151f7c75)
            rideId = Number(algosdk.decodeUint64(logBytes.slice(4, 12), "bigint"));
            console.log(`✅ Ride ID from logs: ${rideId}`);
        }
    } else {
        console.log(`⚠️ No logs found, using predicted ride ID: ${rideId}`);
    }

    return { txId, rideId };
}

/**
 * Join a ride by paying the price into escrow.
 */
export async function joinRideOnChain(
    senderAddress: string,
    rideId: number,
    priceInAlgo: number
): Promise<string> {
    const suggestedParams = await algodClient.getTransactionParams().do();
    const priceInMicroAlgo = Math.floor(priceInAlgo * 1_000_000);
    const appAddress = getAppAddress();

    // Calculate MBR for passenger box
    // Passenger box: "p" + ride_id (8) + index (8) = 17 bytes key, 32 bytes value (address)
    const passengerBoxMBR = 2500 + (400 * (17 + 32)); // = 22,100 µALGO
    
    console.log(`💰 Payment: ${priceInMicroAlgo} µALGO (ride price) + ${passengerBoxMBR} µALGO (box MBR) = ${priceInMicroAlgo + passengerBoxMBR} µALGO total`);

    // Payment transaction to the contract (ride price + box MBR)
    const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: senderAddress,
        receiver: appAddress,
        amount: BigInt(priceInMicroAlgo + passengerBoxMBR),
        suggestedParams,
    });

    const methodSelector = getMethodSelector("join_ride(uint64,pay)void");
    const rideIdBytes = algosdk.encodeUint64(rideId);

    // Build box references - use appIndex: 0 for current app
    const boxes = [
        { appIndex: 0, name: new Uint8Array([114, ...algosdk.encodeUint64(rideId)]) },
    ];
    // Add passenger box refs (up to 6 seats)
    for (let i = 0; i < 6; i++) {
        boxes.push({
            appIndex: 0,
            name: new Uint8Array([112, ...algosdk.encodeUint64(rideId), ...algosdk.encodeUint64(i)]),
        });
    }

    const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: senderAddress,
        appIndex: BigInt(APP_ID),
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [methodSelector, rideIdBytes],
        boxes,
        suggestedParams,
    });

    return await signAndSend([paymentTxn, appCallTxn], senderAddress);
}

/**
 * Driver completes a ride — escrowed ALGO released to driver.
 */
export async function completeRideOnChain(
    senderAddress: string,
    rideId: number
): Promise<string> {
    const suggestedParams = await algodClient.getTransactionParams().do();
    // Increase fee to cover inner payment txn
    suggestedParams.fee = BigInt(2000);
    suggestedParams.flatFee = true;

    const methodSelector = getMethodSelector("complete_ride(uint64)void");

    const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: senderAddress,
        appIndex: BigInt(APP_ID),
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [methodSelector, algosdk.encodeUint64(rideId)],
        boxes: [
            { appIndex: 0, name: new Uint8Array([114, ...algosdk.encodeUint64(rideId)]) },
        ],
        suggestedParams,
    });

    return await signAndSend([appCallTxn], senderAddress);
}

/**
 * Driver cancels a ride — riders are refunded.
 */
export async function cancelRideOnChain(
    senderAddress: string,
    rideId: number,
    numPassengers: number
): Promise<string> {
    const suggestedParams = await algodClient.getTransactionParams().do();
    // Cover fees for refund inner transactions
    suggestedParams.fee = BigInt(1000 + (numPassengers * 1000));
    suggestedParams.flatFee = true;

    const methodSelector = getMethodSelector("cancel_ride(uint64)void");

    const boxes = [
        { appIndex: 0, name: new Uint8Array([114, ...algosdk.encodeUint64(rideId)]) },
    ];
    for (let i = 0; i < Math.max(numPassengers, 1); i++) {
        boxes.push({
            appIndex: 0,
            name: new Uint8Array([112, ...algosdk.encodeUint64(rideId), ...algosdk.encodeUint64(i)]),
        });
    }

    const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: senderAddress,
        appIndex: BigInt(APP_ID),
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [methodSelector, algosdk.encodeUint64(rideId)],
        boxes,
        suggestedParams,
    });

    return await signAndSend([appCallTxn], senderAddress);
}

// ==================== READ-ONLY QUERIES ====================

/**
 * Get ride count from the smart contract
 */
export async function getRideCountOnChain(): Promise<number> {
    try {
        const appInfo = await algodClient.getApplicationByID(BigInt(APP_ID)).do();
        // algosdk v3: globalState is on params, keys are Uint8Array, uint values are bigint
        const globalState = (appInfo as any).params?.globalState || [];

        console.log(`🔍 Reading global state, found ${globalState.length} keys`);
        
        for (const stateItem of globalState) {
            let key: string;
            try {
                // algosdk v3: key is already Uint8Array (raw bytes), NOT base64
                if (stateItem.key instanceof Uint8Array) {
                    key = new TextDecoder().decode(stateItem.key);
                } else {
                    // Fallback for base64 string (algosdk v2 compat)
                    const decodedBytes = Uint8Array.from(atob(stateItem.key), c => c.charCodeAt(0));
                    key = new TextDecoder().decode(decodedBytes);
                }
            } catch (e) {
                console.warn(`⚠️ Failed to decode key:`, stateItem.key, e);
                continue;
            }
            
            const value = stateItem.value;
            console.log(`  - Key: "${key}", Value type: ${value?.type}, uint: ${value?.uint}`);
            
            if (key === "ride_counter") {
                // algosdk v3: value.uint is bigint — use Number() with nullish coalescing
                const count = Number(value?.uint ?? 0);
                console.log(`✅ ride_counter found: ${count}`);
                return count;
            }
        }
        console.log('⚠️ ride_counter not found in global state, returning 0');
        return 0;
    } catch (error) {
        console.error('❌ Error reading ride count:', error);
        return 0;
    }
}

/**
 * Get total completed rides from the smart contract
 */
export async function getTotalCompletedOnChain(): Promise<number> {
    try {
        const appInfo = await algodClient.getApplicationByID(BigInt(APP_ID)).do();
        // algosdk v3: globalState keys are Uint8Array, uint values are bigint
        const globalState = (appInfo as any).params?.globalState || [];

        for (const stateItem of globalState) {
            let key: string;
            try {
                if (stateItem.key instanceof Uint8Array) {
                    key = new TextDecoder().decode(stateItem.key);
                } else {
                    key = atob(stateItem.key);
                }
            } catch {
                continue;
            }
            if (key === "total_completed") {
                return Number(stateItem.value?.uint ?? 0);
            }
        }
        return 0;
    } catch {
        return 0;
    }
}

/**
 * Rider cancels their booking - pays 0.1 ALGO penalty.
 * @param senderAddress - Rider's wallet address
 * @param rideId - On-chain ride ID
 * @returns Transaction ID
 */
export async function cancelBookingOnChain(
    senderAddress: string,
    rideId: number
): Promise<string> {
    const suggestedParams = await algodClient.getTransactionParams().do();
    // Increase fee to cover inner payment txns (refund + penalty to driver)
    suggestedParams.fee = BigInt(3000);
    suggestedParams.flatFee = true;

    const methodSelector = getMethodSelector("cancel_booking(uint64)void");

    // Build box references (ride + all possible passenger slots) - use appIndex: 0
    const boxes = [
        { appIndex: 0, name: new Uint8Array([114, ...algosdk.encodeUint64(rideId)]) },
    ];
    for (let i = 0; i < 6; i++) {
        boxes.push({
            appIndex: 0,
            name: new Uint8Array([112, ...algosdk.encodeUint64(rideId), ...algosdk.encodeUint64(i)]),
        });
    }

    const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: senderAddress,
        appIndex: BigInt(APP_ID),
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [methodSelector, algosdk.encodeUint64(rideId)],
        boxes,
        suggestedParams,
    });

    return await signAndSend([appCallTxn], senderAddress);
}

// ==================== UTILITY ====================

/**
 * Format microALGO to ALGO with decimals
 */
export function microAlgoToAlgo(microAlgo: number): number {
    return microAlgo / 1_000_000;
}

/**
 * Format ALGO to microALGO
 */
export function algoToMicroAlgo(algo: number): number {
    return Math.floor(algo * 1_000_000);
}

/**
 * Shorten an Algorand address for display
 */
export function shortenAddress(address: string): string {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Get Testnet explorer URL for a transaction
 */
export function getExplorerUrl(txId: string): string {
    return `https://testnet.explorer.perawallet.app/tx/${txId}`;
}

/**
 * Get Testnet explorer URL for the app
 */
export function getAppExplorerUrl(): string {
    return `https://testnet.explorer.perawallet.app/application/${APP_ID}`;
}
