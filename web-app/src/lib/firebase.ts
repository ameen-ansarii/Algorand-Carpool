import { initializeApp, getApps } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile as firebaseUpdateProfile,
    sendPasswordResetEmail,
    type User,
} from "firebase/auth";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    deleteDoc,
    onSnapshot,
    type Timestamp,
} from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (prevent duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Configure auth persistence to remember users across sessions
if (typeof window !== 'undefined') {
    import('firebase/auth').then(({ setPersistence, browserLocalPersistence }) => {
        setPersistence(auth, browserLocalPersistence).catch((error) => {
            console.error('Failed to set auth persistence:', error);
        });
    });
}

// Enhance Google Provider for better UX
googleProvider.setCustomParameters({
    prompt: 'select_account', // Allow users to select account each time
});

// ==================== AUTH ====================

export async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    await createOrUpdateUserProfile(user);
    return user;
}

export async function signUpWithEmail(email: string, pass: string, name: string) {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    const user = result.user;
    await firebaseUpdateProfile(user, { displayName: name });
    await createOrUpdateUserProfile(user);
    return user;
}

export async function signInWithEmail(email: string, pass: string) {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    const user = result.user;
    await createOrUpdateUserProfile(user); // Ensure profile exists/updates on login
    return user;
}

export async function signOutUser() {
    await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}

export async function sendPasswordReset(email: string) {
    return sendPasswordResetEmail(auth, email);
}

// ==================== USER PROFILES ====================

export interface DriverDetails {
    carModel: string;
    carColor: string;
    licensePlate: string;
    carType: "sedan" | "suv" | "hatchback" | "auto" | "bike";
}

export interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string;
    role: "driver" | "rider" | null;
    walletAddress?: string;
    walletBalance: number;
    totalRides: number;
    totalEarnings: number;
    rating: number;
    ratingCount: number;
    driverDetails?: DriverDetails;
    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
}

export async function createOrUpdateUserProfile(user: User) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const profile: any = {
            uid: user.uid,
            displayName: user.displayName || "Anonymous",
            email: user.email || "",
            photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || "User")}&background=random`,
            role: null,
            walletBalance: 0,
            totalRides: 0,
            totalEarnings: 0,
            rating: 5.0,
            ratingCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        await setDoc(userRef, profile);
    } else {
        await updateDoc(userRef, {
            updatedAt: serverTimestamp(),
            displayName: user.displayName || "Anonymous",
            // Only update photo if it's not the default avatar to avoid overwriting custom ones if we add that later
            // For now, sync with Auth
            photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || "User")}&background=random`,
        });
    }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
    }
    return null;
}

export async function updateUserRole(uid: string, role: "driver" | "rider") {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { role, updatedAt: serverTimestamp() });
}

export async function updateDriverDetails(uid: string, details: DriverDetails) {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { driverDetails: details, updatedAt: serverTimestamp() });
}

export async function updateWalletAddress(uid: string, walletAddress: string) {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { walletAddress, updatedAt: serverTimestamp() });
}

export async function updateWalletBalance(uid: string, newBalance: number) {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { walletBalance: newBalance, updatedAt: serverTimestamp() });
}

export async function incrementDriverStats(uid: string, earnings: number) {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
        const data = snap.data();
        await updateDoc(userRef, {
            totalRides: (data.totalRides || 0) + 1,
            totalEarnings: (data.totalEarnings || 0) + earnings,
            updatedAt: serverTimestamp(),
        });
    }
}

export async function updateUserRating(uid: string, newRating: number) {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
        const data = snap.data();
        const count = (data.ratingCount || 0) + 1;
        const avg = ((data.rating || 5) * (count - 1) + newRating) / count;
        await updateDoc(userRef, { rating: parseFloat(avg.toFixed(2)), ratingCount: count, updatedAt: serverTimestamp() });
    }
}

// ==================== RIDES ====================

export interface Ride {
    id?: string;
    driverId: string;
    driverName: string;
    driverPhoto: string;
    driverWallet?: string;
    carModel?: string;
    carColor?: string;
    licensePlate?: string;
    carType?: string;
    driverRating?: number;
    driverTotalRides?: number;
    origin: string;
    destination: string;
    distance: number;       // in km
    baseFare: number;       // in ALGO
    price: number;          // total price per seat in ALGO
    seats: number;
    seatsAvailable: number;
    departureTime: string;
    departureDate: string;
    status: "open" | "in-progress" | "arriving" | "ongoing" | "completed" | "cancelled";
    passengers: string[];
    passengerNames?: string[];
    passengerPhotos?: string[];
    onChainId?: number;     // on-chain ride ID from smart contract
    rideChainId?: number;   // DEPRECATED: use onChainId
    txId?: string;          // creation transaction ID
    createdAt: Timestamp | null;
    completedAt?: Timestamp | null;
}

// ==================== FARE CALCULATION ====================
// Economy: keep rides affordable for demo (1-5 ALGO range)

