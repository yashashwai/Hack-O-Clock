import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Navigation, LogOut } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../contexts/AuthContext";
import { logoutUser } from "../../services/authService";
import { toast } from "react-hot-toast";

export default function LocationSetup() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [statusText, setStatusText] = useState("Find neighbours within 1km");

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsSaving(true);
        setStatusText("Locating you...");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    setStatusText("Saving location...");
                    await updateDoc(doc(db, "users", currentUser.uid), {
                        communityId: 'global', // Legacy field bypass for routing
                        location: {
                            lat: latitude,
                            lng: longitude
                        }
                    });
                    toast.success("Location verified!");
                    navigate('/onboarding/profile');
                } catch (error) {
                    console.error("Error saving location:", error);
                    toast.error("Failed to save location");
                    setStatusText("Find neighbours within 1km");
                    setIsSaving(false);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                toast.error("Please allow location access to continue");
                setStatusText("Find neighbours within 1km");
                setIsSaving(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
            navigate('/onboarding/splash');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="bg-surface min-h-screen flex flex-col font-sans">
            <header className="px-6 py-6 bg-white flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-dark hover:bg-surface p-2 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-22pt font-bold text-dark">Set Location</h1>
                </div>
                <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors" title="Logout">
                    <LogOut size={24} />
                </button>
            </header>

            <main className="flex-1 px-6 py-8 flex flex-col items-center justify-center">

                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75"></div>
                    <MapPin size={40} className="text-primary-dark relative z-10" />
                </div>

                <h2 className="text-2xl font-bold text-dark text-center mb-4">Discover Local Items</h2>
                <p className="text-center text-gray-500 mb-12 max-w-[280px]">
                    We need your location to show available items to borrow within a 1,000 meter radius of you.
                </p>

                <div className="w-full mt-auto mb-8">
                    <button
                        disabled={isSaving}
                        onClick={handleGetLocation}
                        className="w-full h-[60px] bg-primary text-black font-bold text-lg rounded-pill disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400 transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        <Navigation size={20} className={isSaving ? "animate-pulse" : ""} />
                        {isSaving ? statusText : "Share Location"}
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-4 leading-relaxed">
                        Your exact location is never shared with anyone. <br />Only relative distances are shown to neighbours.
                    </p>
                </div>
            </main>
        </div>
    );
}
