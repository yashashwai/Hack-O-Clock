import { collection, addDoc, serverTimestamp, doc, updateDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-hot-toast';

// When a lender accepts a borrower's open request
export const acceptRequest = async (requestId, requestData, lenderId, lenderData) => {
    try {
        console.log("acceptRequest: Starting with", { requestId, requestData, lenderId, lenderData });

        // 1. Update the Request to "accepted"
        console.log("acceptRequest: Updating request doc status...");
        const reqRef = doc(db, "requests", requestId);
        await updateDoc(reqRef, {
            status: "accepted"
        });
        console.log("acceptRequest: Successfully updated request doc!");

        // 2. Calculate collateral based on item value logic, or just a placeholder for now
        // For MVP, we let the lender decide the item value at PreHandover, so collateral is null initially.

        // 3. Create a new Transaction record
        console.log("acceptRequest: Creating transaction record...");
        const newTx = {
            requestId: requestId,
            borrowerId: requestData.borrowerId || "unknown_borrower",
            borrowerName: requestData.borrowerName || "Unknown",
            lenderId: lenderId,
            lenderName: lenderData?.name || "Anonymous",
            communityId: requestData.communityId || null,

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
            createdAt: Date.now(),
            collectedAt: null,
            returnedAt: null,

            // Snapshot of request details for easy rendering
            itemCategory: requestData.category || "General",
            durationHours: requestData.durationHours || 24
        };
        console.log("acceptRequest: newTx payload:", newTx);

        const txRef = await addDoc(collection(db, "transactions"), newTx);
        console.log("acceptRequest: Successfully created transaction doc with ID:", txRef.id);

        // Wait extremely slightly to make sure the network propagates
        await new Promise(r => setTimeout(r, 200));

        toast.success("Request accepted! Waiting for borrower's deposit.");
        return txRef.id;
    } catch (error) {
        console.error("Error accepting request in step:", error);
        toast.error(`Failed to accept request: ${error.message || error}`);
        throw error;
    }
};

// Listen to transactions where the user is the Borrower
export const subscribeToBorrowerTransactions = (userId, callback) => {
    if (!userId) return () => { };
    const q = query(
        collection(db, "transactions"),
        where("borrowerId", "==", userId)
    );
    return onSnapshot(q, (snapshot) => {
        const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        txs.sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : a.createdAt;
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : b.createdAt;
            return (timeB || 0) - (timeA || 0);
        });
        callback(txs);
    });
};

// Listen to transactions where the user is the Lender
export const subscribeToLenderTransactions = (userId, callback) => {
    if (!userId) return () => { };
    const q = query(
        collection(db, "transactions"),
        where("lenderId", "==", userId)
    );
    return onSnapshot(q, (snapshot) => {
        const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        txs.sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : a.createdAt;
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : b.createdAt;
            return (timeB || 0) - (timeA || 0);
        });
        callback(txs);
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
