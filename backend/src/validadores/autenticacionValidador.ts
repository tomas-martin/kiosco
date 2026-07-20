import { z } from 'zod';
import { Rol } from '@prisma/client';

export const RegistroEsquema = z.object({
  email: z
    .string({ required_error: 'El correo electrónico es requerido.' })
    .email('El formato del correo electrónico no es válido.'),
  contrasena: z
    .string({ required_error: 'La contraseña es requerida.' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres.'),
  nombre: z
    .string({ required_error: 'El nombre es requerido.' })
    .min(2, 'El nombre debe tener al menos 2 caracteres.'),
  rol: z
    .nativeEnum(Rol, { errorMap: () => ({ message: 'El rol especificado no es válido.' }) })
    .optional(),
});

export const AccesoEsquema = z.object({
  email: z
    .string({ required_error: 'El correo electrónico es requerido.' })
    .email('El formato del correo electrónico no es válido.'),
  contrasena: z
    .string({ required_error: 'La contraseña es requerida.' })
    .min(1, 'La contraseña no puede estar vacía.'),
});

export const RecuperarContrasenaEsquema = z.object({
  email: z
    .string({ required_error: 'El correo electrónico es requerido.' })
    .email('El formato del correo electrónico no es válido.'),
});

export const RedefinirContrasenaEsquema = z.object({
  token: z
    .string({ required_error: 'El token de recuperación es requerido.' }),
  nuevaContrasena: z
    .string({ required_error: 'La nueva contraseña es requerida.' })
    .min(6, 'La nueva contraseña debe tener al menos 6 caracteres.'),
});
