import { getDoc, getAll, createDoc, updateDoc, deleteDoc } from './base.service';
import { proyectoConverter, Proyecto } from '../models/Proyecto.model';
import { proyectoEntregaSchema } from '../schemas/app.schemas';
import { validateData } from '../schemas/validation';

const COLLECTION = 'proyectos';

const buildProyecto = (id, data) => (
  data instanceof Proyecto
    ? data
    : new Proyecto(
      id,
      data.titulo,
      data.descripcion,
      data.promocionId,
      data.alumnoIds,
      data.notas,
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
    alumnoIds: [data.alumnoId],
    alumnoEmail: data.alumnoEmail,
    alumnoAuthUid: data.alumnoAuthUid,
    notas: [],
    estado: 'entregado',
    entregadoEn: data.entregadoEn || now,
    actualizadoEn: now,
  });

  if (data.proyectoId) {
    return updateProyecto(data.proyectoId, entregaData);
  }

  return createProyecto(null, entregaData);
};
