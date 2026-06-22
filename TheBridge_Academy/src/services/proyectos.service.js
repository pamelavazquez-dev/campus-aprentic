import { getDoc, getAll, createDoc, updateDoc, deleteDoc } from './base.service';
import { proyectoConverter, Proyecto } from '../models/Proyecto.model';

const COLLECTION = 'proyectos';

export const getProyectoById = (id) => getDoc(COLLECTION, id, proyectoConverter);
export const getAllProyectos = () => getAll(COLLECTION, proyectoConverter);
export const createProyecto = (id, data) => {
  const model = data instanceof Proyecto ? data : new Proyecto(id, data.titulo, data.descripcion, data.promocionId, data.alumnoIds, data.notas, data.estado);
  return createDoc(COLLECTION, id, model, proyectoConverter);
};
export const updateProyecto = (id, data) => {
  const model = data instanceof Proyecto ? data : new Proyecto(id, data.titulo, data.descripcion, data.promocionId, data.alumnoIds, data.notas, data.estado);
  return updateDoc(COLLECTION, id, model, proyectoConverter);
};
export const deleteProyecto = (id) => deleteDoc(COLLECTION, id);
