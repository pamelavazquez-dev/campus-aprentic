import React, { createContext, useState, useEffect } from 'react';
import { collection, query, where, documentId, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';

export const DataContext = createContext({
  modulos: [],
  promociones: [],
  campuses: [],
  loading: true,
});

export const DataProvider = ({ children }) => {
  const [modulos, setModulos] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [campuses, setCampuses] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const { user, role, profile } = useAuth();

  useEffect(() => {
    // Only fetch global data if the user is fully logged in and has a role
    if (!db || !user || !role) {
      if (!user || !role) {
        setModulos([]);
        setPromociones([]);
        setCampuses([]);
        setLoading(false);
      }
      return;
    }

    let loadedCount = 0;
    const isCampusNeeded = role === 'admin';
    const TOTAL_COLLECTIONS = isCampusNeeded ? 3 : 2; // modulos, promociones, (campus si es admin)
    
    const checkLoading = () => {
      loadedCount++;
      if (loadedCount >= TOTAL_COLLECTIONS) setLoading(false);
    };

    let modulosQuery = collection(db, 'modulos');
    let promocionesQuery = collection(db, 'promociones');

    // FIX: Filtrar si es alumno para no descargar la base de datos entera de módulos y promociones
    if (role === 'alumno' && profile) {
      const studentPromos = Array.isArray(profile.promociones_id) ? profile.promociones_id : (profile.promocion_id ? [profile.promocion_id] : []);
      if (studentPromos.length > 0) {
        modulosQuery = query(collection(db, 'modulos'), where('promociones_activas', 'array-contains-any', studentPromos));
        promocionesQuery = query(collection(db, 'promociones'), where(documentId(), 'in', studentPromos));
      }
    }

    const unsubModulos = onSnapshot(modulosQuery, (snapshot) => {
      setModulos(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
      if (loadedCount < TOTAL_COLLECTIONS) checkLoading();
    }, (error) => console.error(error));

    const unsubPromociones = onSnapshot(promocionesQuery, (snapshot) => {
      setPromociones(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
      if (loadedCount < TOTAL_COLLECTIONS) checkLoading();
    }, (error) => console.error(error));

    let unsubCampus = () => {};
    if (isCampusNeeded) {
      unsubCampus = onSnapshot(collection(db, 'campus'), (snapshot) => {
        setCampuses(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
        if (loadedCount < TOTAL_COLLECTIONS) checkLoading();
      }, (error) => console.error(error));
    } else {
      setCampuses([]);
    }

    return () => {
      unsubModulos();
      unsubPromociones();
      unsubCampus();
    };
  }, [user, role]);

  const contextValue = React.useMemo(() => ({
    modulos,
    promociones,
    campuses,
    loading
  }), [modulos, promociones, campuses, loading]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};
