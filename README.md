# RIDE - Decentralized Ride Sharing on Algorand

## 🚗 Project Overview
**RIDE** is a decentralized ride-sharing platform leveraging the **Algorand Blockchain** to enable direct, trustless coordination between drivers and riders. By using smart contracts for escrow payments, RIDE eliminates intermediaries, reduces fees, and ensures transparency.

- **Trustless Payments:** Riders deposit funds into a smart contract escrow. Funds are only released to the driver upon successful ride completion.
- **Refund Guarantee:** If a ride is cancelled by the driver, riders are automatically refunded by the smart contract.
- **On-Chain Data:** Ride availability, pricing, and seat booking are managed directly on the Algorand blockchain using Box Storage.

---

## 🏆 Problem Statement 
*(Please fill in your selected problem statement from the RIFT list or describe your original idea here. Example: "Centralized ride-sharing apps charge high fees and lack transparency...")*

---

## 🔗 Live Demo & Links
- **🚀 Live Demo URL:** *(INSERT YOUR VERCEL/HOSTED LINK HERE)*
- **🎥 Demo Video (LinkedIn):** *(INSERT YOUR LINKEDIN VIDEO URL HERE)*
- **📜 Smart Contract (Testnet):** [App ID 755780364](https://testnet.explorer.perawallet.app/application/755780364)

---

## 🏗️ Architecture & Tech Stack

### ⚡ Algorand Smart Contract
- **Language:** Python (via AlgoKit & Algopy/Puya)
- **Framework:** AlgoKit
- **Logic:** 
  - `create_ride`: Locks ride details and price on-chain.
  - `join_ride`: Accepts payment from riders into the contract account (Escrow).
  - `complete_ride`: Verifies completion and transfers funds to the driver.
  - `cancel_ride`: Refunds all passengers.
- **Storage:** Uses **Box Storage** to efficiently store ride metadata and passenger lists on-chain.

### 💻 Frontend Client
- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS + Glassmorphism UI
- **Wallet Connection:** Pera Wallet (WalletConnect)
- **Integration:** `algosdk` for constructing atomic transaction groups (Payment + App Call).

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js & npm
- Python 3.12+ & Poetry (for smart contracts)
- Docker (for AlgoKit LocalNet)
- AlgoKit CLI

### 1. Smart Contract Setup
```bash
cd ride-contract
algokit project bootstrap all
# To deploy to localnet:
algokit localnet start
algokit project deploy localnet
```

### 2. Frontend Setup
```bash
cd web-app
npm install
# Create .env.local if needed (see .env.example)
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📝 Usage Guide

1.  **Connect Wallet:** Click "Connect Wallet" and scan with Pera Wallet (Testnet).
2.  **Driver Mode:**
    -   Go to "Offer a Ride".
    -   Enter details (Origin, Destination, Price).
    -   Sign the transaction to create the ride on-chain.
3.  **Rider Mode:**
    -   Browse available rides.
    -   Click "Join Ride".
    -   Sign the transaction to pay ALGO into the escrow.
4.  **Completion:**
    -   Driver clicks "Complete Ride" when arrived.
    -   Funds are transferred to the driver's wallet.

---

## 👥 Team
- **Member 1 Name:** *(Role)*
- **Member 2 Name:** *(Role)*
*(Add LinkedIn/GitHub links if desired)*
