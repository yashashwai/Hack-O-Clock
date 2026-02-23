import { updateTransaction } from "./transactionService";

// Helper function to mock a 2-second processing delay
const delay = (ms) => new Promise(res => setTimeout(res, ms));

export const processMockRazorpayPayment = async (transactionId, amount, paymentType) => {
    console.log(`[Mock Razorpay] Initiating ${paymentType} payment of ₹${amount} for Tx ${transactionId}`);

    // Simulate Razorpay UI opening and processing
    await delay(2000);

    const mockPaymentId = `pay_mock_${Math.random().toString(36).substr(2, 9)}`;
    const updates = {};

    if (paymentType === 'collateral') {
        updates.razorpayCollateralPaymentId = mockPaymentId;
        updates.collateralStatus = 'held';
        updates.status = 'rental_pending';
    } else if (paymentType === 'rental') {
        updates.razorpayRentalPaymentId = mockPaymentId;
        updates.status = 'active'; // Timer starts now
        updates.collectedAt = new Date(); // Using local timestamp for simplicity in mock
    }

    // Update Firestore to reflect the successful payment
    await updateTransaction(transactionId, updates);
    console.log(`[Mock Razorpay] Payment ${paymentType} successful. ID: ${mockPaymentId}`);

    return mockPaymentId;
};
