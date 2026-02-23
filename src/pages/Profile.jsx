import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Shield, CheckCircle2, LogOut, Settings, Award, ChevronRight, Image } from 'lucide-react';
import TrustBadge from '../components/TrustBadge';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../services/authService';

export default function Profile() {
    const navigate = useNavigate();
    const { userData } = useAuth();

    const initials = userData?.name
        ? userData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'N';

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
            <header className="px-6 py-6 border-b border-gray-100 bg-white">
                <div className="flex justify-between items-center">
                    <h1 className="text-28pt font-bold text-dark">Profile</h1>
                    <button className="text-gray-400 hover:text-dark transition-colors">
                        <Settings size={24} />
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto pb-8">
                {/* User Card */}
                <div className="bg-white px-6 py-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 rounded-full bg-dark text-white flex items-center justify-center text-3xl font-bold relative border-4 border-primary shadow-lg shadow-primary/20">
                            {initials}
                        </div>
                        <div>
                            <h2 className="text-22pt font-bold text-dark leading-tight flex items-center gap-2">
                                {userData?.name || "Neighbor"}
                                <CheckCircle2 size={24} className="text-primary fill-dark/5" />
                            </h2>
                            <p className="text-gray-500 font-medium">{userData?.block} • {userData?.room}</p>
                        </div>
                    </div>

                    <TrustBadge score={userData?.trustScore?.avgRating ? Math.round((userData.trustScore.avgRating / 5) * 100) : 100} size="lg" />
                </div>

                <div className="px-6 mt-6 space-y-4">
                    {/* KYC Status */}
                    <div className={`border rounded-2xl p-4 flex items-center justify-between shadow-sm ${userData?.digilockerVerified ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${userData?.digilockerVerified ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                <Shield size={20} />
                            </div>
                            <div>
                                <h3 className={`font-bold ${userData?.digilockerVerified ? 'text-green-800' : 'text-orange-800'}`}>
                                    {userData?.digilockerVerified ? 'DigiLocker Verified' : 'Action Required'}
                                </h3>
                                <p className={`text-sm ${userData?.digilockerVerified ? 'text-green-600' : 'text-orange-600'}`}>
                                    {userData?.digilockerVerified ? 'Identity confirmed' : 'Verify your identity'}
                                </p>
                            </div>
                        </div>
                        {userData?.digilockerVerified ? <CheckCircle2 size={20} className="text-green-600" /> : <ChevronRight size={20} className="text-orange-600 cursor-pointer" onClick={() => navigate('/onboarding/kyc')} />}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <h4 className="text-gray-500 font-bold mb-1 text-sm">Items Borrowed</h4>
                            <span className="text-xl font-black text-dark">{userData?.totalBorrowed || 0}</span>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                            <h4 className="text-gray-500 font-bold mb-1 text-sm">Items Lent</h4>
                            <span className="text-xl font-black text-dark flex items-center gap-2">
                                {userData?.totalLent || 0}
                                {(userData?.totalLent || 0) > 10 && (
                                    <span className="text-[10px] bg-primary/20 text-primary-dark px-2 py-0.5 rounded-pill font-bold align-middle">Top 5%</span>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-2">
                        <button onClick={() => navigate('/gallery')} className="w-full px-5 py-4 flex items-center justify-between hover:bg-surface transition-colors border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-dark">
                                    <Image size={16} />
                                </div>
                                <span className="font-bold text-dark">My Proof Gallery</span>
                            </div>
                            <ChevronRight size={20} className="text-gray-400" />
                        </button>
                        <button onClick={() => navigate('/admin')} className="w-full px-5 py-4 flex items-center justify-between hover:bg-surface transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-dark flex items-center justify-center text-primary">
                                    <Shield size={16} />
                                </div>
                                <span className="font-bold text-dark">Admin Dashboard</span>
                            </div>
                            <ChevronRight size={20} className="text-gray-400" />
                        </button>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="w-full mt-6 bg-red-50 text-red-600 font-bold py-4 rounded-pill flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </main>
        </div>
    );
}
