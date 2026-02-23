import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { updateTransaction } from '../services/transactionService';

export default function ActiveTimer() {
    const navigate = useNavigate();
    const { id } = useParams(); // Transaction ID
    const [timeLeft, setTimeLeft] = useState(0);
    const [txData, setTxData] = useState(null);
    const [isReturning, setIsReturning] = useState(false);

    useEffect(() => {
        const fetchTx = async () => {
            const docSnap = await getDoc(doc(db, "transactions", id));
            if (docSnap.exists()) {
                const data = docSnap.data();
                setTxData(data);

                if (data.collectedAt && data.durationHours) {
                    // MVP hack: Assuming durationHours string is "X Hours", parse the integer
                    const hoursString = data.durationHours || "2";
                    const hours = parseInt(hoursString.replace(/[^0-9]/g, '')) || 2;

                    const collectedTime = data.collectedAt.toDate ? data.collectedAt.toDate() : new Date(data.collectedAt);
                    const expiryTime = new Date(collectedTime.getTime() + hours * 60 * 60 * 1000);
                    const now = new Date();

                    const secondsLeft = Math.max(0, Math.floor((expiryTime - now) / 1000));
                    setTimeLeft(secondsLeft);
                }
            }
        };
        fetchTx();
    }, [id]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleReturn = async () => {
        if (!txData) return;
        setIsReturning(true);
        const toastId = toast.loading("Marking as returned...");
        try {
            await updateTransaction(id, {
                status: 'return_pending'
            });
            toast.success("Returned! Awaiting lender confirmation.", { id: toastId });
            navigate('/borrower');
        } catch (error) {
            console.error(error);
            toast.error("Failed to mark as returned", { id: toastId });
        } finally {
            setIsReturning(false);
        }
    };

    return (
        <div className="bg-dark min-h-screen flex flex-col font-sans text-white">
            <header className="px-4 py-4 flex items-center gap-3 z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-white" />
                </button>
                <h1 className="text-xl font-bold">Active Loan</h1>
            </header>

            <main className="flex-1 px-6 py-8 pb-32 flex flex-col items-center justify-center">
                <div className="text-center mb-12">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                        Time Remaining
                    </span>
                    <div className="text-6xl font-black font-mono tracking-tight text-primary drop-shadow-[0_0_15px_rgba(204,255,0,0.5)]">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="w-full bg-white/10 rounded-2xl p-6 backdrop-blur-md border border-white/20 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-300 font-medium">Request ID</span>
                        <span className="font-bold text-xs bg-white/20 px-2 py-1 rounded">{id}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-300 font-medium">Item</span>
                        <span className="font-bold">{txData ? txData.itemCategory : '...'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300 font-medium">Lender</span>
                        <span className="font-bold">{txData ? txData.lenderName : '...'}</span>
                    </div>
                </div>

                <div className="bg-orange-500/20 border border-orange-500/50 rounded-xl p-4 flex gap-3 text-orange-200 text-sm mb-auto">
                    <AlertCircle size={20} className="shrink-0 mt-0.5 text-orange-400" />
                    <p>
                        Please return the item in its original condition before the timer expires to ensure a full refund of your ₹250 security deposit.
                    </p>
                </div>

                <div className="mt-8 w-full">
                    <button
                        onClick={handleReturn}
                        disabled={!txData || isReturning}
                        className="w-full bg-primary text-black font-bold text-lg py-4 rounded-pill shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Clock size={20} />
                        {isReturning ? "Updating..." : "Mark as Returned"}
                    </button>
                    <button
                        className="w-full mt-4 bg-transparent text-white font-bold py-3 hover:text-primary transition-colors"
                    >
                        Report an Issue
                    </button>
                </div>
            </main>
        </div>
    );
}
