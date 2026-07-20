import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Rol, Usuario } from '@prisma/client';
import { UsuarioRepositorio } from '../repositorios/UsuarioRepositorio';
import {
  ErrorConflicto,
  ErrorNoAutorizado,
  ErrorNoEncontrado,
  ErrorPeticionIncorrecta,
} from '../utilidades/ErrorPersonalizado';

export class AutenticacionServicio {
  private usuarioRepositorio = new UsuarioRepositorio();

  private generarTokenAcceso(usuario: Usuario): string {
    const secreto = process.env.JWT_SECRET || 'stockflow_clave_secreta_acceso_super_segura_2026';
    const expiracion = process.env.JWT_EXPIRACION_ACCESO || '15m';
    return jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      secreto,
      { expiresIn: expiracion as any }
    );
  }

  private generarTokenRefresco(usuario: Usuario): string {
    const secreto = process.env.JWT_REFRESH_SECRET || 'stockflow_clave_secreta_refresco_super_segura_2026';
    const expiracion = process.env.JWT_EXPIRACION_REFRESCO || '7d';
    return jwt.sign(
      { id: usuario.id },
      secreto,
      { expiresIn: expiracion as any }
    );
  }

  async registro(datos: {
    email: string;
    contrasena: string;
    nombre: string;
    rol?: Rol;
  }) {
    const usuarioExistente = await this.usuarioRepositorio.buscarPorEmail(datos.email);
    if (usuarioExistente) {
      throw new ErrorConflicto('El correo electrónico ya está registrado.');
    }

    const contrasenaHash = await bcrypt.hash(datos.contrasena, 10);
    
    // Si es el primer usuario, se crea como ADMINISTRADOR de forma automatica
    const cantidadUsuarios = await this.usuarioRepositorio.contarUsuarios();
    const rolUsuario = cantidadUsuarios === 0 ? Rol.ADMINISTRADOR : (datos.rol || Rol.EMPLEADO);

    const nuevoUsuario = await this.usuarioRepositorio.crear({
      email: datos.email,
      contrasena: contrasenaHash,
      nombre: datos.nombre,
      rol: rolUsuario,
    });

    const { contrasena, ...usuarioSinContrasena } = nuevoUsuario;
    return usuarioSinContrasena;
  }

  async acceso(email: string, contrasenaProporcionada: string) {
    const usuario = await this.usuarioRepositorio.buscarPorEmail(email);
    if (!usuario) {
      throw new ErrorNoAutorizado('Credenciales incorrectas.');
    }

    if (usuario.estado !== 'ACTIVO') {
      throw new ErrorNoAutorizado('El usuario se encuentra inactivo. Consulte al administrador.');
    }

    const contrasenaValida = await bcrypt.compare(contrasenaProporcionada, usuario.contrasena);
    if (!contrasenaValida) {
      throw new ErrorNoAutorizado('Credenciales incorrectas.');
    }

    const tokenAcceso = this.generarTokenAcceso(usuario);
    const tokenRefresco = this.generarTokenRefresco(usuario);

    // Guardar token de refresco en base de datos (expira en 7 dias por defecto)
    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(fechaExpiracion.getDate() + 7);
    await this.usuarioRepositorio.guardarTokenRefresco(usuario.id, tokenRefresco, fechaExpiracion);

    const { contrasena, ...usuarioSinContrasena } = usuario;
    return {
      usuario: usuarioSinContrasena,
      tokenAcceso,
      tokenRefresco,
    };
  }

  async refrescarToken(tokenRefrescoActual: string) {
    if (!tokenRefrescoActual) {
      throw new ErrorPeticionIncorrecta('Token de refresco requerido.');
    }

    const tokenGuardado = await this.usuarioRepositorio.buscarTokenRefresco(tokenRefrescoActual);
    if (!tokenGuardado) {
      throw new ErrorNoAutorizado('Token de refresco no válido o inexistente.');
    }

    if (new Date() > tokenGuardado.fechaExpiracion) {
      // Si expiro, lo limpiamos de la base de datos
      await this.usuarioRepositorio.eliminarTokenRefresco(tokenRefrescoActual);
      throw new ErrorNoAutorizado('El token de refresco ha expirado. Inicie sesión nuevamente.');
    }

    // Generar nuevos tokens (Rotación de Refresh Tokens para mayor seguridad)
    const usuario = tokenGuardado.usuario;
    const nuevoTokenAcceso = this.generarTokenAcceso(usuario);
    const nuevoTokenRefresco = this.generarTokenRefresco(usuario);

    // Eliminar el viejo y guardar el nuevo token de refresco
    await this.usuarioRepositorio.eliminarTokenRefresco(tokenRefrescoActual);
    
    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(fechaExpiracion.getDate() + 7);
    await this.usuarioRepositorio.guardarTokenRefresco(usuario.id, nuevoTokenRefresco, fechaExpiracion);

    return {
      tokenAcceso: nuevoTokenAcceso,
      tokenRefresco: nuevoTokenRefresco,
    };
  }

  async salir(tokenRefresco: string) {
    if (tokenRefresco) {
      await this.usuarioRepositorio.eliminarTokenRefresco(tokenRefresco);
    }
    return { exito: true };
  }

  async recuperarContrasena(email: string) {
    const usuario = await this.usuarioRepositorio.buscarPorEmail(email);
    if (!usuario) {
      // Por seguridad, no informamos si el email no existe, pero retornamos un mensaje generico
      return { mensaje: 'Si el correo electrónico está registrado, se enviará un enlace de recuperación.' };
    }

    const secreto = process.env.JWT_SECRET || 'stockflow_clave_secreta_acceso_super_segura_2026';
    const tokenRecuperacion = jwt.sign(
      { email: usuario.email },
      secreto,
      { expiresIn: '1h' }
    );

    // TODO: Integrar nodemailer real para producción. Por ahora, mostramos en consola el token de prueba
    console.log(`[RECUPERACIÓN DE CONTRASEÑA] Token generado para ${email}: ${tokenRecuperacion}`);
    
    return {
      mensaje: 'Si el correo electrónico está registrado, se enviará un enlace de recuperación.',
      // Enviamos el token en desarrollo para facilitar las pruebas del frontend
      tokenPrueba: process.env.NODE_ENV === 'development' ? tokenRecuperacion : undefined,
    };
  }

  async redefinirContrasena(token: string, nuevaContrasena: string) {
    const secreto = process.env.JWT_SECRET || 'stockflow_clave_secreta_acceso_super_segura_2026';
    
    try {
      const decodificado = jwt.verify(token, secreto) as { email: string };
      const usuario = await this.usuarioRepositorio.buscarPorEmail(decodificado.email);
      if (!usuario) {
        throw new ErrorNoEncontrado('Usuario no encontrado.');
      }

      const contrasenaHash = await bcrypt.hash(nuevaContrasena, 10);
      
      // Actualizar contrasena en base de datos y limpiar tokens de refresco
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { contrasena: contrasenaHash },
      });
      await this.usuarioRepositorio.eliminarTodosTokensRefresco(usuario.id);

      return { exito: true };
    } catch (error) {
      throw new ErrorPeticionIncorrecta('El token de recuperación es inválido o ha expirado.');
    }
  }
}

// Necesitamos importar prisma para el metodo de redefinirContrasena
import prisma from '../configuraciones/db';
