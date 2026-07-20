import { Router } from 'express';
import { AutenticacionControlador } from '../controladores/AutenticacionControlador';

const rutas = Router();
const controlador = new AutenticacionControlador();

rutas.post('/registro', controlador.registro);
rutas.post('/acceso', controlador.acceso);
rutas.post('/refrescar-token', controlador.refrescarToken);
rutas.post('/salir', controlador.salir);
rutas.post('/recuperar-contrasena', controlador.recuperarContrasena);
rutas.post('/redefinir-contrasena', controlador.redefinirContrasena);

export default rutas;
