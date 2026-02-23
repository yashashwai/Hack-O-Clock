import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, ChevronLeft, Info, LogOut } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../contexts/AuthContext";
import { logoutUser } from "../../services/authService";
import { toast } from "react-hot-toast";

export default function ProfileSetup() {
    const navigate = useNavigate();
    const { currentUser, userData } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        room: "",
        block: "",
        emergencyName: "",
        emergencyPhone: ""
    });

    useEffect(() => {
        if (userData) {
            setForm(prev => ({
                ...prev,
                name: userData.name || "",
                phone: userData.phone || "",
                room: userData.room || "",
                block: userData.block || "",
                emergencyName: userData.emergencyContact?.name || "",
                emergencyPhone: userData.emergencyContact?.phone || ""
            }));
        }
    }, [userData]);

    const isValid = form.name && form.phone && form.room;

    const handleNext = async () => {
        if (!isValid || !currentUser) return;
        setIsSaving(true);
        try {
            await updateDoc(doc(db, "users", currentUser.uid), {
                name: form.name,
                phone: form.phone,
                room: form.room,
                block: form.block,
                emergencyContact: {
                    name: form.emergencyName,
                    phone: form.emergencyPhone
                }
            });
            navigate('/onboarding/kyc');
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to save profile.");
        } finally {
            setIsSaving(false);
        }
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
        <div className="bg-white min-h-screen flex flex-col font-sans">
            {/* Progress */}
            <div className="w-full bg-surface h-1.5">
                <div className="bg-primary h-full w-1/3 transition-all duration-500"></div>
            </div>

            <header className="px-6 py-6 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-dark hover:bg-surface p-2 rounded-full -ml-2">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-28pt font-bold text-dark">Profile Setup</h1>
                </div>
                <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors" title="Logout">
                    <LogOut size={24} />
                </button>
            </header>

            <main className="flex-1 px-6 pb-8 pt-6 overflow-y-auto space-y-8">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center">
                    <button className="w-24 h-24 rounded-full border-2 border-dashed border-primary bg-surface flex flex-col items-center justify-center text-primary-dark hover:bg-primary/5 transition-colors relative group">
                        <Camera size={28} className="mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>

                        <div className="absolute inset-0 rounded-full border-[3px] border-white group-hover:scale-105 transition-transform"></div>
                    </button>
                </div>

                {/* Basic Info */}
                <section className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-gray-500 ml-1 mb-1 block">Full Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Yasha Vardhan"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-surface border-2 border-transparent focus:border-primary rounded-xl px-4 py-4 text-dark font-medium outline-none transition-colors h-[56px]"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-500 ml-1 mb-1 block">Phone Number</label>
                        <input
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })}
                            className="w-full bg-surface border-2 border-transparent focus:border-primary rounded-xl px-4 py-4 text-dark font-medium outline-none transition-colors h-[56px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-bold text-gray-500 ml-1 mb-1 block">Room/Flat No.</label>
                            <input
                                type="text"
                                placeholder="A-204"
                                value={form.room}
                                onChange={e => setForm({ ...form, room: e.target.value })}
                                className="w-full bg-surface border-2 border-transparent focus:border-primary rounded-xl px-4 py-4 text-dark font-medium outline-none transition-colors h-[56px]"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-500 ml-1 mb-1 block">Block/Tower</label>
                            <input
                                type="text"
                                placeholder="A Block"
                                value={form.block}
                                onChange={e => setForm({ ...form, block: e.target.value })}
                                className="w-full bg-surface border-2 border-transparent focus:border-primary rounded-xl px-4 py-4 text-dark font-medium outline-none transition-colors h-[56px]"
                            />
                        </div>
                    </div>
                </section>

                {/* Emergency Contact */}
                <section className="bg-surface p-5 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <h3 className="font-bold text-dark">Emergency Contact</h3>
                        <div className="bg-white p-1 rounded-full text-gray-400 group relative">
                            <Info size={14} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Contact Name"
                            value={form.emergencyName}
                            onChange={e => setForm({ ...form, emergencyName: e.target.value })}
                            className="w-full bg-white border border-gray-200 focus:border-primary rounded-xl px-4 py-3 text-dark text-sm font-medium outline-none transition-colors"
                        />
                        <input
                            type="tel"
                            placeholder="Contact Phone"
                            value={form.emergencyPhone}
                            onChange={e => setForm({ ...form, emergencyPhone: e.target.value })}
                            className="w-full bg-white border border-gray-200 focus:border-primary rounded-xl px-4 py-3 text-dark text-sm font-medium outline-none transition-colors"
                        />
                    </div>
                </section>

                <div className="pt-4">
                    <button
                        disabled={!isValid || isSaving}
                        onClick={handleNext}
                        className="w-full h-[60px] bg-primary text-black font-bold text-lg rounded-pill disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400 transition-all active:scale-95 shadow-lg shadow-primary/20"
                    >
                        {isSaving ? "Saving..." : "Next"}
                    </button>
                </div>
            </main>
        </div>
    );
}
