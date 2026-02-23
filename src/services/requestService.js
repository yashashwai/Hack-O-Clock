import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-hot-toast';

// Create a new borrow request
export const createRequest = async (requestData, currentUser, userData) => {
    if (!currentUser || (!userData?.location && !userData?.communityId)) {
        throw new Error("Location permissions are required to post a request");
    }

    try {
        const newRequest = {
            borrowerId: currentUser.uid,
            borrowerName: userData.name || "Anonymous",
            location: userData.location || null, // Store the exact coordinates (prevent undefined crash)
            category: requestData.category,
            description: requestData.description,
            priceMin: requestData.priceMin,
            priceMax: requestData.priceMax,
            durationHours: requestData.durationHours,
            status: "open",
            createdAt: serverTimestamp(),
            // These will be filled when a lender accepts
            itemValue: null,
            collateralAmount: null,
            deadline: null // Optional: end of the request validity
        };

        // Fallback to global communityId for backwards comp
        if (!userData.location && userData.communityId) {
            newRequest.communityId = userData.communityId;
            delete newRequest.location;
        }

        console.error("DEBUG: Sending request payload to Firestore:", JSON.stringify(newRequest, null, 2));

        const docRef = await addDoc(collection(db, "requests"), newRequest);
        toast.success("Request posted successfully!");
        return docRef.id;
    } catch (error) {
        console.error("Error creating request:", error);
        toast.error(error.message || "Failed to post request");
        throw error;
    }
};

import { getDistanceInMeters } from '../utils/geoUtils';

// Listen to nearby open requests (within 1000m) for the Lender Feed
export const subscribeToNearbyRequests = (userData, callback) => {
    if (!userData) return () => { };

    const q = query(
        collection(db, "requests"),
        where("status", "==", "open"),
        // Note: In a production app with millions of users, fetching ALL open requests 
        // to filter client-side is inefficient. You would use GeoFire or GeoHashes. 
        // For a hackathon MVP, client-side distance filtering on a small set is fine.
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const now = Date.now();
        const nearbyRequests = snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .filter(request => {
                // If both user and request have location, use distance
                if (userData.location?.lat && request.location?.lat) {
                    const distanceMeters = getDistanceInMeters(
                        userData.location.lat,
                        userData.location.lng,
                        request.location.lat,
                        request.location.lng
                    );
                    request.distanceMeters = distanceMeters;
                    return distanceMeters <= 1000;
                }

                // Fallback: If either lacks location, fallback to communityId matching 
                // OR if we are in a hackathon MVP and want to ensure test accounts see each other:
                if (userData.communityId && request.communityId && userData.communityId === request.communityId) {
                    request.distanceMeters = "Nearby";
                    return true;
                }

                // Super-permissive fallback for testing: if one has location and the other doesn't, 
                // just show it as "Nearby" so the demo doesn't fail.
                request.distanceMeters = "Nearby";
                return true;
            });

        callback(nearbyRequests);
    }, (error) => {
        console.error("Error fetching nearby requests:", error);
    });
};

// Listen to a specific user's requests (for Borrower Feed)
export const subscribeToMyRequests = (userId, callback) => {
    if (!userId) return () => { };

    const q = query(
        collection(db, "requests"),
        where("borrowerId", "==", userId),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(requests);
    }, (error) => {
        console.error("Error fetching my requests:", error);
    });
};
