import { Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { Rol } from '@prisma/client';
import { PeticionAutenticada } from '../tipos';
import { ErrorNoAutorizado, ErrorProhibido } from '../utilidades/ErrorPersonalizado';

export function autenticar(
  req: PeticionAutenticada,
  res: Response,
  next: NextFunction
) {
  try {
    const cabeceraAutorizacion = req.headers.authorization;

    if (!cabeceraAutorizacion || !cabeceraAutorizacion.startsWith('Bearer ')) {
      throw new ErrorNoAutorizado('Falta el token de autorización o el formato es inválido.');
    }

    const token = cabeceraAutorizacion.split(' ')[1];
    const claveSecreta = process.env.JWT_SECRET || 'stockflow_clave_secreta_acceso_super_segura_2026';

    const decodificado = jwt.verify(token, claveSecreta) as {
      id: string;
      email: string;
      rol: Rol;
    };

    req.usuario = {
      id: decodificado.id,
      email: decodificado.email,
      rol: decodificado.rol,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new ErrorNoAutorizado('El token de sesión ha expirado.'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new ErrorNoAutorizado('Token de sesión inválido.'));
    } else {
      next(error);
    }
  }
}

export function autorizar(rolesPermitidos: Rol[]) {
  return (req: PeticionAutenticada, res: Response, next: NextFunction) => {
    try {
      if (!req.usuario) {
        throw new ErrorNoAutorizado('Debe iniciar sesión para realizar esta acción.');
      }

      if (!rolesPermitidos.includes(req.usuario.rol)) {
        throw new ErrorProhibido('No tiene permisos suficientes para realizar esta acción.');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
