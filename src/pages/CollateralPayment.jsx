import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { processMockRazorpayPayment } from '../services/paymentService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function CollateralPayment() {
    const navigate = useNavigate();
    const { id } = useParams(); // Transaction ID
    const [isPaying, setIsPaying] = useState(false);
    const [txData, setTxData] = useState(null);

    useEffect(() => {
        const fetchTx = async () => {
            const docSnap = await getDoc(doc(db, "transactions", id));
            if (docSnap.exists()) {
                setTxData(docSnap.data());
            }
        };
        fetchTx();
    }, [id]);

    const handlePayment = async () => {
        if (!txData) return;
        setIsPaying(true);
        const toastId = toast.loading("Processing secure deposit...");

        try {
            await processMockRazorpayPayment(id, txData.collateralAmount, 'collateral');
            toast.success("Security deposit paid! Waiting for handover.", { id: toastId });
            navigate('/borrower'); // Go back to borrower home
        } catch (error) {
            console.error(error);
            toast.error("Payment failed. Please try again.", { id: toastId });
        } finally {
            setIsPaying(false);
        }
    };

    return (
        <div className="bg-surface min-h-screen flex flex-col font-sans">
            <header className="px-4 py-4 bg-white flex items-center gap-3 shadow-sm z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-dark" />
                </button>
                <h1 className="text-xl font-bold text-dark">Security Deposit</h1>
            </header>

            <main className="flex-1 px-6 py-8 pb-32 flex flex-col items-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck size={40} className="text-red-500" />
                </div>

                <h2 className="text-2xl font-bold text-dark mb-2 text-center">Pay Collateral</h2>
                <p className="text-gray-500 text-center mb-8 px-4">
                    The platform securely holds this deposit until the item is returned safely. You will be fully refunded.
                </p>

                <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 flex flex-col items-center">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount</span>
                    <span className="text-5xl font-black text-dark tracking-tight">₹{txData ? txData.collateralAmount : '...'}</span>
                    <div className="w-full h-px bg-gray-100 my-6" />

                    <div className="w-full flex justify-between items-center text-sm font-medium">
                        <span className="text-gray-500">Item</span>
                        <span className="text-dark">{txData ? txData.itemCategory : 'Loading...'}</span>
                    </div>
                    <div className="w-full flex justify-between items-center text-sm font-medium mt-3">
                        <span className="text-gray-500">Item Value</span>
                        <span className="text-dark">₹{txData ? txData.itemValue : '...'} (25% Deposit)</span>
                    </div>
                </div>

                <div className="mt-auto w-full">
                    <button
                        onClick={handlePayment}
                        disabled={!txData || isPaying}
                        className="w-full bg-dark text-white font-bold text-lg py-4 rounded-pill shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        <Lock size={20} />
                        {isPaying ? "Processing..." : "Pay Securely via UPI"}
                    </button>
                </div>
            </main>
        </div>
    );
}
