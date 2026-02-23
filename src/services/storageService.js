import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config";

/**
 * Uploads a photo to Firebase Storage and returns its public URL
 * @param {File} file - The image file to upload
 * @param {string} transactionId - The ID of the transaction this belongs to
 * @param {string} type - "pre_handover" or "post_return"
 * @returns {Promise<string>} The public download URL
 */
export const uploadTransactionPhoto = async (file, transactionId, type) => {
    if (!file) throw new Error("No file provided");

    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${type}.${extension}`;
    const storageRef = ref(storage, `transactions/${transactionId}/${filename}`);

    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log(`Uploaded ${type} photo for Tx ${transactionId}:`, downloadURL);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading photo to Firebase Storage:", error);
        throw error;
    }
};
