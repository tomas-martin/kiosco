import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { manejadorErrores } from './middlewares/manejadorErrores';
import rutasAutenticacion from './rutas/autenticacionRutas';

const aplicacion = express();

// 1. Middlewares de Seguridad y Utilidades
aplicacion.use(helmet());

// Configuración de CORS permitiendo cookies (para tokens de refresco)
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
aplicacion.use(cors(corsOptions));

aplicacion.use(express.json());
aplicacion.use(cookieParser());

// 2. Limitador de peticiones (Rate Limiter)
const limitador = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por ventana e IP
  message: {
    exito: false,
    mensaje: 'Demasiadas peticiones desde esta dirección IP. Intente de nuevo en 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicamos el limitador a las rutas de autenticación
aplicacion.use('/api/autenticacion', limitador);

// 3. Registro de Rutas
aplicacion.use('/api/autenticacion', rutasAutenticacion);

// Ruta de comprobación de estado de salud (Health Check)
aplicacion.get('/salud', (req, res) => {
  res.status(200).json({
    exito: true,
    mensaje: 'Servidor StockFlow en funcionamiento.',
    fecha: new Date(),
  });
});

// 4. Middleware de Manejo de Errores (Siempre al final)
aplicacion.use(manejadorErrores);

export default aplicacion;
