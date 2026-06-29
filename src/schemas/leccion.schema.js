import { Leccion } from '../models/Leccion.model.js';

export const leccionConverter = {
  toFirestore: (leccion) => ({
    modulo_id: leccion.modulo_id,
    titulo: leccion.titulo,
    descripcion: leccion.descripcion,
    contenido_url: leccion.contenido_url,
    videos_url: leccion.videos_url
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new Leccion(
      snapshot.id,
      data.modulo_id || '',
      data.titulo || '',
      data.descripcion || data.description || '',
      data.contenido_url || '',
      data.videos_url || []
    );
  }
};
