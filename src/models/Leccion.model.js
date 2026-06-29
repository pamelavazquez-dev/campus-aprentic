export class Leccion {
  constructor(id, modulo_id, titulo, descripcion, contenido_url, videos_url, contenido_markdown = '') {
    this.id = id;
    this.modulo_id = modulo_id;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.contenido_url = contenido_url;
    this.videos_url = videos_url;
    this.contenido_markdown = contenido_markdown;
  }
}

export const leccionConverter = {
  toFirestore: (leccion) => ({
    modulo_id: leccion.modulo_id,
    titulo: leccion.titulo,
    descripcion: leccion.descripcion,
    contenido_url: leccion.contenido_url,
    videos_url: leccion.videos_url,
    contenido_markdown: leccion.contenido_markdown
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new Leccion(
      snapshot.id,
      data.modulo_id || '',
      data.titulo || '',
      data.descripcion || data.description || '',
      data.contenido_url || '',
      data.videos_url || [],
      data.contenido_markdown || ''
    );
  }
};
