import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, UploadCloud, AlertTriangle, AlertOctagon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadTransactionPhoto } from '../services/storageService';
import { updateTransaction } from '../services/transactionService';
import { recalculateTrustScore } from '../services/trustService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function PostReturn() {
    const navigate = useNavigate();
    const { id } = useParams(); // Transaction ID
    const [photoDataUrl, setPhotoDataUrl] = useState(null);
    const [fileBlob, setFileBlob] = useState(null);
    const [condition, setCondition] = useState(null); // 'good', 'minor', 'major'
    const [isSaving, setIsSaving] = useState(false);
    const [txData, setTxData] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchTx = async () => {
            const docSnap = await getDoc(doc(db, "transactions", id));
            if (docSnap.exists()) {
                setTxData(docSnap.data());
            }
        };
        fetchTx();
    }, [id]);

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileBlob(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoDataUrl(reader.result);
                toast.success("Post-return photo attached!");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConfirm = async () => {
        if (!fileBlob || !condition || !txData) return;
        setIsSaving(true);
        const toastId = toast.loading("Processing return...");

        try {
            // 1. Upload the post-return photo
            const photoUrl = await uploadTransactionPhoto(fileBlob, id, 'post_return');

            const isGood = condition === 'good';
            const finalStatus = isGood ? 'completed' : 'disputed';

            // 2. Update transaction
            await updateTransaction(id, {
                status: finalStatus,
                condition: condition,
                postReturnPhotoURL: photoUrl,
                returnedAt: new Date()
            });

            // 3. Recalculate Trust Score for Borrower
            // Dummy logic: give 5 stars if good, 2 if minor, 1 if major
            const rating = isGood ? 5 : (condition === 'minor' ? 3 : 1);
            await recalculateTrustScore(txData.borrowerId, rating, isGood, 100);

            if (isGood) {
                toast.success("Deposit fully refunded. Transferring earnings.", { id: toastId });
            } else {
                toast.error("Dispute initiated. Admin will review.", { id: toastId });
            }
            navigate('/lender'); // back to lender home
        } catch (error) {
            console.error(error);
            toast.error("Failed to process return.", { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const isReady = photoDataUrl && condition !== null && !isSaving;

    return (
        <div className="bg-surface min-h-screen flex flex-col font-sans">
            <header className="px-4 py-4 bg-white flex items-center gap-3 shadow-sm z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-dark" />
                </button>
                <h1 className="text-xl font-bold text-dark">Confirm Return</h1>
            </header>

            <main className="flex-1 px-4 py-6 pb-32 overflow-y-auto flex flex-col">
                <p className="text-gray-500 mb-6 text-sm px-2">
                    Compare the original state with the current state to release the borrower's deposit.
                </p>

                {/* Side-by-Side Photos */}
                <div className="flex gap-4 mb-8">
                    {/* Before Photo */}
                    <div className="flex-1 flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Before</span>
                        <div className="bg-gray-200 rounded-2xl aspect-square flex items-center justify-center relative overflow-hidden">
                            {/* Mock image placeholder */}
                            <div className="absolute inset-0 bg-gray-300 opacity-50 flex items-center justify-center">
                                <span className="text-gray-500 font-medium text-xs">Original Photo</span>
                            </div>
                        </div>
                    </div>

                    {/* After Photo Upload */}
                    <div className="flex-1 flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">After</span>

                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        <div
                            onClick={handleUploadClick}
                            className={`rounded-2xl aspect-square border-2 overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-colors ${photoDataUrl
                                ? 'border-primary border-solid'
                                : 'border-gray-300 bg-white border-dashed hover:bg-gray-50'
                                }`}
                        >
                            {photoDataUrl ? (
                                <img src={photoDataUrl} alt="Post-return" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <UploadCloud size={24} className="text-gray-400 mb-2" />
                                    <span className="text-xs text-gray-500 font-medium">Tap to Upload</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Condition Assesment */}
                <div className="mb-auto">
                    <h2 className="text-lg font-bold text-dark mb-3 px-2">Assess Condition</h2>
                    <div className="flex flex-col gap-3">
                        {/* Good */}
                        <button
                            onClick={() => setCondition('good')}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${condition === 'good'
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-100 bg-white hover:border-gray-200'
                                }`}
                        >
                            <CheckCircle2 size={24} className={condition === 'good' ? 'text-green-500' : 'text-gray-300'} />
                            <div className="text-left flex-1">
                                <div className={`font-bold ${condition === 'good' ? 'text-green-700' : 'text-dark'}`}>Good Condition</div>
                                <div className="text-xs text-gray-500 mt-0.5">As it was handed over. Full refund.</div>
                            </div>
                        </button>

                        {/* Minor Damage */}
                        <button
                            onClick={() => setCondition('minor')}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${condition === 'minor'
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-100 bg-white hover:border-gray-200'
                                }`}
                        >
                            <AlertTriangle size={24} className={condition === 'minor' ? 'text-orange-500' : 'text-gray-300'} />
                            <div className="text-left flex-1">
                                <div className={`font-bold ${condition === 'minor' ? 'text-orange-700' : 'text-dark'}`}>Minor Damage</div>
                                <div className="text-xs text-gray-500 mt-0.5">Scratches/dirt. Partial deposit claim.</div>
                            </div>
                        </button>

                        {/* Major Damage */}
                        <button
                            onClick={() => setCondition('major')}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${condition === 'major'
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-100 bg-white hover:border-gray-200'
                                }`}
                        >
                            <AlertOctagon size={24} className={condition === 'major' ? 'text-red-500' : 'text-gray-300'} />
                            <div className="text-left flex-1">
                                <div className={`font-bold ${condition === 'major' ? 'text-red-700' : 'text-dark'}`}>Major Damage/Lost</div>
                                <div className="text-xs text-gray-500 mt-0.5">Item unusable. Full deposit claim.</div>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={handleConfirm}
                        disabled={!isReady}
                        className={`w-full font-bold text-lg py-4 rounded-pill transition-all ${isReady
                            ? (condition === 'good' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 hover:scale-[1.02] active:scale-[0.98]' : 'bg-dark text-white shadow-lg')
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {condition === 'good' ? 'Confirm Return & Refund' : condition ? 'Raise Dispute' : 'Select Condition'}
                    </button>
                </div>
            </main>
        </div>
    );
}
