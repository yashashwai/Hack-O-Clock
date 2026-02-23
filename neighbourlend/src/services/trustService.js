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
            avgResponseTime: 100
        };

        // Recalculate metrics
        const newTotal = currentScore.totalTransactions + 1;

        // Simple moving average for rating
        const newAvgRating = ((currentScore.avgRating * currentScore.totalTransactions) + rating) / newTotal;

        // Return rate: wentWell counts as a successful return (100) vs disputed (0)
        const returnScore = wentWell ? 100 : 0;
        const newReturnRate = ((currentScore.returnRate * currentScore.totalTransactions) + returnScore) / newTotal;

        // Response time (placeholder logic: keeping current average for simplicity, would ideally log actual times)
        const newResponseTimeScore = currentScore.avgResponseTime;

        // Calculate final weighted score (0-100)
        // avgRating (out of 5 -> scale to 100) × 0.40
        const weightRating = (newAvgRating / 5) * 100 * 0.40;

        // totalTransactions (cap at 10 for max score impact) × 0.30
        const weightTxps = Math.min((newTotal / 10) * 100, 100) * 0.30;

        // returnRate × 0.20
        const weightReturn = newReturnRate * 0.20;

        // avgResponseTime score × 0.10
        const weightResponse = newResponseTimeScore * 0.10;

        const finalScore = Math.round(weightRating + weightTxps + weightReturn + weightResponse);

        // Determine Tier
        let newTier = "New User";
        if (finalScore > 80) newTier = "Community Star";
        else if (finalScore > 60) newTier = "Verified";
        else if (finalScore > 30) newTier = "Trusted";

        // Update Firestore
        await updateDoc(userRef, {
            trustScore: {
                avgRating: parseFloat(newAvgRating.toFixed(1)),
                totalTransactions: newTotal,
                returnRate: parseFloat(newReturnRate.toFixed(1)),
                avgResponseTime: newResponseTimeScore,
                overall: finalScore
            },
            trustTier: newTier
        });

        console.log(`Trust score for ${userId} recalculated to ${finalScore} (${newTier})`);

    } catch (error) {
        console.error("Error recalculating trust score:", error);
    }
};
