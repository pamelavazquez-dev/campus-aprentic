import React, { createContext, useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export const DataContext = createContext({
  modulos: [],
  promociones: [],
  usuarios: [],
  equipo: [],
  loading: true,
});

export const DataProvider = ({ children }) => {
  const [modulos, setModulos] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [alumnosList, setAlumnosList] = useState([]);
  const [profesoresList, setProfesoresList] = useState([]);
  const [adminsList, setAdminsList] = useState([]);
  const [campuses, setCampuses] = useState([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    let loadedCount = 0;
    const TOTAL_COLLECTIONS = 6; // modulos, promociones, alumnos, profesor, admin, campus
    const checkLoading = () => {
      loadedCount++;
      if (loadedCount >= TOTAL_COLLECTIONS) setLoading(false);
    };

    // Helper to normalize data and add role
    // IMPORTANT: rol goes AFTER spread so stored data can't overwrite it.
    // _collection tracks the source collection for reliable CRUD writes.
    const normalize = (docSnap, role, collectionName) => ({
      id: docSnap.id,
      ...docSnap.data(),
      rol: role,
      _collection: collectionName,
    });

    const unsubModulos = onSnapshot(collection(db, 'modulos'), (snapshot) => {
      setModulos(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
      if (loadedCount < TOTAL_COLLECTIONS) checkLoading();
    }, (error) => console.error(error));

    const unsubPromociones = onSnapshot(collection(db, 'promociones'), (snapshot) => {
      setPromociones(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
      if (loadedCount < TOTAL_COLLECTIONS) checkLoading();
    }, (error) => console.error(error));

    const unsubAlumnos = onSnapshot(collection(db, 'alumnos'), (snapshot) => {
      setAlumnosList(snapshot.docs.map(doc => normalize(doc, 'Alumno', 'alumnos')));
      if (loadedCount < TOTAL_COLLECTIONS) checkLoading();
    }, (error) => console.error(error));

    const unsubProfes = onSnapshot(collection(db, 'profesores'), (snapshot) => {
      setProfesoresList(snapshot.docs.map(doc => normalize(doc, 'Instructor', 'profesores')));
      if (loadedCount < TOTAL_COLLECTIONS) checkLoading();
    }, (error) => console.error(error));

    const unsubAdmins = onSnapshot(collection(db, 'admin'), (snapshot) => {
      setAdminsList(snapshot.docs.map(doc => normalize(doc, 'Administrador', 'admin')));
      if (loadedCount < TOTAL_COLLECTIONS) checkLoading();
    }, (error) => console.error(error));

    const unsubCampus = onSnapshot(collection(db, 'campus'), (snapshot) => {
      setCampuses(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
      if (loadedCount < TOTAL_COLLECTIONS) checkLoading();
    }, (error) => console.error(error));

    return () => {
      unsubModulos();
      unsubPromociones();
      unsubAlumnos();
      unsubProfes();
      unsubAdmins();
      unsubCampus();
    };
  }, []);

  // Consolidar todos los usuarios (deduplicar por ID para evitar claves React duplicadas)
  const allUsers = [...adminsList, ...profesoresList, ...alumnosList];
  const seenIds = new Set();
  const usuarios = allUsers.filter(u => {
    if (seenIds.has(u.id)) return false;
    seenIds.add(u.id);
    return true;
  });
  // Equipo: solo admins e instructores
  const equipo = [...adminsList, ...profesoresList].filter((u, i, arr) => arr.findIndex(x => x.id === u.id) === i);

  return (
    <DataContext.Provider value={{ modulos, promociones, campuses, usuarios, equipo, loading }}>
      {children}
    </DataContext.Provider>
  );
};
