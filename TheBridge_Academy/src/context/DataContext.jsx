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
    const normalize = (doc, role) => ({
      id: doc.id,
      rol: role,
      ...doc.data()
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
      setAlumnosList(snapshot.docs.map(doc => normalize(doc, 'Alumno')));
      if (loadedCount < TOTAL_COLLECTIONS) checkLoading();
    }, (error) => console.error(error));

    const unsubProfes = onSnapshot(collection(db, 'profesores'), (snapshot) => {
      setProfesoresList(snapshot.docs.map(doc => normalize(doc, 'Instructor')));
      if (loadedCount < TOTAL_COLLECTIONS) checkLoading();
    }, (error) => console.error(error));

    const unsubAdmins = onSnapshot(collection(db, 'admin'), (snapshot) => {
      setAdminsList(snapshot.docs.map(doc => normalize(doc, 'Administrador')));
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

  // Consolidar todos los usuarios
  const usuarios = [...adminsList, ...profesoresList, ...alumnosList];
  // Equipo: solo admins e instructores
  const equipo = [...adminsList, ...profesoresList];

  return (
    <DataContext.Provider value={{ modulos, promociones, campuses, usuarios, equipo, loading }}>
      {children}
    </DataContext.Provider>
  );
};
