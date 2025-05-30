import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase'; // Assuming 'storage' is exported from your main firebase.ts

/**
 * Uploads a file to Firebase Storage and returns its public download URL.
 * @param file The file to upload.
 * @param path The path in Firebase Storage where the file should be saved (e.g., 'siteLogos/logo.png').
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
  if (!file) {
    throw new Error('No file provided for upload.');
  }
  if (!path) {
    throw new Error('No storage path provided for upload.');
  }

  const storageRef = ref(storage, path);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    // Consider more specific error handling or re-throwing a custom error
    throw new Error('File upload failed.');
  }
}; 