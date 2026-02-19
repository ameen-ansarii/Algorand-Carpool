# Wallet Persistence Fix

## The Problem
Wallet was being saved to Firestore (user profile) but not restoring when the user logged back in. The "Connect Wallet" banner kept showing even though the user had already connected their wallet.

## Root Cause
The `WalletContext` reconnection logic only checked for an active **Pera Wallet session** in localStorage, but didn't check the **user's Firestore profile** for a saved wallet address.

### What Was Happening:
1. User connects wallet → Saved to Firestore ✓
2. User closes browser
3. User returns and logs in → Auth restored ✓
4. Wallet connection NOT restored ❌ (because Pera session expired)
5. Banner shows "Connect Wallet" again ❌

## The Fix

### Three-Layer Wallet Restoration Strategy:

```typescript
// Layer 1: Try Pera Wallet reconnectSession() 
// (fastest, works if session not expired)
const accounts = await reconnectPeraWallet();
if (accounts) {
  setWalletAddress(accounts[0]);
  return; // ✓ Success
}

// Layer 2: Check user's Firestore profile
if (profile?.walletAddress) {
  setWalletAddress(profile.walletAddress);
  return; // ✓ Fallback success
}

// Layer 3: User must connect manually
// (only if no saved wallet exists)
```

### Added Features:
1. **Initialization state** - Prevents showing "Connect Wallet" banner while checking
2. **Profile fallback** - Uses saved wallet address even if Pera session expired
3. **Better logging** - Shows exactly how wallet was restored
4. **Security validation** - Checks for wallet mismatches

## Files Changed

### 1. `/src/context/WalletContext.tsx`
- Added `initializing` state
- Enhanced reconnection logic with 3-layer strategy
- Added profile wallet fallback
- Better console logging for debugging

### 2. `/src/components/dashboard/Dashboard.tsx`
- Added `walletInitializing` check
- Don't show "Connect Wallet" banner while initializing
- Prevents banner flashing

## Expected Behavior Now

### Scenario 1: Active Pera Session
```
User logs in → Pera session valid → Instant wallet reconnect
Console: "✓ Wallet session restored from Pera: ABC...XYZ"
```

### Scenario 2: Expired Pera Session (THE FIX)
```
User logs in → Pera session expired → Check profile → Restore from profile
Console: "✓ Restoring wallet from profile: ABC...XYZ"
```

### Scenario 3: No Wallet Ever Connected
```
User logs in → No Pera session → No profile wallet → Show "Connect Wallet" banner
Console: "No wallet connected - user can connect manually"
```

## Testing Steps

1. **Connect wallet** on dashboard
2. **Check profile** has wallet address saved (should see console log)
3. **Close browser completely**
4. **Open browser and visit app**
5. **Should see wallet connected** WITHOUT scanning QR again ✓
6. **Balance should display** correctly ✓

## Console Messages to Look For

✅ **Success Messages:**
- `✓ Wallet session restored from Pera: ABC...XYZ` (best case)
- `✓ Restoring wallet from profile: ABC...XYZ` (fallback case)
- `✓ Wallet linked to profile: ABC...XYZ` (when first connected)

⚠️ **Info Messages:**
- `No wallet connected - user can connect manually` (expected for new users)

❌ **Error Messages:**
- `Wallet mismatch detected` (security check - different wallet than saved)
- `Could not fetch balance` (network issue, but wallet still shows)

## Technical Details

### Why Three Layers?

1. **Layer 1 (Pera Session)**: Fastest, but expires after time
   - Stored in: `localStorage` by Pera Wallet SDK
   - Lifetime: ~7 days typically
   
2. **Layer 2 (Profile)**: Persistent, never expires
   - Stored in: Firestore `users/{uid}/walletAddress`
   - Lifetime: Forever (until user disconnects)
   
3. **Layer 3 (Manual)**: User must actively connect
   - Used when: No previous connection exists

### Security Features

- Validates wallet matches profile (prevents account hijacking)
- Clears mismatched sessions automatically
- Only links wallet when user is authenticated
- Updates profile atomically

## Known Limitations

1. **Balance might be stale** if Pera session expired (will update on next refresh)
2. **Can't sign transactions** with profile-only restoration (need active Pera session for that)
3. **Single wallet per user** (can't store multiple wallets yet)

## Future Improvements

- [ ] Auto-refresh balance on page focus
- [ ] Support multiple wallets per user
- [ ] Add "Re-authorize wallet" flow for expired sessions
- [ ] Cache balance in profile for instant display
- [ ] Add wallet health check (detect if wallet is still valid)

---

**Your wallet will now persist across sessions!** 🎉
