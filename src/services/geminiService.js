import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// System prompt for the NeighbourLend Chatbot
const SYSTEM_PROMPT = `
You are the official NeighbourLend Assistant, a helpful AI built for a hyperlocal peer-to-peer lending platform in gated communities.
Your job is to assist users with:
1. Understanding how the platform works.
2. Resolving minor disputes or answering rules questions (e.g. 25% security deposit).
3. Suggesting fair rental prices for items.

Rules:
- Be concise, friendly, and use emojis.
- If they ask about disputes, tell them to use the "Dispute" button on the Return screen, and an Admin will review the photos.
- The platform charges a 10% commission on rental fees (not deposits).
- Deposits are automatically fully refunded if the item is returned in 'Good Condition'.
`;

export const getChatbotResponse = async (userMessage, conversationHistory = []) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Convert our message format to Gemini's expected format
        const history = conversationHistory.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: "System prompt instructions: " + SYSTEM_PROMPT }] },
                { role: "model", parts: [{ text: "Understood. I will act as the NeighbourLend Assistant." }] },
                ...history
            ],
            generationConfig: {
                maxOutputTokens: 250,
            },
        });

        const result = await chat.sendMessage(userMessage);
        return result.response.text();
    } catch (error) {
        console.error("Gemini Chatbot Error:", error);
        return "Sorry, I'm having trouble connecting to my brain right now! Please try again later.";
    }
};

export const getPriceSuggestion = async (itemCategory, itemDescription) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `As a pricing expert for a peer-to-peer lending app in India, suggest a fair hourly rental price range in INR (₹) for the following item. 
        Category: ${itemCategory}
        Description: ${itemDescription}
        
        Respond ONLY with a realistic price range format, e.g., "₹50 - ₹100/hr". Do not add any conversational text.`;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error("Gemini Pricing Error:", error);
        return "₹--/hr";
    }
};

export const getTrustSummary = async (trustScoreObj) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `Convert this user's platform trust metrics into a 1-2 sentence compelling summary:
        Total Transactions: ${trustScoreObj.totalTransactions || trustScoreObj.transactions?.length || 0}
        Average Rating: ${trustScoreObj.avgRating || 5.0}/5.0
        Return Rate: ${trustScoreObj.returnRate || 100}%
        
        Example output: "Highly reliable neighbor with 15 successful borrows and a perfect 5.0 rating."
        Be natural and encouraging.`;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error("Gemini Trust Summary Error:", error);
        return "Trusted community member.";
    }
};
