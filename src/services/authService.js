import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, provider, db } from '../firebase/config';
import { toast } from 'react-hot-toast';

export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user exists in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // Create new user profile
            await setDoc(userDocRef, {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                communityId: null, // To be set during onboarding
                room: '',
                block: '',
                phone: '',
                digilockerVerified: false,
                trustScore: {
                    avgRating: 5.0,
                    totalTransactions: 0,
                    returnRate: 100,
                    avgResponseTime: 100
                },
                trustTier: "New User",
                createdAt: Date.now(),
            });
            console.log("New user created in Firestore!");
            return { user, isNew: true };
        } else {
            console.log("Existing user logged in.");
            return { user: { ...user, ...userDoc.data() }, isNew: false };
        }
    } catch (error) {
        console.error("Error signing in with Google:", error);
        toast.error(`Sign in failed: ${error.message}`);
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        toast.success("Logged out successfully");
    } catch (error) {
        console.error("Error signing out:", error);
        toast.error("Failed to sign out");
        throw error;
    }
};
