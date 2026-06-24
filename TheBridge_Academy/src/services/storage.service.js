import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

export const uploadFile = async (file, path) => {
  if (!storage) throw new Error('Firebase Storage no está inicializado');
  
  const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
  
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
};
