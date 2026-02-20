# PeerPool - Decentralized Ride Sharing on Algorand

## 🚗 Project Overview

**PeerPool** is a decentralized ride-sharing platform built on the **Algorand Blockchain** that enables direct, trustless coordination between drivers and riders without intermediaries. Using smart contracts for escrow payments, RIDE ensures transparency, reduces fees, and provides automatic refunds, all powered by Algorand's fast, secure, and low cost infrastructure.

### Key Features
- **🔒 Trustless Escrow Payments:** Riders' funds are locked in a smart contract and only released to the driver upon successful ride completion
- **💸 Automatic Refunds:** If a ride is cancelled by the driver, all passengers are automatically refunded by the smart contract
- **⛓️ Fully On-Chain:** Ride availability, pricing, seat booking, and passenger tracking are managed directly on Algorand using Box Storage
- **🚀 Low Fees:** Algorand's minimal transaction fees (~0.001 ALGO) make micro-payments practical
- **⚡ Instant Finality:** Transactions confirm in ~3.3 seconds

---

## 🎯 Problem Statement

**Selected from RIFT 2026 Hackathon: Decentralized Finance (DeFi) / P2P Transportation**

Centralized ride sharing platforms like Uber and Lyft charge drivers 25-30% commission on every ride, impose opaque pricing algorithms, and maintain complete control over user funds. This creates:
- **High Fees:** Drivers lose significant income to platform fees
- **Lack of Trust:** Centralized payment processing with no transparency
- **Single Point of Failure:** Platform outages can halt entire operations
- **Data Privacy Concerns:** Personal and financial data controlled by corporations

**PeerPool's Solution:** By leveraging Algorand smart contracts as an escrow layer, RIDE eliminates the middleman, reduces fees to near-zero (only network fee), and ensures trustless, transparent coordination between drivers and riders.

---

## 🔗 Live Demo & Links

