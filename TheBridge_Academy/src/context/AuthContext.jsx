import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          // Intentar primero por UID (si se crearon desde backend sincronizado)
          let foundRole = null;
          const [adminDoc, profDoc, alumnoDoc] = await Promise.all([
            getDoc(doc(db, 'admin', currentUser.uid)),
            getDoc(doc(db, 'profesores', currentUser.uid)),
            getDoc(doc(db, 'alumnos', currentUser.uid))
          ]);

          if (adminDoc.exists()) foundRole = 'admin';
          else if (profDoc.exists()) foundRole = 'instructor';
          else if (alumnoDoc.exists()) foundRole = 'alumno';
          
          // Si no se encuentra por UID, es posible que el documento se creara manualmente
          // en la vista de admin (con ID USR-xxx). Buscamos por email.
          if (!foundRole && currentUser.email) {
            const [adminSnap, profSnap, alumnoSnap] = await Promise.all([
              getDocs(query(collection(db, 'admin'), where('email', '==', currentUser.email))),
              getDocs(query(collection(db, 'profesores'), where('email', '==', currentUser.email))),
              getDocs(query(collection(db, 'alumnos'), where('email', '==', currentUser.email)))
            ]);

            if (!adminSnap.empty) foundRole = 'admin';
            else if (!profSnap.empty) foundRole = 'instructor';
            else if (!alumnoSnap.empty) foundRole = 'alumno';
          }
          
          setRole(foundRole);
        } catch (error) {
          console.error("Error al obtener el rol del usuario:", error);
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
