import { Request, Response, NextFunction } from 'express';
import { AutenticacionServicio } from '../servicios/AutenticacionServicio';
import {
  RegistroEsquema,
  AccesoEsquema,
  RecuperarContrasenaEsquema,
  RedefinirContrasenaEsquema,
} from '../validadores/autenticacionValidador';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
};

export class AutenticacionControlador {
  private autenticacionServicio = new AutenticacionServicio();

  registro = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const datosValidados = RegistroEsquema.parse(req.body);
      const usuario = await this.autenticacionServicio.registro(datosValidados);
      
      res.status(201).json({
        exito: true,
        mensaje: 'Usuario registrado exitosamente.',
        datos: usuario,
      });
    } catch (error) {
      next(error);
    }
  };

  acceso = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const datosValidados = AccesoEsquema.parse(req.body);
      const resultado = await this.autenticacionServicio.acceso(
        datosValidados.email,
        datosValidados.contrasena
      );

      // Guardar token de refresco en cookie segura HTTP-only
      res.cookie('tokenRefresco', resultado.tokenRefresco, COOKIE_OPTIONS);

      res.status(200).json({
        exito: true,
        mensaje: 'Inicio de sesión exitoso.',
        datos: {
          usuario: resultado.usuario,
          tokenAcceso: resultado.tokenAcceso,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  refrescarToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Obtener de cookies o del cuerpo de la petición como fallback
      const tokenRefrescoActual = req.cookies?.tokenRefresco || req.body.tokenRefresco;
      
      const resultado = await this.autenticacionServicio.refrescarToken(tokenRefrescoActual);

      // Renovar la cookie con el nuevo token de refresco
      res.cookie('tokenRefresco', resultado.tokenRefresco, COOKIE_OPTIONS);

      res.status(200).json({
        exito: true,
        mensaje: 'Token de acceso renovado.',
        datos: {
          tokenAcceso: resultado.tokenAcceso,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  salir = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenRefresco = req.cookies?.tokenRefresco || req.body.tokenRefresco;
      
      await this.autenticacionServicio.salir(tokenRefresco);

      // Borrar la cookie del navegador
      res.clearCookie('tokenRefresco', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      res.status(200).json({
        exito: true,
        mensaje: 'Sesión cerrada exitosamente.',
      });
    } catch (error) {
      next(error);
    }
  };

  recuperarContrasena = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const datosValidados = RecuperarContrasenaEsquema.parse(req.body);
      const resultado = await this.autenticacionServicio.recuperarContrasena(datosValidados.email);
      
      res.status(200).json({
        exito: true,
        ...resultado,
      });
    } catch (error) {
      next(error);
    }
  };

  redefinirContrasena = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const datosValidados = RedefinirContrasenaEsquema.parse(req.body);
      await this.autenticacionServicio.redefinirContrasena(
        datosValidados.token,
        datosValidados.nuevaContrasena
      );

      res.status(200).json({
        exito: true,
        mensaje: 'Su contraseña ha sido redefinida con éxito. Por favor, inicie sesión.',
      });
    } catch (error) {
      next(error);
    }
  };
}
