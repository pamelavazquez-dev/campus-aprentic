export class Review {
  constructor(id, promocion_id, alumno_id, rating, comentario, fecha) {
    this.id = id;
    this.promocion_id = promocion_id;
    this.alumno_id = alumno_id;
    this.rating = rating;
    this.comentario = comentario;
    this.fecha = fecha;
  }
}
