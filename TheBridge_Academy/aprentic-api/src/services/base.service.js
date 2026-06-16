const { db } = require('../config/db');

function collection(name) {
  return db.collection(name);
}

async function getDoc(collectionName, id) {
  const doc = await collection(collectionName).doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

async function getAll(collectionName) {
  const snapshot = await collection(collectionName).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function createDoc(collectionName, id, data) {
  await collection(collectionName).doc(id).set(data);
  return { id, ...data };
}

async function updateDoc(collectionName, id, data) {
  const ref = collection(collectionName).doc(id);
  await ref.update(data);
  const updated = await ref.get();
  return { id: updated.id, ...updated.data() };
}

async function deleteDoc(collectionName, id) {
  await collection(collectionName).doc(id).delete();
}

module.exports = {
  getDoc,
  getAll,
  createDoc,
  updateDoc,
  deleteDoc,
};
