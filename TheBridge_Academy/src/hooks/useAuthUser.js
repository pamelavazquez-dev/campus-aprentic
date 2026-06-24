import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserRole } from '../services/roles.service';

const INITIAL_STATE = {
  user: null,
  role: null,
  profile: null,
  loading: true,
  error: '',
};

const UNCONFIGURED_FIREBASE_STATE = {
  user: null,
  role: null,
  profile: null,
  loading: false,
  error: 'Firebase no esta configurado. Revisa las variables de entorno.',
};

export function useAuthUser() {
  const [session, setSession] = useState(() => (
    auth ? INITIAL_STATE : UNCONFIGURED_FIREBASE_STATE
  ));

  useEffect(() => {
    if (!auth) return undefined;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setSession({ ...INITIAL_STATE, loading: false });
        return;
      }

      try {
        const roleData = await getUserRole(currentUser.uid);
        setSession({
          user: currentUser,
          role: roleData?.name || null,
          profile: roleData?.profile || null,
          loading: false,
          error: '',
        });
      } catch (error) {
        console.error('Error detectando el rol del usuario', error);
        setSession({
          user: currentUser,
          role: null,
          profile: null,
          loading: false,
          error: 'No se pudo comprobar el rol del usuario.',
        });
      }
    });

    return unsubscribe;
  }, []);

  return session;
}
