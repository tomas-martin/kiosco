export type Rol = 'ADMINISTRADOR' | 'CAJERO' | 'EMPLEADO';
export type Estado = 'ACTIVO' | 'INACTIVO';

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
  estado: Estado;
  fechaCreacion: string;
  fechaEdicion: string;
}

export interface RespuestaApi<T = any> {
  exito: boolean;
  mensaje: string;
  datos?: T;
  errores?: Array<{ campo: string; mensaje: string }>;
}
