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
export const subscribeToNearbyRequests = (userLocation, callback) => {
    if (!userLocation?.lat || !userLocation?.lng) return () => { };

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
                if (!request.location?.lat) return false;

                const distanceMeters = getDistanceInMeters(
                    userLocation.lat,
                    userLocation.lng,
                    request.location.lat,
                    request.location.lng
                );

                // Add distance to the request object so the UI can display it
                request.distanceMeters = distanceMeters;

                return distanceMeters <= 1000;
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
