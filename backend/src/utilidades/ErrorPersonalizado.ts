export class ErrorPersonalizado extends Error {
  public readonly codigoEstado: number;
  public readonly detalles?: any;

  constructor(mensaje: string, codigoEstado: number = 500, detalles?: any) {
    super(mensaje);
    this.codigoEstado = codigoEstado;
    this.detalles = detalles;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ErrorPeticionIncorrecta extends ErrorPersonalizado {
  constructor(mensaje: string = 'Petición incorrecta', detalles?: any) {
    super(mensaje, 400, detalles);
  }
}

export class ErrorNoAutorizado extends ErrorPersonalizado {
  constructor(mensaje: string = 'No autorizado') {
    super(mensaje, 401);
  }
}

export class ErrorProhibido extends ErrorPersonalizado {
  constructor(mensaje: string = 'Acceso prohibido') {
    super(mensaje, 403);
  }
}

export class ErrorNoEncontrado extends ErrorPersonalizado {
  constructor(mensaje: string = 'Recurso no encontrado') {
    super(mensaje, 404);
  }
}

export class ErrorConflicto extends ErrorPersonalizado {
  constructor(mensaje: string = 'Conflicto en el recurso') {
    super(mensaje, 409);
  }
}
