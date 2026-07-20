import { Request } from 'express';
import { Rol } from '@prisma/client';

export interface PeticionAutenticada extends Request {
  usuario?: {
    id: string;
    email: string;
    rol: Rol;
  };
}
