import { collection, addDoc, serverTimestamp, doc, updateDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-hot-toast';

// When a lender accepts a borrower's open request
export const acceptRequest = async (requestId, requestData, lenderId, lenderData) => {
    try {
        // 1. Update the Request to "accepted"
        const reqRef = doc(db, "requests", requestId);
        await updateDoc(reqRef, {
            status: "accepted"
        });

        // 2. Calculate collateral based on item value logic, or just a placeholder for now
        // For MVP, we let the lender decide the item value at PreHandover, so collateral is null initially.

        // 3. Create a new Transaction record
        const newTx = {
            requestId: requestId,
            borrowerId: requestData.borrowerId,
            borrowerName: requestData.borrowerName,
            lenderId: lenderId,
            lenderName: lenderData.name || "Anonymous",
            communityId: requestData.communityId,

            // Photos
            preHandoverPhotoURL: null,
            postReturnPhotoURL: null,

            // Core States
            condition: null, // "good", "minor", "major"
            status: "deposit_pending", // deposit_pending -> rental_pending -> active -> return_pending -> completed/disputed
            collateralStatus: "pending", // pending -> held -> refunded_to_borrower / sent_to_lender

            // Financials
            itemValue: null,
            rentalAmount: null,
            collateralAmount: null,
            platformCommission: null,
            razorpayCollateralPaymentId: null,
            razorpayRentalPaymentId: null,

            // Timestamps
            createdAt: serverTimestamp(),
            collectedAt: null,
            returnedAt: null,

            // Snapshot of request details for easy rendering
            itemCategory: requestData.category,
            durationHours: requestData.durationHours
        };

        const txRef = await addDoc(collection(db, "transactions"), newTx);
        toast.success("Request accepted! Waiting for borrower's deposit.");
        return txRef.id;
    } catch (error) {
        console.error("Error accepting request:", error);
        toast.error("Failed to accept request");
        throw error;
    }
};

// Listen to transactions where the user is the Borrower
export const subscribeToBorrowerTransactions = (userId, callback) => {
    if (!userId) return () => { };
    const q = query(
        collection(db, "transactions"),
        where("borrowerId", "==", userId),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
};

// Listen to transactions where the user is the Lender
export const subscribeToLenderTransactions = (userId, callback) => {
    if (!userId) return () => { };
    const q = query(
        collection(db, "transactions"),
        where("lenderId", "==", userId),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
        callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
};

// Update transaction status generic helper
export const updateTransaction = async (transactionId, updates) => {
    try {
        const txRef = doc(db, "transactions", transactionId);
        await updateDoc(txRef, updates);
    } catch (error) {
        console.error("Error updating transaction:", error);
        throw error;
    }
};
