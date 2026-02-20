# RIDE - Demo Video Script (3 Minutes)
## RIFT 2026 Hackathon Submission

---

## 🎬 Script Overview
**Duration:** 3 minutes  
**Format:** Screen recording + voiceover  
**Tone:** Professional but conversational, enthusiastic

---

## 📋 Pre-Recording Checklist
- [ ] Test your app on live Testnet - ensure everything works
- [ ] Have Pera Wallet app open on your phone
- [ ] Clear browser cache for clean demo
- [ ] Close unnecessary tabs/windows
- [ ] Test microphone audio quality
- [ ] Have Testnet Explorer tab ready: https://testnet.explorer.perawallet.app/application/755794423
- [ ] Prepare backup plan if something fails during demo

---

## 🎯 Script with Timing

### **[0:00 - 0:30] INTRODUCTION & PROBLEM STATEMENT**
*[Screen: Show RIDE landing page]*

**YOU SAY:**
> "Hey everyone! I'm Ameen from Team RIDE, and we built this for the RIFT 2026 Hackathon. 
>
> So here's the problem we're solving: platforms like Uber and Lyft charge drivers up to 30% commission on every single ride. That's a huge cut, right? Plus, riders have to trust these centralized companies with their money, and there's zero transparency in how payments work.
>
> We asked ourselves: what if we could cut out the middleman entirely? What if drivers could keep 100% of their fare, and riders could see exactly where their money goes—all on-chain? That's what RIDE does."

*[Screen: Scroll through landing page showing features]*

---

### **[0:30 - 1:10] ARCHITECTURE & ALGORAND INTEGRATION**
*[Screen: Open Testnet Explorer showing your App ID 755794423]*

**YOU SAY:**
> "Let me show you how it works technically. We built a smart contract on Algorand Testnet—this is our escrow contract, App ID 755794423.
>
> When a driver posts a ride, the details go directly on-chain using Algorand's Box Storage. When a rider joins, they pay into the smart contract—not to us, not to a company—into the contract itself. That ALGO sits in escrow.
>
> The magic happens when the ride completes. The contract automatically releases the funds to the driver. No intermediary, no delays, no trust needed. And if the driver cancels? Everyone gets refunded automatically by the contract.
>
> We built this using AlgoKit as our main framework, Algorand Python for the smart contract, and the frontend is Next.js connected through the Algorand SDK and Pera Wallet. Everything runs on Testnet with real transactions."

*[Screen: Briefly show smart contract code in VS Code - scroll through contract.py showing methods]*

---

### **[1:10 - 2:30] LIVE DEMO**
*[Screen: Back to RIDE web app]*

**YOU SAY:**
> "Alright, let me show you this working live. First, I'll connect my Pera Wallet—"

*[Action: Click "Connect Wallet", show Pera Wallet QR code, scan with phone, approve connection]*

> "—and I'm connected. Now let's post a ride as a driver."

*[Action: Click "Offer a Ride", fill in:
- Origin: Mumbai
- Destination: Pune  
- Price: 2.5 ALGO
- Seats: 3]*

> "I'm going from Mumbai to Pune, charging 2.5 ALGO per seat, with 3 seats available. When I click Create Ride—"

*[Action: Click "Create Ride"]*

> "—my phone lights up with Pera Wallet."

*[Screen: Show phone screen with Pera transaction approval]*

> "This is actually two transactions: one to fund the contract for storage, and one to create the ride on-chain. Let me approve this..."

*[Action: Approve in Pera Wallet, wait for confirmation]*

> "And there we go! Transaction confirmed. The ride is now live on Algorand Testnet."

*[Action: Show the ride appearing in the dashboard]*

> "Now let's switch to rider mode. I'll join this ride—"

*[Action: Click "Book Ride" on the ride you just created]*

> "When I book, I'm sending 2.5 ALGO plus a small amount for storage into the smart contract. Let me approve..."

*[Action: Approve payment transaction in Pera Wallet]*

> "Perfect! The payment is now locked in escrow. The contract is holding my ALGO."

*[Action: Show booking confirmation, then click "Complete Ride" as driver]*

> "And when the driver marks it complete, the contract releases the funds automatically."

*[Action: Approve completion transaction, show success message]*

> "That's it! The entire flow—on-chain, trustless, transparent. No middleman taking a cut."

---

### **[2:30 - 2:50] TECHNICAL HIGHLIGHTS & FUTURE**

**YOU SAY:**
> "A few cool technical things we implemented: we're using atomic transaction groups for payments, Box Storage to keep ride data on-chain efficiently, and the contract handles edge cases like cancellations with automatic refunds and penalties.
>
> Looking ahead, we want to add a DAO for dispute resolution, an on-chain reputation system, maybe even carbon credit rewards for ride-sharing. This is just the beginning."

*[Screen: Optionally show architecture diagram from README or just keep app visible]*

---

### **[2:50 - 3:00] CLOSING & THANK YOU**
*[Screen: Back to landing page or show your name/team]*

**YOU SAY:**
> "So that's RIDE—decentralized ride-sharing on Algorand. Built entirely with AlgoKit, running on Testnet, and solving real problems with blockchain.
>
> Huge thanks to RIFT 2026 for this opportunity, and to the Algorand Foundation for the amazing developer tools. Check out our GitHub, try the live demo, and let me know what you think. Thanks for watching!"

