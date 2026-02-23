import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Shield, AlertTriangle, Search, Filter, Bot, Sparkles } from 'lucide-react';
import { getTrustSummary } from '../services/geminiService';

const stats = [
    { label: 'Active Borrows', value: '12' },
    { label: 'Completed Today', value: '8' },
    { label: 'Flagged / Overdue', value: '2', alert: true },
];

const transactions = [
    { id: 'TXN-101', borrower: 'Rahul(A105)', lender: 'Amit(B201)', item: 'Drill Machine', status: 'Overdue', time: '2h ago' },
    { id: 'TXN-102', borrower: 'Priya(C302)', lender: 'Neha(A401)', item: 'Hair Dryer', status: 'Completed', time: '5h ago' },
    { id: 'TXN-103', borrower: 'Yasha(A204)', lender: 'Sid(B112)', item: 'DSLR Camera', status: 'Active', time: '1h ago' },
];

export default function Admin() {
    const [search, setSearch] = useState('');
    const [summary, setSummary] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateSummary = async () => {
        setIsGenerating(true);
        const toastId = toast.loading("AI is analyzing community activity...");

        try {
            // Mocking the user data to send to Gemini
            const mockData = {
                name: "Community Overdue Report",
                trustScore: 85,
                transactions: [
                    { status: 'overdue', item: 'Drill', daysLate: 2 },
                    { status: 'completed', item: 'Hair Dryer' },
                    { status: 'active', item: 'Camera' }
                ]
            };

            const result = await getTrustSummary(mockData);
            setSummary(result);
            toast.success("Summary generated!", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate summary.", { id: toastId });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-surface min-h-[calc(100vh-72px)] flex flex-col font-sans">
            {/* Header */}
            <header className="px-6 py-6 flex justify-between items-center bg-white shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-dark text-white flex items-center justify-center relative">
                        <Shield size={20} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-22pt font-bold text-dark leading-tight">Admin</h1>
                        <p className="text-gray-500 text-sm">Sunrise Towers</p>
                    </div>
                </div>
                <button
                    onClick={() => toast('Logout functionality coming soon')}
                    className="text-sm font-bold text-gray-500 hover:text-dark px-3 py-1 rounded-md transition-colors"
                >
                    Logout
                </button>
            </header>

            <main className="flex-1 px-6 pb-8 space-y-6 overflow-y-auto mt-4">
                {/* AI Summary Section */}
                <section className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <Bot size={20} className="text-primary-dark" />
                            <h3 className="font-bold text-dark">AI Community Insights</h3>
                        </div>
                        {summary && <Sparkles size={16} className="text-primary-dark" />}
                    </div>

                    {summary ? (
                        <div className="mt-2 text-sm text-dark bg-white/50 p-3 rounded-lg border border-primary/10 shadow-sm whitespace-pre-line">
                            {summary}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-600 mt-1 mb-3">
                            Generate an AI summary of current overdue items and community health.
                        </p>
                    )}

                    {!summary && (
                        <button
                            onClick={handleGenerateSummary}
                            disabled={isGenerating}
                            className="text-sm font-bold bg-white border border-primary shadow-sm hover:bg-primary/10 text-primary-dark px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isGenerating ? "Analyzing..." : "Generate AI Summary"}
                        </button>
                    )}
                </section>

                {/* Escalation Alert */}
                <section className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 shadow-sm">
                    <AlertTriangle className="text-red-500 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="font-bold text-red-800">2 Items Overdue</h3>
                        <p className="text-sm text-red-600 mt-1">Rahul (A105) and Sneha (C402) have exceeded their borrow limits. Please review.</p>
                        <button
                            onClick={() => toast('Opening escalation details...')}
                            className="mt-2 text-sm font-bold text-red-700 bg-red-100 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
                        >
                            View Details
                        </button>
                    </div>
                </section>

                {/* Stats Row */}
                <section className="grid grid-cols-3 gap-3">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-dark rounded-xl p-4 text-center shadow-md relative overflow-hidden">
                            <span className={`text-3xl font-black block ${stat.alert ? 'text-red-400' : 'text-white'}`}>
                                {stat.value}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </section>

                {/* Search & Filter */}
                <section className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search specific user or room..."
                            className="w-full bg-white border border-gray-200 rounded-pill py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => toast('Filter options opening...')}
                        className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 shadow-sm hover:bg-surface transition-colors"
                    >
                        <Filter size={20} />
                    </button>
                </section>

                {/* Transaction Table */}
                <section>
                    <div className="flex justify-between items-end mb-4">
                        <h2 className="text-16pt font-bold text-dark">Recent Transactions</h2>
                        <span className="text-xs text-gray-400">Read-only history</span>
                    </div>

                    <div className="space-y-3">
                        {transactions.map(txn => (
                            <div key={txn.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-gray-400">{txn.id}</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${txn.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                                            txn.status === 'Completed' ? 'bg-dark text-white' :
                                                'bg-primary/20 text-primary-dark'
                                            }`}>
                                            {txn.status}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-400">{txn.time}</span>
                                </div>

                                <h3 className="font-bold text-dark">{txn.item}</h3>

                                <div className="flex items-center gap-4 text-sm text-gray-600 bg-surface p-2 rounded-lg">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 uppercase">Borrower</span>
                                        <span className="font-medium">{txn.borrower}</span>
                                    </div>
                                    <span className="text-gray-300">→</span>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 uppercase">Lender</span>
                                        <span className="font-medium">{txn.lender}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
