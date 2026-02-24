import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Package, Clock, ShieldCheck, CreditCard, CheckCircle2, Camera, Bot, Sparkles } from 'lucide-react';
import { subscribeToMyRequests } from '../services/requestService';
import { useAuth } from '../contexts/AuthContext';
import { getTrustSummary } from '../services/geminiService';

export default function Borrower() {
    const navigate = useNavigate();
    const { currentUser, userData } = useAuth();
    const [requests, setRequests] = useState([]);
    const [aiSummary, setAiSummary] = useState(null);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);

    useEffect(() => {
        if (!currentUser) return;

        // Subscribe to live requests for this user
        const unsubscribe = subscribeToMyRequests(currentUser.uid, (fetchedReqs) => {
            // Map Firestore data to the UI format expected by the template
            const formatted = fetchedReqs.map(req => {
                let actionText = 'Waiting for details...';
                if (req.status === 'open') actionText = 'Waiting for a lender to accept...';
                else if (req.status === 'accepted') actionText = 'Lender accepted. Waiting for handover setup...';
                else if (req.status === 'deposit_pending') actionText = 'Pay your security deposit to collect';
                else if (req.status === 'rental_pending') actionText = 'Pay rental fee to start the timer';
                else if (req.status === 'active') actionText = 'Item collected — timer running';
                else if (req.status === 'return_pending') actionText = 'Returned! Awaiting lender confirmation';
                else if (req.status === 'completed') actionText = 'Returned safely — collateral refunded';

                return {
                    id: req.id,
                    item: req.category, // Fallback if no specific title exists
                    status: req.status,
                    lenderName: req.lenderName,
                    actionText
                };
            });
            setRequests(formatted);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleGenerateInsights = async () => {
        if (!userData) return;
        setIsGeneratingAi(true);
        const toastId = toast.loading("AI is generating your profile insights...");

        try {
            // Mocking the user data to send to Gemini based on active requests
            const activeCount = requests.filter(r => r.status === 'active').length;
            const completedCount = requests.filter(r => r.status === 'completed').length;

            const mockData = {
                name: userData.name || "User",
                trustScore: userData.trustScore || 100,
                transactions: [
                    { status: 'completed', count: completedCount },
                    { status: 'active', count: activeCount }
                ]
            };

            const result = await getTrustSummary(mockData);
            setAiSummary(result);
            toast.success("Insights ready!", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate insights.", { id: toastId });
        } finally {
            setIsGeneratingAi(false);
        }
    };

    const getStatusUI = (status) => {
        switch (status) {
            case 'open':
                return { icon: Clock, color: 'text-gray-400' };
            case 'accepted':
                return { icon: Camera, color: 'text-yellow-500' };
            case 'deposit_pending':
                return { icon: ShieldCheck, color: 'text-red-500' };
            case 'rental_pending':
                return { icon: CreditCard, color: 'text-green-500' };
            case 'active':
                return { icon: Clock, color: 'text-green-500' };
            case 'return_pending':
                return { icon: ShieldCheck, color: 'text-purple-500' };
            case 'completed':
                return { icon: CheckCircle2, color: 'text-green-500' };
            default:
                return { icon: Clock, color: 'text-gray-400' };
        }
    };

    const handleCardClick = (req) => {
        // Navigation logic based on status
        if (req.status === 'deposit_pending') {
            toast('Navigating to collateral payment screen...', { icon: '💳' });
            navigate(`/payment/collateral/${req.id}`);
        } else if (req.status === 'rental_pending') {
            toast('Navigating to rental payment screen...', { icon: '💸' });
            navigate(`/payment/rental/${req.id}`);
        } else if (req.status === 'active') {
            toast('Opening active loan timer...', { icon: '⏱️' });
            navigate(`/active/${req.id}`);
        } else if (req.status === 'completed') {
            toast('Viewing Return Proof Gallery...', { icon: '📸' });
            navigate('/gallery');
        } else if (req.status === 'open' || req.status === 'accepted') {
            navigate(`/borrower/waiting/${req.status}/${req.id}`);
        } else if (req.status === 'return_pending') {
            toast.success("Waiting for the lender to confirm your return.");
        } else {
            toast(`Viewing details for ${req.item}`);
        }
    };

    return (
        <div className="bg-surface min-h-[calc(100vh-72px)] flex flex-col font-sans">
            <header className="px-6 py-6 bg-white">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-28pt font-bold text-dark leading-tight">My Borrows</h1>
                        <p className="text-sm text-gray-500 mt-1">Track and manage your requests</p>
                    </div>
                </div>

                {/* AI Insights Card */}
                {requests.length > 0 && (
                    <div className="mt-4 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 shadow-sm relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <Bot size={18} className="text-primary-dark" />
                                <h3 className="text-sm font-bold text-dark">AI Trust Profile</h3>
                            </div>
                            {aiSummary && <Sparkles size={14} className="text-primary-dark" />}
                        </div>

                        {aiSummary ? (
                            <div className="mt-2 text-xs text-dark bg-white/60 p-2.5 rounded-lg border border-primary/10 shadow-sm whitespace-pre-line leading-relaxed">
                                {aiSummary}
                            </div>
                        ) : (
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-gray-500 w-2/3">Generate a trust summary to share with potential lenders.</p>
                                <button
                                    onClick={handleGenerateInsights}
                                    disabled={isGeneratingAi}
                                    className="text-xs font-bold bg-white border border-primary text-primary-dark px-3 py-1.5 rounded-md shadow-sm disabled:opacity-50"
                                >
                                    {isGeneratingAi ? "Generating..." : "Generate"}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <button
                    onClick={() => {
                        toast('Opening request form...');
                        navigate('/request/new');
                    }}
                    className="w-full mt-5 bg-primary text-black font-bold py-4 rounded-pill flex items-center justify-center gap-3 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                    <Package size={22} className="stroke-2" />
                    <span className="text-lg">Post New Request</span>
                </button>
            </header>

            <main className="flex-1 px-4 pt-6 pb-28 overflow-y-auto space-y-4">
                {requests.length === 0 ? (
                    <div className="text-center py-10 opacity-70">
                        <Package size={48} className="mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">You don't have any active borrows.</p>
                    </div>
                ) : (
                    requests.map(req => {
                        const UI = getStatusUI(req.status);

                        return (
                            <div
                                key={req.id}
                                onClick={() => handleCardClick(req)}
                                className="bg-white rounded-2xl p-4 shadow-sm relative cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
                            >
                                {/* Top Right Icon */}
                                <div className="absolute top-4 right-4">
                                    <UI.icon size={22} className={UI.color} />
                                </div>

                                {/* Card Content */}
                                <div className="flex flex-col gap-1 pr-10">
                                    <span className="text-xs text-gray-400 font-medium">{req.id}</span>
                                    <h3 className="font-bold text-dark text-lg leading-tight mb-1">{req.item}</h3>

                                    {req.lenderName && (
                                        <p className="text-sm text-dark font-medium mb-1">
                                            Lender: <span className="font-normal">{req.lenderName}</span>
                                        </p>
                                    )}
                                </div>

                                <div className="mt-3 w-full">
                                    <button
                                        className={`w-full text-left text-sm font-bold px-4 py-3 rounded-xl transition-transform active:scale-95 flex items-center justify-between ${req.status === 'deposit_pending' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' :
                                            req.status === 'rental_pending' ? 'bg-primary text-black shadow-md shadow-primary/20' :
                                                req.status === 'active' ? 'bg-dark text-white border border-gray-700' :
                                                    req.status === 'return_pending' ? 'bg-purple-100 text-purple-700 text-xs' :
                                                        req.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                            'bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        <span>{req.actionText}</span>
                                        <span className="opacity-70 text-lg leading-none">→</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </main>
        </div>
    );
}
