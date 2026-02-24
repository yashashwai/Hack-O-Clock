import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { loginWithGoogle } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";

export default function LoadingSplash() {
    const navigate = useNavigate();
    const { currentUser, userData } = useAuth();

    // Auto-redirect based on auth state
    useEffect(() => {
        if (currentUser && userData) {
            if (userData.communityId) {
                navigate('/borrower'); // or wherever home is
            } else {
                navigate('/onboarding/location');
            }
        }
    }, [currentUser, userData, navigate]);

    const handleGoogleLogin = async () => {
        try {
            const result = await loginWithGoogle();
            if (!result) return;

            const { isNew, user } = result;

            // Route immediately based on the result from the auth service 
            // instead of waiting for the useEffect to catch up
            if (isNew || !user.communityId) {
                navigate('/onboarding/location');
            } else {
                navigate('/borrower');
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <div className="min-h-screen bg-primary flex flex-col justify-center items-center p-8 relative overflow-hidden font-sans">
            {/* Decorative */}
            <div className="absolute top-20 right-10 opacity-50">
                <Sparkles size={40} className="text-black" />
            </div>
            <div className="absolute bottom-40 left-10 opacity-50">
                <Sparkles size={24} className="text-black" />
            </div>

            {/* Illustration placeholder */}
            <div className="w-48 h-48 mb-8 relative">
                <div className="absolute inset-0 border-[6px] border-black bg-white rounded-3xl flex items-center justify-center transform -rotate-6">
                    <span className="text-7xl">📦</span>
                </div>
                <div className="absolute inset-0 border-[6px] border-black rounded-3xl z-[-1] translate-x-3 translate-y-3 bg-dark"></div>
            </div>

            <div className="text-center mb-16 relative z-10 w-full flex flex-col items-center">
                <h1 className="text-[40pt] font-black text-black leading-[1.1] tracking-tight text-center">
                    Neighbour<br />Lend
                </h1>
                <p className="text-[22pt] font-bold text-gray-600 mt-4 text-center leading-tight">
                    "Apno se udhaar,<br />Bina sharam ke"
                </p>
            </div>

            <div className="w-full mt-auto relative z-10 space-y-4">
                <button
                    onClick={handleGoogleLogin}
                    className="w-full bg-white text-dark font-bold text-center h-[60px] rounded-pill flex justify-center items-center gap-3 text-lg active:scale-95 transition-transform border-4 border-black"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" className="w-6 h-6" />
                    Continue with Google
                </button>
            </div>
        </div>
    );
}
