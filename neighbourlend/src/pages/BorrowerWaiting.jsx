import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Search } from 'lucide-react';

export default function BorrowerWaiting() {
    const navigate = useNavigate();
    const { id, status } = useParams();

    const isAccepted = status === 'accepted';

    return (
        <div className="bg-surface min-h-screen flex flex-col font-sans">
            <header className="px-4 py-4 bg-white flex items-center gap-3 shadow-sm z-10">
                <button onClick={() => navigate('/borrower')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-dark" />
                </button>
                <h1 className="text-xl font-bold text-dark">Request Status</h1>
            </header>

            <main className="flex-1 px-6 pb-32 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    {isAccepted ? (
                        <Clock size={48} className="text-primary-dark" />
                    ) : (
                        <Search size={48} className="text-primary-dark" />
                    )}
                </div>

                <h2 className="text-2xl font-bold text-dark mb-4">
                    {isAccepted ? 'Lender Found!' : 'Searching for Lenders...'}
                </h2>

                <p className="text-gray-500 max-w-[280px]">
                    {isAccepted
                        ? `A lender has accepted your request for ${id}. They are currently taking the pre-handover photo. You will be notified to pay the deposit once they finish.`
                        : `Your request ${id} is live in the community. We'll notify you as soon as a neighbour accepts it.`
                    }
                </p>

                <button
                    onClick={() => navigate('/borrower')}
                    className="w-full max-w-[280px] mt-12 bg-dark text-white font-bold text-lg py-4 rounded-pill shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                    Back to My Borrows
                </button>
            </main>
        </div>
    );
}
