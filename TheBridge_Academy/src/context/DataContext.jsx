import React, { createContext, useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
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
  const { user } = useAuth();

  useEffect(() => {
    if (!db || !user) {
      if (!user) {
        setModulos([]);
        setPromociones([]);
        setCampuses([]);
        setLoading(false);
      }
      return;
    }

    let loadedCount = 0;
    const TOTAL_COLLECTIONS = 3; // modulos, promociones, campus
    const checkLoading = () => {
      loadedCount++;
      if (loadedCount >= TOTAL_COLLECTIONS) setLoading(false);
    };

    const unsubModulos = onSnapshot(collection(db, 'modulos'), (snapshot) => {
      setModulos(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
      if (loadedCount < TOTAL_COLLECTIONS) checkLoading();
    }, (error) => console.error(error));

    const unsubPromociones = onSnapshot(collection(db, 'promociones'), (snapshot) => {
      setPromociones(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
      if (loadedCount < TOTAL_COLLECTIONS) checkLoading();
    }, (error) => console.error(error));



    const unsubCampus = onSnapshot(collection(db, 'campus'), (snapshot) => {
      setCampuses(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
      if (loadedCount < TOTAL_COLLECTIONS) checkLoading();
    }, (error) => console.error(error));

    return () => {
      unsubModulos();
      unsubPromociones();
      unsubCampus();
    };
  }, [user]);

  return (
    <DataContext.Provider value={{ modulos, promociones, campuses, loading }}>
      {children}
    </DataContext.Provider>
  );
};