const BASE_FARE = 0.3;      // base fare in ALGO
const PER_KM_RATE = 0.12;   // per km in ALGO
const MIN_FARE = 0.5;       // min fare
const MAX_FARE = 5.0;       // max fare for demo budget

export function calculateFare(distanceKm: number): { baseFare: number; distanceFare: number; total: number } {
    const distanceFare = parseFloat((distanceKm * PER_KM_RATE).toFixed(2));
    let total = parseFloat((BASE_FARE + distanceFare).toFixed(2));
    total = Math.max(MIN_FARE, Math.min(MAX_FARE, total));
    return { baseFare: BASE_FARE, distanceFare, total };
}

// ==================== POPULAR LOCATIONS ====================

export const POPULAR_LOCATIONS = [
    { name: "MG Road Metro", area: "Central", distance: 0 },
    { name: "Koramangala 5th Block", area: "South", distance: 5 },
    { name: "Indiranagar 100ft Road", area: "East", distance: 4 },
    { name: "Whitefield IT Park", area: "East", distance: 18 },
    { name: "Electronic City Phase 1", area: "South", distance: 20 },
    { name: "HSR Layout Sector 2", area: "South", distance: 8 },
    { name: "Jayanagar 4th Block", area: "South", distance: 6 },
    { name: "JP Nagar 6th Phase", area: "South", distance: 10 },
    { name: "Marathahalli Bridge", area: "East", distance: 12 },
    { name: "Hebbal Flyover", area: "North", distance: 9 },
    { name: "Yelahanka New Town", area: "North", distance: 15 },
    { name: "Kempegowda Bus Station", area: "Central", distance: 2 },
    { name: "Bangalore Airport (KIA)", area: "North", distance: 35 },
    { name: "Banashankari 2nd Stage", area: "South", distance: 7 },
    { name: "Rajajinagar Industrial Area", area: "West", distance: 5 },
    { name: "Malleswaram Circle", area: "West", distance: 4 },
];

export function getEstimatedDistance(origin: string, destination: string): number {
    const from = POPULAR_LOCATIONS.find(l => l.name === origin);
    const to = POPULAR_LOCATIONS.find(l => l.name === destination);
    if (from && to) return Math.max(1, Math.abs(from.distance - to.distance));
    return Math.floor(Math.random() * 15) + 3; // fallback 3-18km
}

// ==================== PeerPool CRUD ====================

export async function postRide(ride: Omit<Ride, "id" | "createdAt">) {
    const ridesRef = collection(db, "rides");
    const docRef = await addDoc(ridesRef, {
        ...ride,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function getAvailableRides(): Promise<Ride[]> {
    const ridesRef = collection(db, "rides");
    const q = query(ridesRef, where("status", "==", "open"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Ride));
}

export async function getUserRides(uid: string): Promise<Ride[]> {
    const ridesRef = collection(db, "rides");
    const q = query(ridesRef, where("driverId", "==", uid), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Ride));
}

export async function getRiderBookings(uid: string): Promise<Ride[]> {
    const ridesRef = collection(db, "rides");
    const q = query(ridesRef, where("passengers", "array-contains", uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Ride));
}

export async function joinRide(rideId: string, userId: string, userName: string, userPhoto: string) {
    const rideRef = doc(db, "rides", rideId);
    const rideSnap = await getDoc(rideRef);
    if (!rideSnap.exists()) throw new Error("Ride not found");

    const ride = rideSnap.data() as Ride;
    if (ride.seatsAvailable <= 0) throw new Error("No seats available");
    if (ride.passengers.includes(userId)) throw new Error("Already joined");

    await updateDoc(rideRef, {
        passengers: [...ride.passengers, userId],
        passengerNames: [...(ride.passengerNames || []), userName],
        passengerPhotos: [...(ride.passengerPhotos || []), userPhoto],
        seatsAvailable: ride.seatsAvailable - 1,
        status: ride.seatsAvailable - 1 === 0 ? "in-progress" : "open",
    });
}

export async function updateRideStatus(rideId: string, status: Ride["status"]) {
    const rideRef = doc(db, "rides", rideId);
    const updates: any = { status };
    if (status === "completed") updates.completedAt = serverTimestamp();
    await updateDoc(rideRef, updates);
}

export async function cancelRide(rideId: string) {
    await updateRideStatus(rideId, "cancelled");
}

export async function completeRide(rideId: string) {
    await updateRideStatus(rideId, "completed");
}

export async function deleteRide(rideId: string) {
    const rideRef = doc(db, "rides", rideId);
    await deleteDoc(rideRef);
}

// ==================== PeerPool REVIEWS ====================

export interface RideReview {
    id?: string;
    rideId: string;
    reviewerId: string;
    reviewerName: string;
    reviewerPhoto: string;
    targetId: string;          // driver or rider being reviewed
    rating: number;            // 1-5
    comment: string;
    createdAt: Timestamp | null;
}

export async function submitReview(review: Omit<RideReview, "id" | "createdAt">) {
    const reviewsRef = collection(db, "reviews");
    await addDoc(reviewsRef, { ...review, createdAt: serverTimestamp() });
    // Update the target user's rating
    await updateUserRating(review.targetId, review.rating);
}

export async function getDriverReviews(driverId: string): Promise<RideReview[]> {
    const reviewsRef = collection(db, "reviews");
    const q = query(reviewsRef, where("targetId", "==", driverId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as RideReview));
}

export async function hasReviewedRide(rideId: string, reviewerId: string): Promise<boolean> {
    const reviewsRef = collection(db, "reviews");
    const q = query(reviewsRef, where("rideId", "==", rideId), where("reviewerId", "==", reviewerId));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
}

// ==================== REALTIME LISTENERS ====================

export function onRideUpdate(rideId: string, callback: (ride: Ride | null) => void) {
    const rideRef = doc(db, "rides", rideId);
    return onSnapshot(rideRef, (snap) => {
        if (snap.exists()) {
            callback({ id: snap.id, ...snap.data() } as Ride);
        } else {
            callback(null);
        }
    });
}

export function onAvailableRidesUpdate(callback: (rides: Ride[]) => void) {
    const ridesRef = collection(db, "rides");
    const q = query(ridesRef, where("status", "==", "open"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Ride)));
    });
}

