import { useInfiniteQuery } from '@tanstack/react-query';
import { collection, query, limit, getDocs, startAfter, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebase';

const PAGE_SIZE = 10;

export const useUsuarios = (rolFilter, campusFilter = '') => {
  return useInfiniteQuery({
    queryKey: ['usuarios', rolFilter, campusFilter],
    queryFn: async ({ pageParam = null }) => {
      if (!rolFilter) return { docs: [], lastVisible: null };

      // Map rol to collection
      let collectionName = '';
      let roleLabel = '';
      if (rolFilter === 'Administrador') {
        collectionName = 'admin';
        roleLabel = 'Administrador';
      } else if (rolFilter === 'Instructor') {
        collectionName = 'profesores';
        roleLabel = 'Instructor';
      } else if (rolFilter === 'Alumno') {
        collectionName = 'alumnos';
        roleLabel = 'Alumno';
      }

      if (!collectionName) {
         return { docs: [], lastVisible: null };
      }

      const q = collection(db, collectionName);
      
      let firestoreQuery = query(q, limit(PAGE_SIZE));

      if (pageParam) {
        firestoreQuery = query(firestoreQuery, startAfter(pageParam));
      }

      const snapshot = await getDocs(firestoreQuery);
      
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        rol: roleLabel,
        _collection: collectionName,
      }));

      // Filtrado local por campus para evitar complejidad de índices compuestos en Firebase durante el MVP.
      const filteredDocs = campusFilter 
        ? docs.filter(u => {
            const cId = u.campus_id?.id || u.campus_id || u.campus_asignados?.[0] || u.campus || '';
            return typeof cId === 'string' ? cId.includes(campusFilter) : cId === campusFilter;
          }) 
        : docs;

      const lastVisible = snapshot.docs.length === PAGE_SIZE ? snapshot.docs[snapshot.docs.length - 1] : null;

      return {
        docs: filteredDocs,
        lastVisible,
      };
    },
    getNextPageParam: (lastPage) => lastPage?.lastVisible || undefined,
    enabled: !!rolFilter, // Sólo se ejecuta si hay un rol seleccionado (Opción 2)
  });
};
