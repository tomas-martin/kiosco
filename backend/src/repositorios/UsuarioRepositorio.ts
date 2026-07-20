import { Rol, Usuario } from '@prisma/client';
import prisma from '../configuraciones/db';

export class UsuarioRepositorio {
  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({
      where: { email },
    });
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({
      where: { id },
    });
  }

  async crear(datos: {
    email: string;
    contrasena: string;
    nombre: string;
    rol?: Rol;
  }): Promise<Usuario> {
    return prisma.usuario.create({
      data: {
        email: datos.email,
        contrasena: datos.contrasena,
        nombre: datos.nombre,
        rol: datos.rol,
      },
    });
  }

  async contarUsuarios(): Promise<number> {
    return prisma.usuario.count();
  }

  async guardarTokenRefresco(usuarioId: string, token: string, fechaExpiracion: Date) {
    return prisma.tokenRefresco.upsert({
      where: { token },
      update: { fechaExpiracion },
      create: {
        token,
        usuarioId,
        fechaExpiracion,
      },
    });
  }

  async buscarTokenRefresco(token: string) {
    return prisma.tokenRefresco.findUnique({
      where: { token },
      include: { usuario: true },
    });
  }

  async eliminarTokenRefresco(token: string) {
    return prisma.tokenRefresco.deleteMany({
      where: { token },
    });
  }

  async eliminarTodosTokensRefresco(usuarioId: string) {
    return prisma.tokenRefresco.deleteMany({
      where: { usuarioId },
    });
  }
}
