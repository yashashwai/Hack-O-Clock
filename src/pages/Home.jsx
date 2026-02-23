import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Bell, Package, HandHeart, MessageCircle, CheckCircle2, Search, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../services/authService';

const categories = [
    { id: 1, name: 'Laptop', icon: '💻', price: '₹80-150/hr' },
    { id: 2, name: 'Camera', icon: '📷', price: '₹100-200/hr' },
    { id: 3, name: 'Charger', icon: '🔌', price: '₹20-50/hr' },
    { id: 4, name: 'Sports', icon: '⚽', price: '₹30-80/hr' },
];

const feed = [
    { id: 101, item: 'Type-C Mac Charger', room: 'B-402', type: 'Request', time: '10 min ago' },
    { id: 102, item: 'Acoustic Guitar', room: 'A-105', type: 'Available', time: '2 hrs ago' }
];

export default function Home() {
    const navigate = useNavigate();
    const { userData } = useAuth();

    // Create initials from name
    const initials = userData?.name
        ? userData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'N';

    const displayName = userData?.name ? userData.name.split(' ')[0] : 'Neighbor';

    const handleLogout = async () => {
        try {
            await logoutUser();
            navigate('/onboarding/splash');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="bg-surface min-h-[calc(100vh-72px)] flex flex-col font-sans">
            {/* Header */}
            <header className="px-6 py-6 flex justify-between items-center bg-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-dark text-white flex items-center justify-center font-bold relative border-2 border-primary cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/profile')}>
                        {initials}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-white flex items-center justify-center">
                            <CheckCircle2 size={10} className="text-black" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-22pt font-bold text-dark leading-tight">Hey {displayName} 👋</h1>
                        <p className="text-gray-500 text-sm">{userData?.block} • {userData?.room}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleLogout}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                    <button
                        onClick={() => toast('No new notifications', { icon: '🔔' })}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-surface relative hover:bg-gray-200 transition-colors"
                    >
                        <Bell size={24} className="text-dark" />
                        <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white"></span>
                    </button>
                </div>
            </header>

            <main className="flex-1 px-6 pb-8 space-y-8 overflow-y-auto">
                {/* Search */}
                <section className="mt-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search items to borrow..."
                            className="w-full bg-white border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-dark font-medium shadow-sm outline-none transition-colors focus:border-primary"
                        />
                    </div>
                </section>

                {/* Main Actions */}
                <section className="grid grid-cols-2 gap-4">
                    <div
                        onClick={() => navigate('/borrower')}
                        className="bg-primary rounded-2xl p-4 shadow-lg shadow-primary/20 flex flex-col items-start gap-4 cursor-pointer active:scale-95 transition-transform"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
                            <HandHeart size={24} className="text-black" />
                        </div>
                        <div>
                            <h3 className="font-bold text-black text-lg">Borrow Item</h3>
                            <p className="text-black/70 text-sm">Post a request</p>
                        </div>
                    </div>

                    <div
                        onClick={() => navigate('/lender')}
                        className="bg-dark rounded-2xl p-4 shadow-xl flex flex-col items-start gap-4 cursor-pointer active:scale-95 transition-transform text-white relative overflow-hidden"
                    >
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                            <Package size={24} className="text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">Lend & Earn</h3>
                            <p className="text-gray-400 text-sm">View incoming</p>
                        </div>
                    </div>
                </section>

                {/* Popular Categories */}
                <section>
                    <div className="flex justify-between items-end mb-4">
                        <h2 className="text-16pt font-bold text-dark">Popular in Community</h2>
                        <span className="text-primary-dark font-bold text-sm cursor-pointer hover:underline">See all</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {categories.map(cat => (
                            <div
                                key={cat.id}
                                onClick={() => navigate('/borrower')}
                                className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3 shadow-sm hover:border-primary cursor-pointer transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-xl">
                                    {cat.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-dark text-sm">{cat.name}</h3>
                                    <p className="text-[10px] text-gray-500">{cat.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Community Feed */}
                <section>
                    <div className="flex justify-between items-end mb-4">
                        <h2 className="text-16pt font-bold text-dark">Community Feed</h2>
                        <button onClick={() => navigate('/chat')} className="text-primary-dark font-bold text-sm hover:underline flex items-center gap-1">
                            <MessageCircle size={14} /> Forum
                        </button>
                    </div>
                    <div className="space-y-3">
                        {feed.map(item => (
                            <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
                                <div>
                                    <h3 className="font-bold text-dark">{item.item}</h3>
                                    <p className="text-sm text-gray-500">{item.room} • {item.time}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-pill text-xs font-bold ${item.type === 'Request' ? 'bg-surface text-gray-600' : 'bg-primary/20 text-primary-dark'}`}>
                                    {item.type}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
