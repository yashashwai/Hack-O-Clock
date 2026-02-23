import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Sparkles, MapPin } from 'lucide-react';
import { subscribeToNearbyRequests } from '../services/requestService';
import { subscribeToLenderTransactions, acceptRequest } from '../services/transactionService';
import { notifyBorrowerAccepted } from '../services/fcmService.jsx';
import { useAuth } from '../contexts/AuthContext';

export default function Lender() {
    const navigate = useNavigate();
    const { currentUser, userData } = useAuth();
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [activeLoans, setActiveLoans] = useState([]);
    const [isAccepting, setIsAccepting] = useState(false);

    useEffect(() => {
        if (!currentUser || !userData?.location) return;

        // 1. Listen to all open requests within 1000m of the lender
        const unsubIncoming = subscribeToNearbyRequests(userData.location, (reqs) => {
            // Filter out the lender's OWN requests so they can't lend to themselves
            const othersReqs = reqs.filter(r => r.borrowerId !== currentUser.uid);

            setIncomingRequests(othersReqs.map(r => ({
                id: r.id,
                category: r.category,
                item: r.description.substring(0, 20) + '...', // Short title derived from description for MVP
                borrowerName: r.borrowerName,
                price: `₹${r.priceMin}-₹${r.priceMax}`,
                distanceMeters: r.distanceMeters,
                status: r.status,
                raw: r // keep full object for accepting
            })));
        });

        // 2. Listen to all active transactions where the user is the lender
        const unsubActive = subscribeToLenderTransactions(currentUser.uid, (txs) => {
            setActiveLoans(txs.map(t => ({
                id: t.id,
                requestId: t.requestId,
                item: t.itemCategory, // From snapshot
                borrowerName: t.borrowerName,
                status: t.status // deposit_pending, rental_pending, active, etc.
            })));
        });

        return () => {
            unsubIncoming();
            unsubActive();
        };
    }, [currentUser, userData]);

    const handleAccept = async (req) => {
        if (!currentUser || !userData) return;
        setIsAccepting(true);
        try {
            // Create transaction in DB
            const txId = await acceptRequest(req.id, req.raw, currentUser.uid, userData);

            // Mock FCM notification
            notifyBorrowerAccepted(req.raw.borrowerId, userData.name);

            // Go to pre-handover with the NEW transaction ID, not the request ID
            navigate(`/lender/pre-handover/${txId}`);
        } catch (error) {
            console.error(error);
        } finally {
            setIsAccepting(false);
        }
    };

    const handleSkip = (reqId) => {
        setIncomingRequests(prev => prev.filter(r => r.id !== reqId));
    };

    const handleActiveLoanClick = (loan) => {
        if (loan.status === 'return_pending') {
            toast('Taking you to return confirmation screen...', { icon: '📸' });
            navigate(`/lender/post-return/${loan.id}`);
        } else if (loan.status === 'awaiting_deposit') {
            toast('Checking deposit status...', { icon: '⏳' });
            navigate(`/lender/waiting/${loan.id}`);
        } else if (loan.status === 'completed') {
            toast('Viewing Return Proof Gallery...', { icon: '📸' });
            navigate('/gallery');
        } else if (loan.status === 'collecting') {
            toast.success('Waiting for borrower to come collect the item.', { icon: '🤝' });
        } else if (loan.status === 'item_out') {
            toast.success('Item is currently with the borrower. Timer is active.', { icon: '⏱️' });
        } else {
            toast(`Viewing active loan details for ${loan.item}`);
        }
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'awaiting_deposit':
                return { text: 'Awaiting collateral payment', color: 'bg-gray-100 text-gray-600' };
            case 'collecting':
                return { text: 'Borrower collecting item', color: 'bg-blue-100 text-blue-700' };
            case 'item_out':
                return { text: 'Item out — awaiting return', color: 'bg-orange-100 text-orange-700' };
            case 'return_pending':
                return { text: 'Return pending confirmation', color: 'bg-purple-100 text-purple-700' };
            case 'completed':
                return { text: 'Completed', color: 'bg-green-100 text-green-700' };
            default:
                return { text: 'In Progress', color: 'bg-gray-100 text-gray-600' };
        }
    };

    return (
        <div className="bg-surface min-h-[calc(100vh-72px)] flex flex-col font-sans">
            <header className="px-6 py-6 pb-4 bg-white">
                <h1 className="text-28pt font-bold text-dark leading-tight mb-4">Incoming Requests</h1>

                {/* Earnings Card */}
                <div className="bg-dark rounded-2xl p-5 shadow-sm text-white relative overflow-hidden">
                    <span className="text-gray-400 text-sm font-medium">Lending Earnings</span>
                    <div className="flex items-center gap-2 mt-1">
                        <h2 className="text-36pt font-black tracking-tight">₹1,250</h2>
                        <Sparkles size={20} className="text-primary mb-2" />
                    </div>
                    {/* Decorative element */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
                </div>
            </header>

            <main className="flex-1 px-4 py-4 overflow-y-auto space-y-8">
                {/* Incoming Feed */}
                <section>
                    <div className="space-y-4">
                        {incomingRequests.map(req => (
                            <div key={req.id} className="bg-white rounded-2xl p-4 shadow-sm relative border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="bg-primary/20 text-primary-dark text-[10px] font-bold px-2 py-1 rounded-pill uppercase tracking-wide">
                                        {req.category}
                                    </span>
                                    <span className="text-xs text-gray-500 font-bold flex items-center gap-1">
                                        <MapPin size={12} /> {req.distanceMeters}m away
                                    </span>
                                </div>

                                <h3 className="font-bold text-dark text-lg leading-tight mb-1">{req.item}</h3>
                                <p className="text-sm text-dark font-medium mb-1">
                                    <span className="font-normal">{req.borrowerName}</span>
                                </p>
                                <p className="text-sm text-dark font-medium mb-4">
                                    <span className="text-gray-500 font-normal">Offered: </span>
                                    <span className="text-primary-dark font-bold">{req.price}</span>
                                </p>

                                <div className="flex justify-end items-center gap-4">
                                    <button
                                        onClick={() => handleSkip(req.id)}
                                        className="text-gray-500 font-bold text-sm hover:text-dark transition-colors"
                                    >
                                        Skip
                                    </button>
                                    <button
                                        onClick={() => handleAccept(req)}
                                        className="bg-primary text-black font-bold px-6 py-2 rounded-pill shadow-sm active:scale-95 transition-transform"
                                    >
                                        Accept
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Active Loans */}
                <section>
                    <h2 className="text-lg font-bold text-dark mb-4 px-2">My Active Loans</h2>
                    <div className="space-y-3">
                        {activeLoans.map(loan => {
                            const chip = getStatusChip(loan.status);

                            return (
                                <div
                                    key={loan.id}
                                    onClick={() => handleActiveLoanClick(loan)}
                                    className="bg-white p-4 rounded-xl border-l-[4px] border-l-primary shadow-sm flex flex-col gap-2 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
                                >
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-dark text-lg leading-tight">{loan.item}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-pill ${chip.color}`}>
                                            {chip.text}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">
                                        To: <span className="text-dark">{loan.borrowerName}</span>
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </main>
        </div>
    );
}
