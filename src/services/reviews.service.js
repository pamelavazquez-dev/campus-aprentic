import { collection, doc, setDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { reviewConverter } from '../schemas/review.schema';

const COLLECTION_NAME = 'reviews';

export const createReview = async (id, data) => {
  const docRef = doc(db, COLLECTION_NAME, id).withConverter(reviewConverter);
  await setDoc(docRef, data);
  return id;
};

export const getReviewsByPromocion = async (promocionId) => {
  const q = query(collection(db, COLLECTION_NAME), where("promocion_id", "==", promocionId)).withConverter(reviewConverter);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
};

export const getAllReviews = async () => {
  const q = query(collection(db, COLLECTION_NAME)).withConverter(reviewConverter);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
};

export const deleteReview = async (id) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};
