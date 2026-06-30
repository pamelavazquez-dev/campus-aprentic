import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserRole } from '../services/roles.service';

let authInitPromise = null;
let resolveAuthInit = null;

authInitPromise = new Promise((resolve) => {
  resolveAuthInit = resolve;
});

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshAuthProfile = async () => {
    if (!user) return null;

    const roleData = await getUserRole(user.uid, user.email);
    setRole(roleData?.name || null);
    setProfile(roleData?.profile || null);
    return roleData;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setLoading(true);
        setUser(currentUser);
        try {
          const roleData = await getUserRole(currentUser.uid, currentUser.email);
          setRole(roleData?.name || null);
          setProfile(roleData?.profile || null);
        } catch (error) {
          console.error("Error al obtener el rol del usuario:", error);
          setRole(null);
          setProfile(null);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setRole(null);
        setProfile(null);
        setLoading(false);
      }
      
      if (resolveAuthInit) {
        resolveAuthInit();
        resolveAuthInit = null;
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, profile, loading, authInitPromise, refreshAuthProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
