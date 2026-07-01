import { getDoc, getAll, createDoc, updateDoc, deleteDoc } from './base.service';
import { proyectoConverter, Proyecto } from '../models/Proyecto.model';
import { proyectoEntregaSchema } from '../schemas/app.schemas';
import { validateData } from '../schemas/validation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION = 'proyectos';

const buildProyecto = (id, data) => (
  data instanceof Proyecto
    ? data
    : new Proyecto(
      id,
      data.titulo,
      data.descripcion,
      data.promocionId,
      data.estado,
      data.alumnoId,
      data.alumnoEmail,
      data.alumnoAuthUid,
      data.moduloId,
      data.leccionId,
      data.archivoUrl,
      data.archivoNombre,
      data.entregadoEn,
      data.actualizadoEn
    )
);

export const getProyectoById = (id) => getDoc(COLLECTION, id, proyectoConverter);
export const getAllProyectos = () => getAll(COLLECTION, proyectoConverter);
export const getProyectosByModuloId = async (moduloId) => {
  if (!moduloId) return [];
  const { doc } = await import('firebase/firestore');
  const moduloRef = doc(db, 'modulos', moduloId);
  const q = query(
    collection(db, COLLECTION).withConverter(proyectoConverter), 
    where('moduloId', 'in', [moduloId, moduloRef])
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(document => document.data());
};

export const createProyecto = (id, data) => {
  const model = buildProyecto(id, data);
  return createDoc(COLLECTION, id, model, proyectoConverter);
};

export const updateProyecto = (id, data) => {
  const model = buildProyecto(id, data);
  return updateDoc(COLLECTION, id, model, proyectoConverter);
};

export const deleteProyecto = (id) => deleteDoc(COLLECTION, id);

export const guardarEntregaProyecto = async (data) => {
  const now = new Date().toISOString();

  const entregaData = validateData(proyectoEntregaSchema, {
    ...data,
    archivoUrl: data.archivoUrl,
    archivoNombre: data.archivoNombre || data.archivoUrl,
    alumnoEmail: data.alumnoEmail,
    alumnoAuthUid: data.alumnoAuthUid,
    estado: 'entregado',
    entregadoEn: data.entregadoEn || now,
    actualizadoEn: now,
  });

  if (data.proyectoId) {
    return updateProyecto(data.proyectoId, entregaData);
  }

  return createProyecto(null, entregaData);
};
