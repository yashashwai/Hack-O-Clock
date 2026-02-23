import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, IndianRupee, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createRequest } from '../services/requestService';
import { useAuth } from '../contexts/AuthContext';
import { notifyNewRequestInCommunity } from '../services/fcmService.jsx';
import { getPriceSuggestion } from '../services/geminiService';

export default function RequestForm() {
    const navigate = useNavigate();
    const { currentUser, userData } = useAuth();
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [duration, setDuration] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);

    const handleSuggestPrice = async () => {
        if (!description.trim()) {
            toast.error("Please enter a description first");
            return;
        }

        setIsSuggesting(true);
        const toastId = toast.loading("AI is suggesting a price...");

        try {
            const suggestion = await getPriceSuggestion(category, description);
            // Expected format from mock: "40-80"
            setPriceRange(suggestion);
            toast.success("Price suggested based on market trends!", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Failed to get suggestion", { id: toastId });
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser || (!userData?.location && !userData?.communityId)) {
            toast.error("You must set your location or community to post.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Split "40 - 80" string roughly for MVP DB format
            const prices = priceRange.replace(/[^0-9-]/g, '').split('-');
            const reqData = {
                category,
                description,
                priceMin: prices[0] ? parseInt(prices[0]) : 0,
                priceMax: prices[1] ? parseInt(prices[1]) : 0,
                durationHours: duration
            };

            await createRequest(reqData, currentUser, userData);

            // Mock FCM - optionally using communityId if it exists
            if (userData.communityId) {
                notifyNewRequestInCommunity(userData.communityId, category);
            }

            navigate('/borrower'); // go back home
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-surface min-h-screen flex flex-col font-sans">
            <header className="px-4 py-4 bg-white flex items-center gap-3 shadow-sm z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-dark" />
                </button>
                <h1 className="text-xl font-bold text-dark">New Request</h1>
            </header>

            <main className="flex-1 px-6 py-6 pb-32 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Category Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-dark flex items-center gap-2">
                            <Package size={16} className="text-primary-dark" />
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none text-dark font-medium"
                        >
                            <option value="" disabled>Select category...</option>
                            <option value="Home Appliances">Home Appliances</option>
                            <option value="Tools & Hardware">Tools & Hardware</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Camping Gear">Camping Gear</option>
                            <option value="Party Supplies">Party Supplies</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-dark flex items-center gap-2">
                            Item Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            placeholder="E.g. I need a power drill for 2 hours to fix a shelf."
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark font-medium resize-none h-28"
                        />
                    </div>

                    {/* Price Range */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-dark flex items-center gap-2">
                                <IndianRupee size={16} className="text-primary-dark" />
                                Offered Price Range
                            </label>
                            <button
                                type="button"
                                onClick={handleSuggestPrice}
                                disabled={isSuggesting || !description.trim()}
                                className="flex items-center gap-1.5 text-xs font-bold text-primary-dark bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-pill transition-colors disabled:opacity-50"
                            >
                                <Sparkles size={12} />
                                {isSuggesting ? 'Suggesting...' : 'AI Suggestion'}
                            </button>
                        </div>
                        <input
                            type="text"
                            value={priceRange}
                            onChange={(e) => setPriceRange(e.target.value)}
                            required
                            placeholder="E.g. 40 - 80"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark font-medium"
                        />
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-dark flex items-center gap-2">
                            <Clock size={16} className="text-primary-dark" />
                            Duration
                        </label>
                        <input
                            type="text"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            required
                            placeholder="E.g. 2 Hours, 1 Day"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark font-medium"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-8 bg-primary text-black font-bold text-lg py-4 rounded-pill shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                    >
                        Post Request
                    </button>
                </form>
            </main>
        </div>
    );
}
