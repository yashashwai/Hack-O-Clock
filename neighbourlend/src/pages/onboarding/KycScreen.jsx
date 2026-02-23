import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, Fingerprint, Users, CheckCircle2, LogOut } from "lucide-react";
import { logoutUser } from "../../services/authService";

export default function KycScreen() {
    const navigate = useNavigate();
    const [isVerifying, setIsVerifying] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleVerify = () => {
        setIsVerifying(true);
        // Simulate API redirect and callback
        setTimeout(() => {
            setIsVerifying(false);
            setSuccess(true);
            setTimeout(() => {
                navigate('/home'); // Go home after success
            }, 1500);
        }, 2000);
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
            navigate('/onboarding/splash');
        } catch (error) {
            console.error(error);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6 text-black">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-6">
                    <CheckCircle2 size={48} className="text-primary" />
                </div>
                <h1 className="text-36pt font-black">Identity Verified</h1>
                <p className="font-bold opacity-80 mt-2">Welcome to NeighbourLend!</p>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen flex flex-col font-sans">
            <div className="w-full bg-surface h-1.5">
                <div className="bg-primary h-full w-2/3 transition-all duration-500"></div>
            </div>

            <header className="px-6 py-6 flex items-center justify-end">
                <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors" title="Logout">
                    <LogOut size={24} />
                </button>
            </header>

            <main className="flex-1 px-6 py-4 flex flex-col">
                {/* Header content */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-dark text-white rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-xl transform rotate-3">
                        <Shield size={40} className="text-primary" />
                    </div>
                    <h1 className="text-28pt font-bold text-dark leading-tight">Verify Identity</h1>
                    <p className="text-gray-500 mt-2 text-lg">Keeps our community safe.</p>
                </div>

                {/* KYC Card */}
                <div className="bg-dark rounded-2xl p-6 text-white shadow-xl relative overflow-hidden mb-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full blur-xl"></div>

                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Fingerprint size={20} className="text-primary" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">DigiLocker</span>
                        </div>
                        <div className="bg-primary/20 text-primary-dark text-xs font-bold px-3 py-1 rounded-pill flex items-center gap-1 border border-primary/30">
                            <Shield size={12} /> Secure
                        </div>
                    </div>

                    <p className="text-gray-300 text-sm leading-relaxed">
                        We use government-backed KYC to ensure real identities. Escaped borrows are 99% eliminated with verified users.
                    </p>
                </div>

                {/* Explainer List */}
                <div className="space-y-5 mb-auto">
                    <h3 className="font-bold text-dark mb-2">Why we verify</h3>

                    {[
                        { icon: Lock, title: "Data is Private", desc: "We never share your ID with other users." },
                        { icon: Users, title: "Closed Community", desc: "Only verified residents can join Sunrise Towers." },
                        { icon: Shield, title: "Warden Oversight", desc: "Identity is only accessed during serious disputes." }
                    ].map((item, i) => (
                        <div key={i} className="flex gap-4 items-center">
                            <div className="w-12 h-12 bg-primary/20 text-primary-dark rounded-pill flex items-center justify-center flex-shrink-0">
                                <item.icon size={20} className="text-dark" />
                            </div>
                            <div>
                                <h4 className="font-bold text-dark">{item.title}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 space-y-4">
                    <button
                        onClick={handleVerify}
                        disabled={isVerifying}
                        className="w-full h-[60px] bg-primary text-black font-bold text-lg rounded-pill flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-70"
                    >
                        {isVerifying ? (
                            <span className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                Connecting...
                            </span>
                        ) : (
                            "Verify with DigiLocker"
                        )}
                    </button>
                    <p className="text-[11px] text-center text-gray-400 px-6">
                        Your government ID stays secure. Our system automatically deletes the document after extracting your verified name.
                    </p>
                </div>
            </main>
        </div>
    );
}
