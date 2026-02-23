import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-hot-toast';

export default function LenderWaiting() {
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const unsub = onSnapshot(doc(db, "transactions", id), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.status === 'rental_pending') {
                    toast.success("Deposit Received! The borrower is coming to collect.");
                    navigate('/lender'); // Deposit paid, back to lender feed (now shows 'collecting')
                }
            }
        });
        return () => unsub();
    }, [id, navigate]);

    return (
        <div className="bg-surface min-h-screen flex flex-col font-sans">
            <header className="px-4 py-4 bg-white flex items-center gap-3 shadow-sm z-10">
                <button onClick={() => navigate('/lender')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-dark" />
                </button>
                <h1 className="text-xl font-bold text-dark">Waiting for Deposit</h1>
            </header>

            <main className="flex-1 px-6 pb-32 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Clock size={48} className="text-primary-dark" />
                </div>

                <h2 className="text-2xl font-bold text-dark mb-4">Borrower Notified!</h2>

                <p className="text-gray-500 max-w-[280px]">
                    We have notified the borrower that the item is ready for handover.
                    <br /><br />
                    Please wait until they pay their 25% security deposit into the platform before handing over the <span className="font-bold text-dark">{id}</span>.
                </p>

                <button
                    onClick={() => navigate('/lender')}
                    className="w-full max-w-[280px] mt-12 bg-dark text-white font-bold text-lg py-4 rounded-pill shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                    Back to My Loans
                </button>
            </main>
        </div>
    );
}