*[Screen: Show final slide with:
- Team names: Ameen Ansari (Lead), Faiz Ahmad, Ishan Pinjari, Adnan Bawani
- App ID: 755794423
- GitHub URL
- "Built for RIFT 2026"]*

---

## 🎤 Delivery Tips

### Voice & Tone
- **Speak naturally:** Don't sound like you're reading. Practice until it feels conversational.
- **Pace yourself:** Don't rush! 3 minutes is plenty of time.
- **Show enthusiasm:** You built something cool—let that energy come through!
- **Smile while recording:** It affects your voice tone (really!)

### Technical Tips
- **Pause for transactions:** When waiting for Pera confirmations, don't go silent. Say things like "waiting for the network..." or "should confirm in a few seconds..."
- **Have a backup:** If something breaks during demo, have a pre-recorded clip ready or explain what *should* happen.
- **Test run:** Do at least 2-3 practice recordings to catch issues.

### What to Show on Screen
1. **Landing page** - show it's a real, polished app
2. **Testnet Explorer** - prove it's on-chain
3. **Smart contract code** - briefly, shows technical depth
4. **Live demo** - connect wallet, create ride, join ride, complete
5. **Pera Wallet approvals** - shows real blockchain interaction
6. **Final confirmation messages** - shows it works end-to-end

---

## 📱 Recording Setup

### Recommended Tools
- **Loom** (easiest): https://loom.com - Free, web-based, auto-uploads
- **OBS Studio** (professional): Free, more control over layout
- **Zoom** (if you have it): Record yourself + screen share

### Settings
- **Resolution:** 1080p minimum
- **Frame rate:** 30fps is fine
- **Audio:** Use a decent microphone (even earbuds are better than laptop mic)
- **Lighting:** Face should be visible if showing webcam
- **Background:** Clean, minimal distractions

### Screen Recording Tips
- **Full screen or browser only:** Decide which looks cleaner
- **Hide bookmarks bar:** Makes it look more professional
- **Close notification popups:** Disable Slack, email, etc.
- **Zoom in on important parts:** Especially for wallet approvals

---

## ✂️ Editing (Optional)

### If You Want to Edit
- **Cut dead air:** Trim long pauses during transaction confirmations
- **Add text overlays:** "App ID: 755794423", "Built with AlgoKit", etc.
- **Background music:** Very subtle, low volume (optional)
- **Speed up slow parts:** 1.2x speed for transaction waits

### Keep It Simple
- Don't over-edit! Judges want to see a real demo, not a Hollywood production.
- Natural is better than perfect.

---

## 📤 LinkedIn Posting Script

When you post the video on LinkedIn, use this caption:

```
🚗 Introducing RIDE - Decentralized Ride-Sharing on Algorand

We just built this for RIFT 2026 Hackathon! 🎉

The problem? Uber and Lyft take 25-30% commissions. Riders have to trust centralized companies with their money. No transparency.

The solution? RIDE uses Algorand smart contracts as an escrow layer. Drivers keep 100% of fares (minus tiny network fees). Riders get automatic refunds if cancelled. Everything is on-chain and transparent.

✅ Built with AlgoKit (Algorand's official framework)
✅ Smart contract in Python (Algorand Python)
✅ Deployed on Testnet - App ID: 755794423
✅ Frontend in Next.js + Pera Wallet integration

Tech Stack: #AlgoKit #Algorand #NextJS #Web3 #Blockchain #SmartContracts

Check it out:
🔗 Live Demo: [YOUR_URL]
💻 GitHub: [YOUR_REPO]
📜 Smart Contract: https://testnet.explorer.perawallet.app/application/755794423

Team: Ameen Ansari, Faiz Ahmad, Ishan Pinjari, Adnan Bawani

@RIFT - Pune Wisdom Institute of Innovation #RIFT2026 #Hackathon #DeFi #Innovation #AlgorandBlockchain
```

**CRITICAL:** 
- Type `@RIFT` and select "RIFT - Pune Wisdom Institute of Innovation" from the dropdown
- Set post visibility to **PUBLIC** (not just connections)

---

## 🎬 Final Checklist Before Recording

- [ ] Script practiced at least twice
- [ ] App tested and working on Testnet
- [ ] Pera Wallet funded with Testnet ALGO
- [ ] Phone nearby and ready
- [ ] Good microphone connected
- [ ] Notifications turned off
- [ ] Screen recording software tested
- [ ] Timer ready (aim for 2:45-3:00)
- [ ] Backup plan if demo fails
- [ ] Glass of water nearby (seriously!)

---

## 💡 Pro Tips

1. **Energy matters:** You're competing with other submissions. Show you're excited about what you built!

2. **Technical depth:** Briefly show code, mention AlgoKit multiple times, use terms like "atomic transactions" and "box storage"—judges are technical.

3. **Show real transactions:** The Pera Wallet approval screens are GOLD. They prove it's real, not mocked.

4. **Time the demo right:** If transactions are slow, talk through what's happening. Don't just sit in silence.

5. **End with a CTA:** "Check out our repo", "Try the live demo", "Let's connect"—give people something to do next.

---

Good luck! You've got this! 🚀

**Remember:** The demo doesn't need to be perfect. It needs to be real, technical, and show that you solved a problem using Algorand. That's what judges care about.