| Resource | Link |
|----------|------|
| **🚀 Live Demo URL** | https://algorand-carpooll.vercel.app/ |
| **🎥 LinkedIn Demo Video** | _____________________________ *(Add your LinkedIn post URL here)* ⚠️ *Must tag: https://www.linkedin.com/company/rift-pwioi/* |
| **📜 Smart Contract (Testnet)** | **App ID: [755794423](https://testnet.explorer.perawallet.app/application/755794423)** |
| **🔍 Testnet Explorer** | https://testnet.explorer.perawallet.app/application/755794423 |
| **📂 GitHub Repository** | https://github.com/ameen-ansarii/Algorand-Carpool/ |

---

## 🏗️ Architecture Overview

### System Design

```
┌─────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│   Rider/Driver  │ ◄─────► │   Frontend (Next.js) │ ◄─────► │  Pera Wallet    │
│   (Browser)     │         │   + algosdk v3       │         │  (Mobile App)   │
└─────────────────┘         └──────────────────────┘         └─────────────────┘
                                      │
                                      │ Transaction Submission
                                      ▼
                            ┌──────────────────────┐
                            │  Algorand Testnet    │
                            │  (Public Blockchain) │
                            └──────────────────────┘
                                      │
                                      │ Smart Contract Execution
                                      ▼
                            ┌──────────────────────┐
                            │   RideEscrow.py      │
                            │   (App ID: 755794423)│
                            │                      │
                            │  ┌─────────────────┐ │
                            │  │ Global State:   │ │
                            │  │ - ride_counter  │ │
                            │  │ - total_rides   │ │
                            │  └─────────────────┘ │
                            │                      │
                            │  ┌─────────────────┐ │
                            │  │ Box Storage:    │ │
                            │  │ "r"+ride_id → ✅│ │
                            │  │  Driver, Price, │ │
                            │  │  Seats, Status  │ │
                            │  │                 │ │
                            │  │ "p"+ride+idx →  │ │
                            │  │  Passenger Addr │ │
                            │  └─────────────────┘ │
                            └──────────────────────┘
```

### Smart Contract Methods

| Method | Description | Caller | Action |
|--------|-------------|--------|--------|
| `create_ride(price, seats)` | Driver posts a new ride | Driver | Creates box storage with ride details, returns ride_id |
| `join_ride(ride_id, payment)` | Rider joins a ride | Rider | Locks payment in escrow, adds rider to passenger list |
| `complete_ride(ride_id)` | Marks ride as complete | Driver | Releases escrowed funds to driver (price × passengers) |
| `cancel_ride(ride_id)` | Driver cancels the ride | Driver | Refunds all passengers, driver pays 0.1 ALGO penalty per rider |
| `cancel_booking(ride_id)` | Rider cancels their booking | Rider | Refunds rider minus 0.1 ALGO penalty (goes to driver) |

### Data Flow Example: Join PeerPool

```
1. Rider clicks "Join PeerPool" in UI
2. Frontend constructs Atomic Transaction Group:
   ├─ Payment Txn: Rider → Contract (fare + box MBR)
   └─ App Call Txn: join_ride(ride_id, pay)
3. Pera Wallet prompts user to approve
4. Signed transactions submitted to Algorand
5. Smart contract validates:
   ✓ Payment amount matches fare
   ✓ Ride is active
   ✓ Seats available
   ✓ Rider is not the driver
6. Contract executes:
   ├─ Creates passenger box: "p" + ride_id + passenger_index → rider_address
   └─ Updates ride box: increments seats_taken
7. Transaction confirms (~3.3s)
8. Frontend displays success + updates UI
```

---

## 🛠️ Tech Stack

### Blockchain & Smart Contract
| Component | Technology | Version |
|-----------|------------|---------|
| **Blockchain** | Algorand Testnet | Layer-1 |
| **Smart Contract Language** | Python (Algorand Python / Algopy) | 3.x |
| **Development Framework** | AlgoKit | 4.0+ |
| **Contract Testing** | algorand-python-testing | 1.x |
| **Deployment Tool** | algokit-utils | 4.0+ |
| **Compiler** | Puya (puyapy) | Latest |

### Frontend Application
| Component | Technology | Version |
|-----------|------------|---------|
| **Framework** | Next.js (App Router) | 16.1.6 |
| **UI Library** | React | 19.2.3 |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **Wallet Integration** | Pera Wallet Connect | 1.5.0 |
| **Blockchain SDK** | algosdk | 3.5.2 |
| **Animations** | Framer Motion | 12.x |
| **Authentication** | Firebase Auth | 12.9.0 |
| **Database** | Firestore (off-chain ride metadata) | 12.9.0 |

### Storage Strategy
- **On-Chain (Box Storage):**
  - Ride data (driver, price, seats, status)
  - Passenger addresses
  - Contract state (ride counter, completion stats)
- **Off-Chain (Firebase):**
  - Driver profiles (car model, color, license plate)
  - Ride locations (origin, destination)
  - User reviews and ratings

---

## 🛠️ Installation & Setup

### Prerequisites
Ensure the following are installed:
- **Node.js** v18+ and npm
- **Python** 3.12+
- **Poetry** (Python dependency manager)
- **Docker** (for AlgoKit LocalNet, optional)
- **AlgoKit CLI** v2.0+

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### 2. Smart Contract Setup

#### Install Dependencies
```bash
cd ride-contract
algokit project bootstrap all
```

#### Deploy to Testnet (Already Deployed)
The contract is already deployed to Testnet with **App ID: 755794423**. To redeploy or deploy to LocalNet:

```bash
# Start LocalNet (optional, for local testing)
algokit localnet start

# Deploy to LocalNet
algokit project deploy localnet

# Deploy to Testnet (requires funded account in .env.testnet)
algokit project deploy testnet
```

#### Build Contracts Manually
```bash
algokit project run build
```

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../web-app
npm install
```

#### Environment Configuration
Create a `.env.local` file (if needed for Firebase):
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain_here
# ... other Firebase configs
```

> **Note:** The Algorand App ID is hardcoded in `src/lib/algorand.ts` as `755794423`.

#### Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Build for Production
```bash
npm run build
npm start
```

### 4. Deploy Frontend to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

## 📝 Usage Guide

### For Riders

#### Step 1: Connect Wallet
1. Open the RIDE web app
2. Click **"Connect Wallet"** in the navigation bar
3. Select **Pera Wallet** (ensure you have the mobile app installed)
4. Scan the QR code or use WalletConnect
5. Approve the connection in your Pera Wallet app

#### Step 2: Browse Available Rides
1. Navigate to the **Dashboard**
2. View all active rides posted by drivers
3. See ride details: Origin, Destination, Price, Available Seats

#### Step 3: Join a Ride
1. Click **"Book Ride"** on your desired ride
2. Review the fare amount
3. Confirm the transaction in Pera Wallet (payment to escrow)
4. Wait for confirmation (~3-5 seconds)
5. Receive booking confirmation with ride details

#### Step 4: Track Ride Status
- View your booked rides in the dashboard
- See driver details and contact information
- Wait for the driver to complete the ride

#### Step 5: Automatic Payment Release
- When the driver marks the ride as complete, escrowed funds are automatically transferred to the driver
- No further action needed from you!

### For Drivers

#### Step 1: Set Up Driver Profile
1. Connect your Pera Wallet
2. Navigate to **"Become a Driver"**
3. Enter your vehicle details:
   - Car Model (e.g., "Toyota Camry")
   - Car Color
   - License Plate
   - Car Type (e.g., "Sedan")
4. Save profile

#### Step 2: Post a Ride
1. Click **"Offer a Ride"**
2. Fill in ride details:
   - Origin (city/location)
   - Destination
   - Price per seat (in ALGO)
   - Number of available seats (1-6)
   - Departure time
3. Click **"Create Ride"**
4. Approve the transaction in Pera Wallet:
   - Transaction 1: Fund contract for box storage (~0.0349 ALGO)
   - Transaction 2: Create ride on-chain
5. Wait for confirmation

#### Step 3: Accept Ride Requests
- When riders join your ride, you'll see their booking in the dashboard
- Review passenger details
- Contact passengers via saved contact info (off-chain)

#### Step 4: Complete the Ride
1. After dropping off all passengers, click **"Complete Ride"**
2. Approve the transaction in Pera Wallet
3. Escrowed funds (fare × number of passengers) are sent to your wallet
4. Ride is marked as completed on-chain

#### Step 5: Cancel a Ride (if needed)
1. Click **"Cancel Ride"**
2. All passengers are automatically refunded
3. You pay a 0.1 ALGO penalty per passenger (compensation)

### Screenshots
> **TODO:** Add screenshots here demonstrating:
> - Landing page
> - Wallet connection flow
> - Dashboard with available rides
> - Booking modal
> - Driver ride creation
> - Transaction confirmation in Pera Wallet
> - Completed ride view

---

## 🔬 Known Limitations

1. **Testnet Only:** Currently deployed on Algorand Testnet. Mainnet deployment requires additional security audits and testing.

2. **Box Storage Costs:** Creating rides and joining rides requires upfront payment for box storage MBR (~0.035 ALGO for rides, ~0.022 ALGO for passengers). This is refundable if boxes are deleted.

3. **No Dispute Resolution:** The smart contract assumes honest behavior. In case of disputes (e.g., ride not completed but driver claims it is), there's no on-chain arbitration mechanism.

4. **Limited Passenger Tracking:** The smart contract can track up to 6 passengers per ride (hardcoded limit). Larger vehicles would need contract modifications.

5. **Off-Chain Data Dependency:** Location details, driver profiles, and contact information are stored off-chain in Firebase. If Firebase is down, users can still interact with the blockchain but won't see full ride context.

6. **No Geolocation Verification:** The contract trusts the driver to mark rides as complete. There's no GPS-based verification of ride completion.

7. **Wallet Persistence Issues:** On some browsers, wallet reconnection after page refresh requires manual reconnection. Session persistence is handled via localStorage but can be unreliable.

8. **Gas Fee Spikes:** When completing rides with multiple passengers, the driver must pay for inner transaction fees (1000 µALGO per inner txn).

9. **Mobile Responsiveness:** The UI is optimized for desktop. Mobile experience may need additional refinement.

10. **No Rating System On-Chain:** User ratings and reviews are stored off-chain. A fully decentralized reputation system would require additional smart contract logic.

---

## 🧪 Testing

### Smart Contract Tests
```bash
cd ride-contract
algokit project run test
```

### Frontend Tests
```bash
cd web-app
npm run test
```

---

## 🚀 Future Enhancements

- **Mainnet Deployment** with full security audit
- **DAO Governance** for dispute resolution and platform rules
- **On-Chain Reputation System** using Algorand Standard Assets (ASAs)
- **Multi-Hop Rides** for longer journeys with multiple drivers
- **Insurance Integration** via parametric smart contracts
- **Carbon Credit Rewards** for ride-sharing (sustainability tracking)
- **Cross-Chain Bridge** for payments in other cryptocurrencies

---

## 👥 Team

| Name | Role |
|------|------|
| **Ameen Ansari** | Project Lead & Smart Contract Developer |
| **Faiz Ahmad** | Frontend Developer & UI Designer |
| **Ishan Pinjari** | Blockchain Integration Engineer |
| **Adnan Bawani** | Backend Developer & DevOps |

---

## 📄 License

This project is open-source and available under the MIT License.

---

## 🙏 Acknowledgements

- **Algorand Foundation** for AlgoKit and developer resources
- **RIFT 2026 Hackathon** for the opportunity and problem statement
- **Pera Wallet** for seamless wallet integration
- **Next.js & Vercel** for frontend infrastructure

---

## 📞 Support & Contact

For questions, issues, or collaboration:
- **Email:** 12ameenansari34@gmail.com

---

**Built with ❤️ on Algorand for RIFT 2026 Hackathon**
