import { Request, Response, NextFunction } from 'express';
import { ErrorPersonalizado } from '../utilidades/ErrorPersonalizado';
import { ZodError } from 'zod';

export function manejadorErrores(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[ERROR] ${req.method} ${req.path} ->`, error);

  // 1. Errores de Validación de Zod
  if (error instanceof ZodError) {
    return res.status(400).json({
      exito: false,
      mensaje: 'Error de validación en los datos de la petición.',
      errores: error.errors.map((err) => ({
        campo: err.path.join('.'),
        mensaje: err.message,
      })),
    });
  }

  // 2. Errores Personalizados de Aplicación
  if (error instanceof ErrorPersonalizado) {
    return res.status(error.codigoEstado).json({
      exito: false,
      mensaje: error.message,
      detalles: error.detalles || null,
    });
  }

  // 3. Errores conocidos de Prisma (ej. Violación de restricción única)
  if ('code' in error && typeof error.code === 'string') {
    if (error.code === 'P2002') {
      return res.status(409).json({
        exito: false,
        mensaje: 'Ya existe un registro con esos datos (campo duplicado).',
      });
    }
  }

  // 4. Errores Generales / Desconocidos
  const enDesarrollo = process.env.NODE_ENV === 'development';
  return res.status(500).json({
    exito: false,
    mensaje: 'Ha ocurrido un error inesperado en el servidor.',
    error: enDesarrollo ? error.message : undefined,
    stack: enDesarrollo ? error.stack : undefined,
  });
}