export function onUserRidesUpdate(uid: string, callback: (rides: Ride[]) => void) {
    const ridesRef = collection(db, "rides");
    const q = query(ridesRef, where("driverId", "==", uid));
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Ride)));
    });
}

export function onRiderBookingsUpdate(uid: string, callback: (rides: Ride[]) => void) {
    const ridesRef = collection(db, "rides");
    const q = query(ridesRef, where("passengers", "array-contains", uid));
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Ride)));
    });
}

// ==================== PeerPool REQUESTS (Uber model) ====================
// Riders post requests → Drivers see and accept → Rider pays escrow → Driver completes

export interface RideRequest {
    id?: string;
    riderId: string;
    riderName: string;
    riderPhoto: string;
    riderWallet?: string;
    pickup: string;
    dropoff: string;
    distance: number;
    baseFare: number;
    fare: number;          // total per seat fare in ALGO
    seats: number;
    departureTime: string;
    departureDate: string;
    status: "pending" | "accepted" | "confirmed" | "in-progress" | "completed" | "cancelled";
    // Filled when driver accepts:
    driverId?: string;
    driverName?: string;
    driverPhoto?: string;
    driverWallet?: string;
    carModel?: string;
    carColor?: string;
    licensePlate?: string;
    carType?: string;
    // Blockchain IDs
    onChainId?: number;     // set by driver on accept (create_ride tx)
    txId?: string;          // driver's create_ride transaction
    payTxId?: string;       // rider's join_ride (payment) transaction
    createdAt: Timestamp | null;
    completedAt?: Timestamp | null;
}

export async function postRideRequest(req: Omit<RideRequest, "id" | "createdAt">) {
    const ref = collection(db, "rideRequests");
    const docRef = await addDoc(ref, { ...req, createdAt: serverTimestamp() });
    return docRef.id;
}

export async function acceptRideRequest(
    requestId: string,
    driverId: string,
    driverName: string,
    driverPhoto: string,
    driverWallet: string,
    carModel: string,
    carColor: string,
    licensePlate: string,
    carType: string,
    onChainId: number,
    txId: string
) {
    const ref = doc(db, "rideRequests", requestId);
    await updateDoc(ref, {
        status: "accepted",
        driverId, driverName, driverPhoto, driverWallet,
        carModel, carColor, licensePlate, carType,
        onChainId, txId,
    });
}

export async function confirmRideRequest(requestId: string, payTxId: string) {
    const ref = doc(db, "rideRequests", requestId);
    await updateDoc(ref, { status: "confirmed", payTxId });
}

export async function startRideRequest(requestId: string) {
    const ref = doc(db, "rideRequests", requestId);
    await updateDoc(ref, { status: "in-progress" });
}

export async function completeRideRequest(requestId: string) {
    const ref = doc(db, "rideRequests", requestId);
    await updateDoc(ref, { status: "completed", completedAt: serverTimestamp() });
}

export async function cancelRideRequest(requestId: string) {
    const ref = doc(db, "rideRequests", requestId);
    await updateDoc(ref, { status: "cancelled" });
}

export function onPendingRequestsUpdate(callback: (requests: RideRequest[]) => void) {
    const q = query(
        collection(db, "rideRequests"),
        where("status", "==", "pending"),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as RideRequest)));
    });
}

export function onDriverActiveRequestsUpdate(driverId: string, callback: (requests: RideRequest[]) => void) {
    const q = query(
        collection(db, "rideRequests"),
        where("driverId", "==", driverId)
    );
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as RideRequest)));
    });
}

export function onRiderRequestsUpdate(riderId: string, callback: (requests: RideRequest[]) => void) {
    const q = query(
        collection(db, "rideRequests"),
        where("riderId", "==", riderId),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as RideRequest)));
    });
}

export { auth, db };
