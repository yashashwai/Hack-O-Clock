import { useState } from "react";
import { Sparkles, MessageCircle, X } from "lucide-react";
import { getSupportResponse } from '../services/geminiService';

export default function Chatbot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "model", parts: [{ text: "Hi! I'm the NeighbourLend assistant. How can I help you today?" }] }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { role: "user", parts: [{ text: input }] };
        const history = [...messages, userMsg];
        setMessages(history);
        setInput("");
        setIsLoading(true);

        try {
            // Get all past chat messages, excluding the first static dummy welcome message
            const apiHistory = messages.slice(1).map(m => ({
                role: m.role,
                parts: [{ text: m.parts[0].text }]
            }));

            // Pass the user input and the cleaned history directly to the dedicated service
            const replyText = await getSupportResponse(input, apiHistory);

            setMessages([...history, { role: "model", parts: [{ text: replyText }] }]);
        } catch (err) {
            console.error("Chatbot Error:", err);
            setMessages([...history, {
                role: "model", parts: [{
                    text: `Oops, I'm having trouble connecting right now. 
            
Error: ${err.message}`
                }]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-4 z-[60]">
            {open && (
                <div className="w-[calc(100vw-32px)] sm:w-80 h-96 bg-white rounded-2xl shadow-xl flex flex-col mb-4 overflow-hidden border border-gray-100">
                    <div className="bg-dark p-3 text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Sparkles size={18} className="text-primary" />
                            <span className="font-bold">Support Assistant</span>
                        </div>
                        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto bg-surface space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${m.role === "user"
                                    ? "bg-primary text-black rounded-tr-none"
                                    : "bg-white text-dark shadow-sm rounded-tl-none border border-gray-100"
                                    }`}>
                                    {m.parts[0].text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="p-3 bg-white text-dark shadow-sm rounded-2xl rounded-tl-none border border-gray-100 flex gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && sendMessage()}
                            placeholder="Ask a question..."
                            className="flex-1 bg-surface border-none rounded-pill px-4 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                        <button
                            onClick={sendMessage}
                            className="w-10 h-10 bg-dark text-white rounded-full flex items-center justify-center hover:bg-black"
                        >
                            <MessageCircle size={18} />
                        </button>
                    </div>
                </div>
            )}

            <button
                onClick={() => setOpen(!open)}
                className="bg-primary text-black w-[60px] h-[60px] rounded-full text-2xl shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 border-2 border-white"
            >
                🤖
            </button>
        </div>
    );
}
