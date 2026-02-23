import { useState, useRef, useEffect } from 'react';
import { Send, Shield, Search, Package, Check, Bot } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getChatbotResponse } from '../services/geminiService';

const initialMessages = [
    { id: 1, type: 'system', text: 'Rahul joined the community', time: '10:00 AM' },
    { id: 2, type: 'other', sender: 'Amit', room: 'B-201', text: 'Does anyone have a cycle pump?', time: '10:05 AM' },
    { id: 3, type: 'other', sender: 'NeighbourLend AI', isBot: true, text: 'Hi! I am the community assistant. Tag me if you have any questions!', time: '10:06 AM' }
];

export default function Chat() {
    const { userData } = useAuth();
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMsg = {
            id: Date.now(),
            type: 'self',
            text: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newMsg]);
        setInput('');

        // If the user mentions AI, triggers the Gemini bot
        if (input.toLowerCase().includes('ai') || input.toLowerCase().includes('bot') || input.toLowerCase().includes('help')) {
            setIsThinking(true);

            // Build simple context array
            const context = messages.filter(m => m.type !== 'system').map(m => ({
                sender: m.type === 'self' ? 'user' : 'model',
                text: m.text
            }));
            context.push({ sender: 'user', text: input });

            const responseText = await getChatbotResponse(input, context.slice(-5)); // Pass last 5 msgs

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'other',
                sender: 'NeighbourLend AI',
                isBot: true,
                text: responseText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);

            setIsThinking(false);
        }
    };

    const quickReplies = [
        { icon: Package, text: '📦 Lend' },
        { icon: Search, text: '🔍 Looking for...' },
        { icon: Check, text: '✅ Found it!' },
    ];

    return (
        <div className="bg-surface min-h-[calc(100vh-72px)] flex flex-col font-sans relative">
            {/* Header */}
            <header className="px-6 py-4 bg-white shadow-sm z-10 sticky top-0 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-18pt font-bold text-dark leading-tight">{userData?.communityId ? userData.communityId.replace('comm_', '') : 'Your Community'}</h1>
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-gray-500 text-sm">Active Members</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 bg-surface px-2 py-1 rounded-md">
                    <Shield size={12} /> Moderated
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 px-4 py-6 overflow-y-auto pb-32">
                <div className="flex justify-center mb-6">
                    <span className="text-xs text-gray-400 bg-gray-200 px-3 py-1 rounded-pill">Today</span>
                </div>

                <div className="space-y-4">
                    {messages.map((msg) => {
                        if (msg.type === 'system') {
                            return (
                                <div key={msg.id} className="flex justify-center">
                                    <span className="text-xs text-gray-500 bg-white border border-gray-100 px-4 py-1.5 rounded-pill shadow-sm">
                                        {msg.text}
                                    </span>
                                </div>
                            );
                        }

                        if (msg.type === 'other') {
                            return (
                                <div key={msg.id} className="flex gap-2 max-w-[85%]">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${msg.isBot ? 'bg-primary text-black' : 'bg-dark text-white'}`}>
                                        {msg.isBot ? <Bot size={16} /> : msg.sender.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-sm font-bold text-dark">{msg.sender}</span>
                                            {msg.room && <span className="text-xs text-gray-400">{msg.room}</span>}
                                        </div>
                                        <div className="bg-white p-3 rounded-2xl rounded-tl-none text-dark shadow-sm border border-gray-100">
                                            {msg.text}
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1 block px-1">{msg.time}</span>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={msg.id} className="flex justify-end pr-2">
                                <div className="max-w-[85%]">
                                    <div className="bg-primary text-black p-3 rounded-2xl rounded-tr-none shadow-sm">
                                        {msg.text}
                                    </div>
                                    <span className="text-[10px] text-gray-500 mt-1 block text-right pr-1">{msg.time}</span>
                                </div>
                            </div>
                        );
                    })}

                    {isThinking && (
                        <div className="flex gap-2 max-w-[85%]">
                            <div className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-bold text-xs flex-shrink-0">
                                <Bot size={16} />
                            </div>
                            <div>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-sm font-bold text-dark">NeighbourLend AI</span>
                                </div>
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none text-dark shadow-sm border border-gray-100">
                                    <span className="animate-pulse">Thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                {/* Quick Replies */}
                <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide px-1">
                    {quickReplies.map((reply, i) => (
                        <button
                            key={i}
                            onClick={() => setInput(reply.text)}
                            className="flex-shrink-0 flex items-center gap-1.5 bg-surface hover:bg-gray-200 text-dark px-3 py-1.5 rounded-pill text-sm font-medium transition-colors border border-gray-100"
                        >
                            <span>{reply.text}</span>
                        </button>
                    ))}
                </div>

                {/* Message Input */}
                <div className="flex gap-2 items-end">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask your community..."
                        className="flex-1 bg-surface border border-gray-200 rounded-pill py-3 px-5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-dark"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="w-12 h-12 rounded-full bg-primary text-black flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400 transition-colors shadow-sm"
                    >
                        <Send size={20} className={input.trim() ? "ml-1" : ""} />
                    </button>
                </div>
            </div>
        </div>
    );
}
