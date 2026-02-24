import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Recalculates the user's trust score based on the transaction outcome
export const recalculateTrustScore = async (userId, rating, wentWell, responseTime) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) return;

        const userData = userDoc.data();
        const currentScore = userData.trustScore || {
            avgRating: 5.0,
            totalTransactions: 0,
            returnRate: 100,
            avgResponseTime: 100,
            S: 0, L: 0, D: 0, C: 0, T: 0
        };

        // We receive outcomeType as 'success', 'late', 'damage', or 'cancellation'
        // 'rating' and 'wentWell' arguments are kept for backward compatibility if needed, 
        // but outcomeType is passed as the second argument now.
        const actualOutcome = typeof rating === 'string' ? rating : (wentWell ? 'success' : 'damage');

        let S = currentScore.S || 0;
        let L = currentScore.L || 0;
        let D = currentScore.D || 0;
        let C = currentScore.C || 0;
        let T = currentScore.T || 0;

        // Apply new metrics
        if (actualOutcome === 'success') S++;
        else if (actualOutcome === 'late') L++;
        else if (actualOutcome === 'damage') D++;
        else if (actualOutcome === 'cancellation') C++;

        // Any of the above is a transaction attempt
        T++;

        // Apply formula requested by user: Trust score = ((S + 1) / (T + 2)) * 100
        const finalScore = Math.round(((S + 1) / (T + 2)) * 100);

        // Determine Tier
        let newTier = "New User";
        if (finalScore >= 80) newTier = "Community Star";
        else if (finalScore >= 60) newTier = "Verified";
        else if (finalScore >= 30) newTier = "Trusted";

        // Update Firestore
        await updateDoc(userRef, {
            trustScore: {
                ...currentScore,
                overall: finalScore,
                totalTransactions: T, // legacy map
                S, L, D, C, T
            },
            trustTier: newTier
        });

        console.log(`Trust score for ${userId} recalculated to ${finalScore} (${newTier})`);

    } catch (error) {
        console.error("Error recalculating trust score:", error);
    }
};
