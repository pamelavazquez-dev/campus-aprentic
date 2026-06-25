import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
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
          const [adminDoc, profDoc, alumnoDoc] = await Promise.all([
            getDoc(doc(db, 'admin', currentUser.uid)),
            getDoc(doc(db, 'profesores', currentUser.uid)),
            getDoc(doc(db, 'alumnos', currentUser.uid))
          ]);

          if (adminDoc.exists()) {
            setRole('admin');
          } else if (profDoc.exists()) {
            setRole('instructor');
          } else if (alumnoDoc.exists()) {
            setRole('alumno');
          } else {
            setRole(null);
          }
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
