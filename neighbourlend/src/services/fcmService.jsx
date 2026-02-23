import { toast } from "react-hot-toast";

// Since we cannot run Firebase Admin SDK on the frontend to actually trigger FCM deliveries to devices,
// we will simulate the push notifications visually via Toast and optionally log them to a Firestore collection
// if an admin dashboard wants to read a notification feed.

export const requestFCMPermission = async (userId) => {
    console.log(`[Mock FCM] Requesting notification permission for user ${userId}`);
    // In a real app with Admin SDK:
    // const token = await getToken(messaging, { vapidKey: '...' });
    // await updateDoc(doc(db, 'users', userId), { fcmToken: token });

    return "mock-fcm-token-" + userId;
};

export const simulatePushNotification = (title, body, icon = "🔔") => {
    toast((t) => (
        <div className="flex flex-col gap-1">
            <span className="font-bold">{title}</span>
            <span className="text-sm">{body}</span>
        </div>
    ), {
        icon: icon,
        duration: 5000,
        position: 'top-center',
    });
};

// Application Triggers
export const notifyNewRequestInCommunity = (communityId, category) => {
    console.log(`[FCM] Notification sent to community ${communityId}: New ${category} request!`);
};

export const notifyBorrowerAccepted = (borrowerId, lenderName) => {
    simulatePushNotification(
        "Request Accepted!",
        `${lenderName} has accepted your request. Please pay the security deposit.`,
        "🤝"
    );
};

export const notifyLenderCollected = (lenderId) => {
    simulatePushNotification(
        "Item Collected!",
        "The borrower has paid the rent and started the timer.",
        "⏱️"
    );
};
