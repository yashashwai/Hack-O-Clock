import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI('AIzaSyBjV16tS9KUL_-d_reAyCMz3YmPcyIJdL8');
async function run() {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        const result = await model.generateContent("hello");
        console.log("Success with gemini-flash-latest:", result.response.text());
    } catch(err) {
        console.error("error:", err.message);
    }
}
run();
