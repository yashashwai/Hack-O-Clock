import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, UploadCloud } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadTransactionPhoto } from '../services/storageService';
import { updateTransaction } from '../services/transactionService';

export default function PreHandover() {
    const navigate = useNavigate();
    const { id } = useParams(); // This is now the Transaction ID
    const [itemValue, setItemValue] = useState('');
    const [photoDataUrl, setPhotoDataUrl] = useState(null);
    const [fileBlob, setFileBlob] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileBlob(file); // Store actual file for Firebase Storage
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoDataUrl(reader.result);
                toast.success("Photo attached! Ready to declare value.");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConfirm = async () => {
        if (!fileBlob || !itemValue) return;

        setIsSaving(true);
        const toastId = toast.loading("Uploading photo and setting collateral...");

        try {
            // 1. Upload photo to Firebase Storage
            const photoUrl = await uploadTransactionPhoto(fileBlob, id, 'pre_handover');

            // 2. Update transaction with photo URL and Item Value
            // Collateral MVP = 25% of item value
            const valueNum = parseFloat(itemValue);
            const collateralAmount = Math.round(valueNum * 0.25);

            await updateTransaction(id, {
                preHandoverPhotoURL: photoUrl,
                itemValue: valueNum,
                collateralAmount: collateralAmount,
                condition: "good", // default MVP assume good before lending
            });

            toast.success("Borrower notified! Waiting for deposit.", { id: toastId });
            navigate(`/lender/waiting/${id}`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload info.", { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const isReady = photoDataUrl && itemValue.trim() !== '' && !isSaving;

    return (
        <div className="bg-surface min-h-screen flex flex-col font-sans">
            <header className="px-4 py-4 bg-white flex items-center gap-3 shadow-sm z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-dark" />
                </button>
                <h1 className="text-xl font-bold text-dark">Pre-Handover Details</h1>
            </header>

            <main className="flex-1 px-6 py-6 pb-32 overflow-y-auto flex flex-col">
                <p className="text-gray-500 mb-6 text-sm">
                    Take a clear photo of the item right before handing it over to document its current condition.
                </p>

                {/* Hidden File Input */}
                <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Upload Box */}
                <div
                    onClick={handleUploadClick}
                    className={`w-full aspect-square rounded-2xl border-2 overflow-hidden flex flex-col items-center justify-center mb-2 cursor-pointer transition-colors ${photoDataUrl
                        ? 'border-primary border-solid'
                        : 'border-dashed border-primary bg-primary/10 hover:bg-primary/20'
                        }`}
                >
                    {photoDataUrl ? (
                        <img src={photoDataUrl} alt="Pre-handover" className="w-full h-full object-cover" />
                    ) : (
                        <>
                            <UploadCloud size={48} className="text-primary-dark mb-4" />
                            <span className="font-bold text-dark text-lg mb-1">Tap to Upload Photo</span>
                            <span className="text-gray-500 text-sm">Camera or Gallery</span>
                        </>
                    )}
                </div>
                <div className="text-center mb-8">
                    <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                        MANDATORY
                    </span>
                </div>

                {/* Item Value Input */}
                <div className="space-y-2 mb-auto">
                    <label className="text-sm font-bold text-dark">
                        Declare Item Value (₹)
                    </label>
                    <p className="text-xs text-gray-400 mb-2">
                        Used to calculate the 25% security deposit required from the borrower.
                    </p>
                    <input
                        type="number"
                        value={itemValue}
                        onChange={(e) => setItemValue(e.target.value)}
                        placeholder="E.g. 2000"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark font-black text-xl"
                    />
                </div>

                <button
                    onClick={handleConfirm}
                    disabled={!isReady}
                    className={`w-full mt-8 font-bold text-lg py-4 rounded-pill transition-all flex items-center justify-center gap-2 ${isReady
                        ? 'bg-primary text-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    Confirm Handover State
                </button>
            </main>
        </div>
    );
}
